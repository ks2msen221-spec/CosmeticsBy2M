import { createClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

// Expression régulière pour vérifier le format UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || (url.pathname !== '/api/orders' && url.pathname !== '/orders')) {
      return jsonResponse({ error: 'Route non trouvée ou méthode non autorisée' }, 404);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Configuration serveur incomplète (clés Supabase manquantes)`);
      return jsonResponse({ error: 'Configuration serveur incomplète' }, 500);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: "Non autorisé : Token d'authentification absent ou invalide" }, 401);
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error(`[${requestId}] Échec d'authentification JWT:`, authError?.message);
      return jsonResponse({
        error: 'Non autorisé : Session expirée ou invalide. Veuillez vous reconnecter.'
      }, 401);
    }

    console.info(`[${requestId}] Début du traitement de la commande pour l'utilisateur ${user.id}`);

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Format JSON invalide' }, 400);
    }

    const { items, address_id, payment_method_code, transaction_reference } = body;

    // 1. Validation de la présence et de la taille du panier
    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonResponse({ error: 'La liste d\'articles ("items") est requise et ne doit pas être vide.' }, 400);
    }

    if (items.length > 100) {
      return jsonResponse({ error: 'Le panier ne peut pas contenir plus de 100 articles.' }, 400);
    }

    // 2. Validation de chaque article
    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string' || !UUID_REGEX.test(item.product_id)) {
        return jsonResponse({ error: 'Chaque article doit posséder un "product_id" au format UUID valide.' }, 400);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return jsonResponse({ error: 'La quantité demandée pour chaque article doit être un entier strictement positif.' }, 400);
      }
    }

    // 3. Validation de l'adresse (UUID)
    if (!address_id || typeof address_id !== 'string' || !UUID_REGEX.test(address_id)) {
      return jsonResponse({ error: 'L\'identifiant d\'adresse ("address_id") doit être un UUID valide.' }, 400);
    }

    // 4. Validation du moyen de paiement
    const validPaymentMethods = ['cod', 'wave', 'om'];
    if (!payment_method_code || !validPaymentMethods.includes(payment_method_code)) {
      return jsonResponse({ error: 'Le moyen de paiement ("payment_method_code") doit être l\'un des suivants : "cod", "wave", ou "om".' }, 400);
    }

    // 5. Validation facultative de la référence de transaction
    if (transaction_reference !== undefined && transaction_reference !== null) {
      if (typeof transaction_reference !== 'string') {
        return jsonResponse({ error: 'La référence de transaction ("transaction_reference") doit être une chaîne de caractères.' }, 400);
      }
      if (transaction_reference.length > 100) {
        return jsonResponse({ error: 'La référence de transaction ne doit pas dépasser 100 caractères.' }, 400);
      }
    }

    try {
      // Appel de la fonction RPC Supabase atomique
      const { data, error: rpcError } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_address_id: address_id,
        p_payment_method_code: payment_method_code,
        p_items: items,
        p_transaction_reference: transaction_reference || null
      });

      if (rpcError) {
        console.error(`[${requestId}] Erreur RPC create_order:`, rpcError);

        const msg = rpcError.message || '';

        // Filtrage des erreurs pour ne jamais renvoyer les détails techniques SQL bruts au client
        if (msg.includes('INSUFFICIENT_STOCK')) {
          return jsonResponse({ error: 'Stock insuffisant pour un ou plusieurs articles sélectionnés.' }, 400);
        }
        if (msg.includes('INVALID_ADDRESS')) {
          return jsonResponse({ error: 'Adresse de livraison invalide ou non autorisée.' }, 400);
        }
        if (msg.includes('INVALID_PAYMENT_METHOD')) {
          return jsonResponse({ error: 'Le moyen de paiement sélectionné est indisponible.' }, 400);
        }
        if (msg.includes('INVALID_SHIPPING_ZONE')) {
          return jsonResponse({ error: 'La zone de livraison associée est indisponible.' }, 400);
        }
        if (msg.includes('PRODUCT_UNAVAILABLE') || msg.includes('PRODUCT_NOT_FOUND')) {
          return jsonResponse({ error: 'Un ou plusieurs produits de votre panier sont indisponibles.' }, 400);
        }
        if (msg.includes('CART_LIMIT_EXCEEDED')) {
          return jsonResponse({ error: 'Le panier dépasse la limite maximale de 100 articles.' }, 400);
        }
        if (msg.includes('AMOUNT_LIMIT_EXCEEDED')) {
          return jsonResponse({ error: 'Le montant total de la commande dépasse la limite autorisée.' }, 400);
        }

        return jsonResponse({ error: 'Impossible de créer la commande, veuillez réessayer.' }, 400);
      }

      const duration = Date.now() - startTime;
      console.info(`[${requestId}] Commande ${data.order_id} créée avec succès en ${duration}ms pour l'utilisateur ${user.id}`);

      return jsonResponse({
        success: true,
        order_id: data.order_id,
        status: data.status,
        subtotal_cents: data.subtotal_cents,
        shipping_fee_cents: data.shipping_fee_cents,
        total_cents: data.total_cents
      }, 201);

    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] Erreur inattendue après ${duration}ms:`, err);
      return jsonResponse({ error: 'Impossible de créer la commande, veuillez réessayer.' }, 500);
    }
  }
};