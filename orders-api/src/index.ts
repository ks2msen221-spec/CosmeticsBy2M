import { createClient } from '@supabase/supabase-js';
import { buildPushPayload } from '@block65/webcrypto-web-push';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

// Helper pour formater les notifications de commande selon le statut
function getOrderStatusMessage(orderId: string, status: string): { title: string; body: string } {
  const shortId = orderId.length > 8 ? orderId.substring(0, 8).toUpperCase() : orderId.toUpperCase();
  
  switch (status) {
    case 'confirmed':
      return {
        title: 'Commande validée — 2M Cosmetics',
        body: `Votre commande #${shortId} a été confirmée avec succès. Préparation en cours à Dakar !`
      };
    case 'processing':
      return {
        title: 'Préparation en cours — 2M Cosmetics',
        body: `Vos soins de la commande #${shortId} sont actuellement préparés dans nos ateliers.`
      };
    case 'shipped':
      return {
        title: 'Colis expédié — 2M Cosmetics',
        body: `Votre commande #${shortId} est en cours de livraison avec notre coursier.`
      };
    case 'delivered':
      return {
        title: 'Colis livré — 2M Cosmetics',
        body: `Votre commande #${shortId} a été remise. Nous vous souhaitons une merveilleuse routine de soins !`
      };
    case 'cancelled':
      return {
        title: 'Commande annulée — 2M Cosmetics',
        body: `Votre commande #${shortId} a été annulée.`
      };
    default:
      return {
        title: 'Mise à jour commande — 2M Cosmetics',
        body: `Le statut de votre commande #${shortId} est désormais : ${status}.`
      };
  }
}

