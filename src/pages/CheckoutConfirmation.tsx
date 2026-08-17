import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Hourglass, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ClipboardList,
  HeartHandshake,
  Truck,
  Bell,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePageSEO } from '../utils/seo';
import { useAuth } from '../context/AuthContext';
import { 
  isPushSupported, 
  getNotificationPermission, 
  getCurrentPushSubscription, 
  subscribeToPushNotifications 
} from '../lib/pushNotifications';

export default function CheckoutConfirmation() {
  usePageSEO(
    "Confirmation de Commande | 2M Cosmetics Dakar",
    "Votre commande chez 2M Cosmetics a bien été enregistrée. Suivez l'état de votre commande et la livraison à Dakar."
  );

  const { user, isMocked } = useAuth();
  const location = useLocation();
  const { status, orderId, total, paymentMethod } = location.state || {
    status: 'awaiting_verification',
    orderId: 'ord_default',
    total: 0,
    paymentMethod: 'wave'
  };

  const isConfirmed = status === 'confirmed';
  const isOfflinePending = status === 'offline_pending';

  // Push subscription state
  const [canShowPushOptin, setCanShowPushOptin] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    async function checkPush() {
      if (isPushSupported()) {
        const perm = getNotificationPermission();
        const sub = await getCurrentPushSubscription();
        if (!sub && perm !== 'denied') {
          setCanShowPushOptin(true);
        } else if (sub) {
          setPushSubscribed(true);
        }
      }
    }
    checkPush();
  }, []);

  const handleSubscribePush = async () => {
    setPushLoading(true);
    try {
      const res = await subscribeToPushNotifications(user?.id || 'guest', isMocked);
      if (res.success) {
        setPushSubscribed(true);
        setCanShowPushOptin(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPushLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div className="min-h-screen bg-brand-cream py-8 sm:py-16 flex items-center justify-center selection:bg-brand-taupe/20 px-4 sm:px-6">
      <div className="max-w-2xl w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-black/5 p-6 sm:p-8 md:p-12 shadow-sm rounded-sm relative overflow-hidden"
        >
          {/* Accent Gold Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gold"></div>

          <div className="text-center mb-6 sm:mb-8">
            {isConfirmed ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-green-200">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            ) : isOfflinePending ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-blue-200">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-amber-200">
                <Hourglass className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
              </div>
            )}

            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-2">
              2M Cosmetics Dakar
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-black/90 mb-3 sm:mb-4">
              {isConfirmed 
                ? 'Merci pour votre commande !' 
                : isOfflinePending
                ? 'Commande enregistrée (Hors Ligne)'
                : 'Commande en cours de validation'}
            </h1>
            
            <div className="h-[1px] w-12 bg-brand-gold mx-auto mb-4 sm:mb-6"></div>

            <p className="text-xs sm:text-sm text-black/70 font-light leading-relaxed max-w-lg mx-auto">
              {isConfirmed ? (
                <strong className="text-green-700 font-semibold text-sm sm:text-base block mb-2">
                  Votre commande a bien été validée et entre en préparation.
                </strong>
              ) : isOfflinePending ? (
                <strong className="text-blue-700 font-semibold text-sm sm:text-base block mb-2">
                  Votre commande est en attente de synchronisation réseau.
                </strong>
              ) : (
                <strong className="text-amber-700 font-semibold text-sm sm:text-base block mb-2">
                  Votre paiement est en cours de vérification par notre équipe.
                </strong>
              )}
              {isConfirmed 
                ? "Notre équipe prépare vos produits avec soin. Notre livreur prendra contact avec vous par téléphone avant la livraison."
                : isOfflinePending
                ? "Vos articles sont sauvegardés localement. Dès que votre appareil retrouvera du réseau, la commande sera automatiquement transmise à nos équipes."
                : "Nous procédons à la vérification de la transaction avec l'opérateur. Dès confirmation, nous préparons immédiatement votre commande pour son expédition."
              }
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-brand-cream border border-black/5 p-4 sm:p-6 rounded-sm space-y-4 mb-6 sm:mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-2">
              Détails de votre commande
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs font-light">
              <div>
                <span className="text-black/40 block">Numéro de commande :</span>
                <span className="font-mono text-black/80 font-bold break-all">{orderId}</span>
              </div>
              
              <div>
                <span className="text-black/40 block">Date :</span>
                <span className="text-black/80 font-mono">
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="text-black/40 block">Moyen de paiement :</span>
                <span className="text-black/80 font-medium">
                  {paymentMethod === 'cod' ? 'Paiement à la livraison' : paymentMethod === 'wave' ? 'Wave Sénégal' : 'Orange Money'}
                </span>
              </div>

              <div>
                <span className="text-black/40 block">Montant total :</span>
                <span className="text-black/90 font-mono font-bold">
                  {total > 0 ? formatPrice(total) : 'En cours de calcul'}
                </span>
              </div>
            </div>
          </div>

          {/* Opt-in Push Notifications */}
          {canShowPushOptin && (
            <div className="bg-amber-50/70 border border-amber-500/20 p-4 sm:p-5 rounded-sm mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-noir uppercase tracking-wider">Suivre ma livraison par notification</h4>
                  <p className="text-[11px] text-black/60 mt-0.5">Recevez une alerte sur votre téléphone dès que le colis part avec le coursier.</p>
                </div>
              </div>
              <button
                onClick={handleSubscribePush}
                disabled={pushLoading}
                className="w-full sm:w-auto px-4 py-2.5 bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir text-[9px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[40px]"
              >
                {pushLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                {pushLoading ? 'Activation...' : 'M\'alerter en direct'}
              </button>
            </div>
          )}

          {pushSubscribed && (
            <div className="bg-emerald-50/70 border border-emerald-500/20 p-3 sm:p-4 rounded-sm mb-6 sm:mb-8 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vous recevrez une alerte en direct lors de la livraison de votre commande.</span>
            </div>
          )}

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link 
              to="/compte/commandes" 
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 bg-brand-noir text-brand-cream text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm min-h-[44px]"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Je consulte mes commandes
            </Link>

            <Link 
              to="/produits" 
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 border border-black/15 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all flex items-center justify-center gap-2 rounded-sm min-h-[44px]"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-gold" />
              Je continue mes achats
            </Link>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-black/5 flex items-center gap-3 text-black/40 text-[9px] font-mono justify-center">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>2M Cosmetics Dakar • Service Client</span>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
