/**
 * Offline Sync and Background Sync manager for 2M Cosmetics PWA
 */

export interface PendingOrder {
  id: string;
  created_at: string;
  items: Array<{ product_id: string; quantity: number }>;
  address_id: string;
  payment_method_code: string;
  transaction_reference?: string;
  user_id: string;
  jwt_token: string;
  status: 'pending' | 'syncing' | 'failed';
}

const DB_NAME = '2m_cosmetics_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_orders';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB non supporté'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enregistre une commande hors ligne en file d'attente IndexedDB
 */
export async function queueOfflineOrder(order: Omit<PendingOrder, 'id' | 'created_at' | 'status'>): Promise<string> {
  const pendingId = `offline_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderRecord: PendingOrder = {
    ...order,
    id: pendingId,
    created_at: new Date().toISOString(),
    status: 'pending'
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(orderRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Déclencher l'enregistrement de la Background Sync API si disponible
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ('sync' in reg) {
          await (reg as any).sync.register('sync-offline-orders');
          console.log('[BackgroundSync] Tâche "sync-offline-orders" enregistrée');
        }
      } catch (syncErr) {
        console.warn('[BackgroundSync] Impossible d\'enregistrer le tag de sync:', syncErr);
      }
    }

    return pendingId;
  } catch (err) {
    console.error('[OfflineSync] Erreur sauvegarde IndexedDB:', err);
    // Fallback localStorage
    const existing = JSON.parse(localStorage.getItem('2m_pending_offline_orders') || '[]');
    existing.push(orderRecord);
    localStorage.setItem('2m_pending_offline_orders', JSON.stringify(existing));
    return pendingId;
  }
}

/**
 * Récupère toutes les commandes en attente de synchronisation
 */
export async function getPendingOfflineOrders(): Promise<PendingOrder[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return JSON.parse(localStorage.getItem('2m_pending_offline_orders') || '[]');
  }
}

/**
 * Supprime une commande de la file d'attente après succès
 */
export async function removePendingOfflineOrder(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  const existing = JSON.parse(localStorage.getItem('2m_pending_offline_orders') || '[]');
  const updated = existing.filter((o: PendingOrder) => o.id !== id);
  localStorage.setItem('2m_pending_offline_orders', JSON.stringify(updated));
}
