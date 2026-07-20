import { createClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Helper to return JSON responses with standard CORS headers
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
    // 1. Handle CORS Preflight Options Request
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

    // 2. Validate Endpoint Route and Method
    const url = new URL(request.url);
    if (request.method !== 'POST' || (url.pathname !== '/api/orders' && url.pathname !== '/orders')) {
      return jsonResponse({ error: 'Route non trouvée ou méthode non autorisée' }, 404);
    }

    // 3. Verify Env Bindings
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse({ error: 'Configuration serveur incomplète (clés Supabase manquantes)' }, 500);
    }

    // 4. Initialize Supabase client using Service Role to bypass Row-Level Security safely for admin actions
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 5. Verify Supabase JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Non autorisé : Token d\'authentification absent ou invalide' }, 401);
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ 
        error: 'Non autorisé : Session expirée ou invalide. Veuillez vous reconnecter.',
        details: authError?.message 
      }, 401);
    }

    // 6. Parse and Validate Request Body
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Format JSON invalide' }, 400);
    }

    const { items, address_id, payment_method_code } = body;

    // Validate Input Fields Presence and Types
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
      // 7. Verify and Retrieve Shipping Address
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', address_id)
        .single();

      if (addressError || !addressData) {
        return jsonResponse({ 
          error: 'Adresse de livraison introuvable ou invalide.', 
          details: addressError?.message 
        }, 400);
      }

      // Security check: Make sure this address belongs to the authenticated user
      if (addressData.user_id !== user.id) {
        return jsonResponse({ error: 'Sécurité : Cette adresse ne correspond pas à votre compte utilisateur.' }, 403);
      }

      // 8. Retrieve Shipping Zone and Delivery Fees
      // We check for 'shipping_zone_id' or alternative database column naming
      const zoneId = addressData.shipping_zone_id || addressData.zone_id;
      if (!zoneId) {
        return jsonResponse({ error: 'L\'adresse sélectionnée n\'est associée à aucune zone de livraison.' }, 400);
      }

      const { data: zoneData, error: zoneError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('id', zoneId)
        .single();

      if (zoneError || !zoneData) {
        return jsonResponse({ 
          error: 'Zone de livraison introuvable ou inactive.', 
          details: zoneError?.message 
        }, 400);
      }

      // 9. Fetch Live Product Details & Recalculate Prices
      const productIds = items.map((item: any) => item.product_id);
      const { data: dbProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError || !dbProducts) {
        return jsonResponse({ 
          error: 'Erreur lors de la récupération des détails des soins depuis le catalogue.', 
          details: productsError?.message 
        }, 500);
      }

      // Create a dictionary of database products for fast lookup
      const productMap = new Map<string, any>();
      for (const p of dbProducts) {
        productMap.set(p.id, p);
      }

      // 10. Perform strict validation checks: existence, activation, and stock availability
      let calculatedSubtotal = 0;

      for (const item of items) {
        const dbProduct = productMap.get(item.product_id);
        
        if (!dbProduct) {
          return jsonResponse({ error: `Le soin demandé avec l'identifiant "${item.product_id}" n'existe pas dans notre catalogue.` }, 400);
        }

        // Check if product is deactivated/archived
        const isActive = dbProduct.active !== false && dbProduct.is_active !== false;
        if (!isActive) {
          return jsonResponse({ error: `Le soin "${dbProduct.name}" est temporairement indisponible ou désactivé.` }, 400);
        }

        // Check stock availability
        if (dbProduct.stock < item.quantity) {
          return jsonResponse({ 
            error: `Stock insuffisant pour le soin "${dbProduct.name}". Stock restant : ${dbProduct.stock}, quantité demandée : ${item.quantity}.` 
          }, 400);
        }

        // Recalculate subtotal using the official database price (ignoring any client inputs)
        calculatedSubtotal += dbProduct.price * item.quantity;
      }

      // 11. Calculate final shipping fee based on total amount (e.g. free delivery over 50,000 FCFA)
      let shippingFee = Number(zoneData.fee ?? zoneData.price ?? zoneData.cost ?? 0);
      if (calculatedSubtotal >= 50000) {
        shippingFee = 0; // Free shipping threshold matched
      }

      const calculatedTotal = calculatedSubtotal + shippingFee;

      // Determine order initial status based on the selected payment method
      // 'cod' (Cash on Delivery) -> 'confirmed'
      // 'wave' or 'om' (Orange Money) -> 'awaiting_verification' (requires manual admin approval)
      const orderStatus = payment_method_code === 'cod' ? 'confirmed' : 'awaiting_verification';

      // 12. Create the Order Entry
      const { data: newOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          address_id: address_id,
          payment_method_code: payment_method_code,
          shipping_fee: shippingFee,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          status: orderStatus,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderInsertError || !newOrder) {
        return jsonResponse({ 
          error: 'Impossible d\'enregistrer la commande dans notre base de données.', 
          details: orderInsertError?.message 
        }, 500);
      }

      // 13. Create the Order Line Items (order_items)
      const orderItemsToInsert = items.map((item: any) => {
        const dbProduct = productMap.get(item.product_id);
        return {
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: dbProduct.price,
          total_price: dbProduct.price * item.quantity,
          created_at: new Date().toISOString()
        };
      });

      const { error: itemsInsertError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsInsertError) {
        // Rollback created order to prevent orphaned records on partial failure
        await supabase.from('orders').delete().eq('id', newOrder.id);
        return jsonResponse({ 
          error: 'La commande n\'a pas pu être finalisée lors de l\'enregistrement des articles.', 
          details: itemsInsertError?.message 
        }, 500);
      }

      // 14. Decrement the inventory stock for the purchased items
      for (const item of items) {
        const dbProduct = productMap.get(item.product_id);
        const updatedStock = dbProduct.stock - item.quantity;
        
        const { error: stockUpdateError } = await supabase
          .from('products')
          .update({ stock: updatedStock })
          .eq('id', item.product_id);

        if (stockUpdateError) {
          console.error(`Warning: Failed to decrement stock for product ${item.product_id}:`, stockUpdateError.message);
        }
      }

      // 15. Clean up user's active cart items now that order is successfully completed
      const { error: cartCleanupError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (cartCleanupError) {
        console.error('Warning: Active cart items clean up failed:', cartCleanupError.message);
      }

      // 16. Return Success Response with Created Order Details
      return jsonResponse({
        success: true,
        order_id: newOrder.id,
        status: newOrder.status,
        subtotal: calculatedSubtotal,
        shipping_fee: shippingFee,
        total: calculatedTotal
      }, 201);

    } catch (err: any) {
      return jsonResponse({ 
        error: 'Une erreur interne est survenue lors de l\'enregistrement de votre commande.', 
        details: err.message 
      }, 500);
    }
  }
};
