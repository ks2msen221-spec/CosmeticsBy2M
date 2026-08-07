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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
      return jsonResponse({ error: 'Configuration serveur incomplète (clés Supabase manquantes)' }, 500);
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
      return jsonResponse({
        error: 'Non autorisé : Session expirée ou invalide. Veuillez vous reconnecter.',
        details: authError?.message
      }, 401);
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Format JSON invalide' }, 400);
    }

    const { items, address_id, payment_method_code, transaction_reference } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonResponse({ error: 'La liste d\'articles ("items") est requise et ne doit pas être vide.' }, 400);
    }

    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        return jsonResponse({ error: 'Chaque article doit posséder un "product_id" valide.' }, 400);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return jsonResponse({ error: 'La quantité demandée pour chaque article doit être un entier strictement positif.' }, 400);
      }
    }

    if (!address_id || typeof address_id !== 'string') {
      return jsonResponse({ error: 'L\'identifiant d\'adresse ("address_id") est requis.' }, 400);
    }

    const validPaymentMethods = ['cod', 'wave', 'om'];
    if (!payment_method_code || !validPaymentMethods.includes(payment_method_code)) {
      return jsonResponse({ error: 'Le moyen de paiement ("payment_method_code") doit être l\'un des suivants : "cod", "wave", ou "om".' }, 400);
    }

    try {
      // 1. Résoudre le mode de paiement (code texte -> ligne réelle payment_methods, avec son id UUID)
      const { data: paymentMethodData, error: paymentMethodError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('code', payment_method_code)
        .eq('is_active', true)
        .single();

      if (paymentMethodError || !paymentMethodData) {
        return jsonResponse({ error: 'Ce moyen de paiement est indisponible ou inactif.' }, 400);
      }

      // 2. Vérifier l'adresse de livraison et son propriétaire
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', address_id)
        .single();

      if (addressError || !addressData) {
        return jsonResponse({ error: 'Adresse de livraison introuvable ou invalide.', details: addressError?.message }, 400);
      }

      if (addressData.user_id !== user.id) {
        return jsonResponse({ error: 'Sécurité : Cette adresse ne correspond pas à votre compte utilisateur.' }, 403);
      }

      const zoneId = addressData.shipping_zone_id;
      if (!zoneId) {
        return jsonResponse({ error: 'L\'adresse sélectionnée n\'est associée à aucune zone de livraison.' }, 400);
      }

      // 3. Récupérer la zone de livraison et son tarif réel (fee_cents)
      const { data: zoneData, error: zoneError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('id', zoneId)
        .eq('is_active', true)
        .single();

      if (zoneError || !zoneData) {
        return jsonResponse({ error: 'Zone de livraison introuvable ou inactive.', details: zoneError?.message }, 400);
      }

      // 4. Récupérer les produits réels et leurs prix officiels (price_cents)
      const productIds = items.map((item: any) => item.product_id);
      const { data: dbProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError || !dbProducts) {
        return jsonResponse({ error: 'Erreur lors de la récupération des produits du catalogue.', details: productsError?.message }, 500);
      }

      const productMap = new Map<string, any>();
      for (const p of dbProducts) {
        productMap.set(p.id, p);
      }

      // 5. Validation stricte : existence, activation, stock, calcul du sous-total (en centimes/FCFA direct)
      let calculatedSubtotalCents = 0;

      for (const item of items) {
        const dbProduct = productMap.get(item.product_id);

        if (!dbProduct) {
          return jsonResponse({ error: `Le produit avec l'identifiant "${item.product_id}" n'existe pas dans notre catalogue.` }, 400);
        }

        if (dbProduct.is_active === false) {
          return jsonResponse({ error: `Le produit "${dbProduct.name}" est temporairement indisponible.` }, 400);
        }

        if (dbProduct.stock_quantity < item.quantity) {
          return jsonResponse({
            error: `Stock insuffisant pour "${dbProduct.name}". Stock restant : ${dbProduct.stock_quantity}, quantité demandée : ${item.quantity}.`
          }, 400);
        }

        calculatedSubtotalCents += dbProduct.price_cents * item.quantity;
      }

      // 6. Frais de livraison réels depuis la base (fee_cents = montant direct en FCFA)
      let shippingFeeCents = Number(zoneData.fee_cents ?? 0);
      if (calculatedSubtotalCents >= 50000) {
        shippingFeeCents = 0; // Livraison gratuite au-delà de 50 000 FCFA
      }

      const totalCents = calculatedSubtotalCents + shippingFeeCents;

      const orderStatus = payment_method_code === 'cod' ? 'confirmed' : 'awaiting_verification';

      // 7. Créer la commande avec les VRAIS noms de colonnes
      const { data: newOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shipping_address_id: address_id,
          shipping_zone_id: zoneId,
          shipping_fee_cents: shippingFeeCents,
          total_cents: totalCents,
          payment_method_id: paymentMethodData.id,
          payment_reference: transaction_reference || null,
          status: orderStatus
        })
        .select()
        .single();

      if (orderInsertError || !newOrder) {
        return jsonResponse({ error: 'Impossible d\'enregistrer la commande.', details: orderInsertError?.message }, 500);
      }

      // 8. Lignes de commande (order_items n'a pas de colonne total_price, uniquement unit_price_cents)
      const orderItemsToInsert = items.map((item: any) => {
        const dbProduct = productMap.get(item.product_id);
        return {
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price_cents: dbProduct.price_cents
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsInsertError) {
        await supabase.from('orders').delete().eq('id', newOrder.id);
        return jsonResponse({ error: 'La commande n\'a pas pu être finalisée lors de l\'enregistrement des articles.', details: itemsInsertError?.message }, 500);
      }

      // 9. Décrémenter le stock réel (stock_quantity)
      for (const item of items) {
        const dbProduct = productMap.get(item.product_id);
        const updatedStock = dbProduct.stock_quantity - item.quantity;

        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock_quantity: updatedStock })
          .eq('id', item.product_id);

        if (stockUpdateError) {
          console.error(`Warning: Failed to decrement stock for product ${item.product_id}:`, stockUpdateError.message);
        }
      }

      // 10. Vider le panier serveur de l'utilisateur
      const { error: cartCleanupError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (cartCleanupError) {
        console.error('Warning: Active cart items clean up failed:', cartCleanupError.message);
      }

      return jsonResponse({
        success: true,
        order_id: newOrder.id,
        status: newOrder.status,
        subtotal_cents: calculatedSubtotalCents,
        shipping_fee_cents: shippingFeeCents,
        total_cents: totalCents
      }, 201);

    } catch (err: any) {
      return jsonResponse({ error: 'Une erreur interne est survenue lors de l\'enregistrement de votre commande.', details: err.message }, 500);
    }
  }
};