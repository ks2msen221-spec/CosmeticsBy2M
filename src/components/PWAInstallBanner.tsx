import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (e.g. within 3 days)
    const dismissedAt = localStorage.getItem('2m_pwa_dismissed_at');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Handler for Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a short moment so it doesn't pop up aggressively on immediate landing
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show after a delay
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('2m_pwa_dismissed_at', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md bg-brand-noir text-brand-cream z-50 p-4 sm:p-5 rounded-sm shadow-2xl border border-brand-gold/30 selection:bg-brand-gold/30"
        role="dialog"
        aria-label="Installer l'application 2M Cosmetics"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-sm bg-brand-cream/10 border border-brand-gold/40 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/icon-192.png" alt="2M Logo" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold block mb-0.5">
                Application 2M Cosmetics
              </span>
              <h4 className="text-xs sm:text-sm font-serif italic text-white font-medium">
                Ajouter à l'écran d'accueil
              </h4>
              <p className="text-[11px] text-white/70 font-light mt-0.5 leading-snug">
                Accès rapide, catalogue hors ligne et navigation instantanée à Dakar.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white p-1 transition-colors -mr-1 -mt-1 cursor-pointer"
            aria-label="Fermer l'invitation d'installation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Step-by-step popup */}
        {showIOSGuide && isIOS && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3.5 pt-3.5 border-t border-white/10 text-xs text-white/80 space-y-2"
          >
            <p className="font-semibold text-brand-gold text-[11px]">Pour installer sur votre iPhone / iPad :</p>
            <div className="space-y-1.5 text-[11px] font-light">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-gold text-brand-noir font-bold text-[9px] flex items-center justify-center shrink-0">1</span>
                <span>Appuyez sur le bouton Partager <Share2 className="w-3 h-3 inline text-brand-gold ml-0.5" /> dans Safari.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-gold text-brand-noir font-bold text-[9px] flex items-center justify-center shrink-0">2</span>
                <span>Sélectionnez <strong className="text-white font-medium">« Sur l'écran d'accueil »</strong> <PlusSquare className="w-3 h-3 inline text-brand-gold ml-0.5" />.</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-brand-gold hover:bg-brand-gold/90 text-brand-noir text-[10px] uppercase tracking-widest font-bold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px]"
          >
            {isIOS ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                {showIOSGuide ? 'Compris' : 'Comment installer'}
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Installer l'application
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 border border-white/15 hover:bg-white/5 text-white/80 text-[10px] uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer min-h-[40px]"
          >
            Plus tard
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