// Fonction interne d'envoi Web Push utilisant Web Crypto & clés VAPID
async function sendPushToUser(
  supabase: any,
  userId: string,
  payload: { title: string; body: string; url?: string; orderId?: string },
  env: Env
): Promise<{ sent: number; failed: number; reason?: string }> {
  if (!env.VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID_PRIVATE_KEY non configurée dans les variables secrètes Cloudflare');
    return { sent: 0, failed: 0, reason: 'VAPID_PRIVATE_KEY_MISSING' };
  }

  const publicKey = env.VAPID_PUBLIC_KEY || 'BHNVJAKkcVuafbEFcOPsjCV0oHc34aRvr9gG6lZgUFiFKV0J1Uyi4l76J4LaI2RTf-1q097P6pEJdk_GA3W0Gfk';
  const subject = env.VAPID_SUBJECT || 'mailto:contact@2m-cosmetics.com';

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, reason: 'NO_SUBSCRIPTIONS' };
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      const pushMessage = {
        data: JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          url: payload.url || '/compte/commandes',
          orderId: payload.orderId || null
        })
      };

      const pushPayload = await buildPushPayload(pushMessage, pushSubscription, {
        subject,
        publicKey,
        privateKey: env.VAPID_PRIVATE_KEY
      });

      const response = await fetch(sub.endpoint, {
        method: 'POST',
        headers: pushPayload.headers,
        body: pushPayload.body
      });

      if (response.ok || response.status === 201) {
        sent++;
      } else {
        failed++;
        console.warn(`[Push] Réponse ${response.status} pour subscription ${sub.id}`);
        // Nettoyage automatique des abonnements expirés (404/410)
        if (response.status === 404 || response.status === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    } catch (err) {
      failed++;
      console.error(`[Push] Erreur d'envoi pour subscription ${sub.id}:`, err);
    }
  }

  return { sent, failed };
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
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '');

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Configuration serveur incomplète (clés Supabase manquantes)`);
      return jsonResponse({ error: 'Configuration serveur incomplète' }, 500);
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Authentification commune par JWT Bearer
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

    // ==========================================
    // ROUTE 1 : CRÉATION DE COMMANDE
    // ==========================================
    if (request.method === 'POST' && (pathname === '/api/orders' || pathname === '/orders')) {
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
          return jsonResponse({ error: 'Impossible de créer la commande, veuillez réessayer.' }, 400);
        }

        const duration = Date.now() - startTime;
        console.info(`[${requestId}] Commande ${data.order_id} créée en ${duration}ms pour ${user.id}`);

        // Déclencher une notification push de confirmation de commande si abonné
        ctx.waitUntil(
          sendPushToUser(
            supabase,
            user.id,
            {
              title: 'Commande enregistrée — 2M Cosmetics',
              body: `Votre commande #${data.order_id.substring(0, 8).toUpperCase()} a bien été reçue. Merci de votre confiance !`,
              url: '/compte/commandes',
              orderId: data.order_id
            },
            env
          )
        );

        return jsonResponse({
          success: true,
          order_id: data.order_id,
          status: data.status,
          subtotal_cents: data.subtotal_cents,
          shipping_fee_cents: data.shipping_fee_cents,
          total_cents: data.total_cents
        }, 201);

      } catch (err: any) {
        console.error(`[${requestId}] Erreur inattendue:`, err);
        return jsonResponse({ error: 'Impossible de créer la commande, veuillez réessayer.' }, 500);
      }
    }

    // ==========================================
    // ROUTE 2 : ENVOI DE NOTIFICATION DE CHANGEMENT DE STATUT COMMANDE
    // ==========================================
    if (request.method === 'POST' && (pathname === '/api/push/notify' || pathname === '/push/notify')) {
      let body: any;
      try {
        body = await request.json();
      } catch (e) {
        return jsonResponse({ error: 'Format JSON invalide' }, 400);
      }

      const { order_id, new_status, custom_title, custom_body } = body;

      if (!order_id || !new_status) {
        return jsonResponse({ error: '"order_id" et "new_status" sont obligatoires.' }, 400);
      }

      // Vérifier le rôle de l'utilisateur (doit être admin pour notifier d'autres commandes)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const isAdmin = roleData?.role === 'admin';

      // Récupérer la commande pour obtenir l'ID client
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('id', order_id)
        .single();

      if (orderErr || !orderData) {
        return jsonResponse({ error: 'Commande introuvable.' }, 404);
      }

      // Seul l'admin ou le propriétaire de la commande peut déclencher la notification
      if (!isAdmin && orderData.user_id !== user.id) {
        return jsonResponse({ error: 'Action non autorisée.' }, 403);
      }

      const { title: defaultTitle, body: defaultBody } = getOrderStatusMessage(order_id, new_status);
      const title = custom_title || defaultTitle;
      const notificationBody = custom_body || defaultBody;

      const pushResult = await sendPushToUser(
        supabase,
        orderData.user_id,
        {
          title,
          body: notificationBody,
          url: '/compte/commandes',
          orderId: order_id
        },
        env
      );

      return jsonResponse({
        success: true,
        order_id,
        status: new_status,
        push_sent: pushResult.sent,
        push_failed: pushResult.failed,
        reason: pushResult.reason || null
      });
    }

    // ==========================================
    // ROUTE 3 : TEST DE NOTIFICATION PUSH POUR L'UTILISATEUR ACTUEL
    // ==========================================
    if (request.method === 'POST' && (pathname === '/api/push/test' || pathname === '/push/test')) {
      const pushResult = await sendPushToUser(
        supabase,
        user.id,
        {
          title: '2M Cosmetics — Test Push Réussi 🌟',
          body: 'Votre appareil est correctement configuré pour recevoir les alertes de commandes et de livraisons !',
          url: '/compte/commandes'
        },
        env
      );

      return jsonResponse({
        success: true,
        user_id: user.id,
        push_sent: pushResult.sent,
        push_failed: pushResult.failed,
        reason: pushResult.reason || null
      });
    }

    // ==========================================
    // ROUTE 4 : DIFFUSION / BROADCAST PROMOTIONS (EXTENSIBLE POUR PLUS TARD)
    // ==========================================
    if (request.method === 'POST' && (pathname === '/api/push/broadcast' || pathname === '/push/broadcast')) {
      // Réservé à l'administrateur
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role !== 'admin') {
        return jsonResponse({ error: 'Action réservée aux administrateurs.' }, 403);
      }

      let body: any;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Format JSON invalide' }, 400);
      }

      const { title, message, url: targetUrl } = body;
      if (!title || !message) {
        return jsonResponse({ error: '"title" et "message" sont requis.' }, 400);
      }

      // Structure d'envoi groupé
      const { data: allSubs } = await supabase
        .from('push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth');

      let totalSent = 0;
      let totalFailed = 0;

      if (allSubs && allSubs.length > 0 && env.VAPID_PRIVATE_KEY) {
        for (const sub of allSubs) {
          try {
            const pushPayload = await buildPushPayload(
              {
                data: JSON.stringify({
                  title,
                  body: message,
                  icon: '/icon-192.png',
                  badge: '/icon-192.png',
                  url: targetUrl || '/produits'
                })
              },
              {
                endpoint: sub.endpoint,
                expirationTime: null,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              },
              {
                subject: env.VAPID_SUBJECT || 'mailto:contact@2m-cosmetics.com',
                publicKey: env.VAPID_PUBLIC_KEY || 'BHNVJAKkcVuafbEFcOPsjCV0oHc34aRvr9gG6lZgUFiFKV0J1Uyi4l76J4LaI2RTf-1q097P6pEJdk_GA3W0Gfk',
                privateKey: env.VAPID_PRIVATE_KEY
              }
            );

            const res = await fetch(sub.endpoint, {
              method: 'POST',
              headers: pushPayload.headers,
              body: pushPayload.body
            });

            if (res.ok || res.status === 201) totalSent++;
            else totalFailed++;
          } catch {
            totalFailed++;
          }
        }
      }

      return jsonResponse({
        success: true,
        broadcast_sent: totalSent,
        broadcast_failed: totalFailed
      });
    }

    return jsonResponse({ error: 'Route non trouvée ou méthode non autorisée' }, 404);
  }
};
