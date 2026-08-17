import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setIsDismissed(false);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-900 text-amber-50 px-4 py-2.5 text-xs fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-sm shadow-lg border border-amber-700/50 flex items-center justify-between gap-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="font-medium text-[11px] leading-tight">Mode hors ligne actif</p>
              <p className="text-[10px] text-amber-200/80 font-light">Vous consultez les pages enregistrées sur votre appareil.</p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-200 hover:text-white p-1 transition-colors"
            aria-label="Fermer la notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-900 text-emerald-50 px-4 py-2.5 text-xs fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 rounded-sm shadow-lg border border-emerald-700/50 flex items-center justify-between gap-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <p className="font-medium text-[11px] leading-tight">Connexion rétablie</p>
              <p className="text-[10px] text-emerald-200/80 font-light">Toutes les fonctionnalités de la boutique sont disponibles.</p>
            </div>
          </div>
          <button
            onClick={() => setShowReconnected(false)}
            className="text-emerald-200 hover:text-white p-1 transition-colors"
            aria-label="Fermer la notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
