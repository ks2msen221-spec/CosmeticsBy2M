import { supabase } from './supabase';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '../config/push';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

// Convert ArrayBuffer to URL-safe Base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Récupère l'abonnement push existant du navigateur
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('[Push] Impossible de récupérer l\'abonnement push:', err);
    return null;
  }
}

/**
 * Abonne le client aux notifications push et enregistre le token dans Supabase
 */
export async function subscribeToPushNotifications(userId: string, isMocked = false): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, error: 'Les notifications push ne sont pas supportées par votre navigateur.' };
  }

  try {
    // 1. Demande de permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { 
        success: false, 
        error: permission === 'denied' 
          ? 'Les notifications ont été bloquées dans les paramètres de votre navigateur.' 
          : 'La permission pour les notifications a été refusée.' 
      };
    }

    // 2. Attendre que le Service Worker soit prêt
    const registration = await navigator.serviceWorker.ready;

    // 3. Récupérer ou créer l'abonnement PushManager
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });
    }

    const p256dhKey = arrayBufferToBase64(subscription.getKey('p256dh'));
    const authKey = arrayBufferToBase64(subscription.getKey('auth'));

    if (!p256dhKey || !authKey) {
      throw new Error('Impossible d\'extraire les clés de chiffrement de l\'abonnement.');
    }

    // 4. Enregistrement dans Supabase pour l'utilisateur
    if (supabase && !isMocked && userId) {
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: p256dhKey,
          auth: authKey,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' });

      if (dbError) {
        console.error('[Push] Erreur d\'enregistrement Supabase:', dbError);
        // Note: ne pas bloquer complètement si la table vient d'être créée
      }
    }

    // Sauvegarde de secours en localStorage pour persistance locale
    localStorage.setItem(`2m_push_sub_${userId}`, JSON.stringify({
      endpoint: subscription.endpoint,
      keys: { p256dh: p256dhKey, auth: authKey },
      subscribed_at: new Date().toISOString()
    }));

    return { success: true, subscription };
  } catch (err: any) {
    console.error('[Push] Échec d\'abonnement push:', err);
    return { success: false, error: err.message || 'Une erreur est survenue lors de l\'activation des notifications.' };
  }
}

/**
 * Désabonne le client des notifications push
 */
export async function unsubscribeFromPushNotifications(userId: string, isMocked = false): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: true };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Supprimer de la table Supabase
      if (supabase && !isMocked) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', endpoint);
      }
    }

    localStorage.removeItem(`2m_push_sub_${userId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Push] Échec de désabonnement push:', err);
    return { success: false, error: err.message || 'Impossible de désactiver les notifications.' };
  }
}

/**
 * Déclenche une notification de test (via le worker ou en direct via le service worker)
 */
export async function triggerTestNotification(title = "2M Cosmetics — Test", body = "Notification reçue avec succès sur votre appareil !"): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: '/compte/commandes',
        dateOfArrival: Date.now()
      },
      vibrate: [200, 100, 200],
      tag: '2m-test-notification'
    } as any);
    return true;
  } catch (e) {
    console.error('[Push] Erreur test notification:', e);
    return false;
  }
}
