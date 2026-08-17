// Configuration VAPID pour les notifications Push PWA 2M Cosmetics
export const VAPID_PUBLIC_KEY = 
  ((import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || 'BHNVJAKkcVuafbEFcOPsjCV0oHc34aRvr9gG6lZgUFiFKV0J1Uyi4l76J4LaI2RTf-1q097P6pEJdk_GA3W0Gfk').trim();

/**
 * Convertit une clé VAPID base64 URL-safe en Uint8Array pour le pushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
