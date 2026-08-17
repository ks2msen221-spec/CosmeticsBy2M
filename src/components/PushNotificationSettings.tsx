import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, AlertCircle, Loader2, Send, Smartphone } from 'lucide-react';
import { 
  isPushSupported, 
  getNotificationPermission, 
  getCurrentPushSubscription, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  triggerTestNotification
} from '../lib/pushNotifications';

interface PushNotificationSettingsProps {
  userId?: string;
  isMocked?: boolean;
}

export default function PushNotificationSettings({ userId = '', isMocked = false }: PushNotificationSettingsProps) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const isSupp = isPushSupported();
      setSupported(isSupp);
      if (!isSupp) {
        setPermission('unsupported');
        return;
      }

      setPermission(getNotificationPermission());
      const sub = await getCurrentPushSubscription();
      setIsSubscribed(!!sub);
    };

    checkStatus();
  }, [userId]);

  const handleToggleSubscription = async () => {
    if (!supported) return;
    setStatusMessage(null);
    setLoading(true);

    try {
      if (isSubscribed) {
        // Désabonnement
        const res = await unsubscribeFromPushNotifications(userId, isMocked);
        if (res.success) {
          setIsSubscribed(false);
          setStatusMessage({
            text: 'Notifications désactivées sur cet appareil.',
            type: 'info'
          });
        } else {
          setStatusMessage({
            text: res.error || 'Erreur lors du désabonnement.',
            type: 'error'
          });
        }
      } else {
        // Abonnement
        const res = await subscribeToPushNotifications(userId, isMocked);
        if (res.success) {
          setIsSubscribed(true);
          setPermission('granted');
          setStatusMessage({
            text: 'Notifications push activées ! Vous recevrez désormais les alertes de livraison en temps réel.',
            type: 'success'
          });
        } else {
          setPermission(getNotificationPermission());
          setStatusMessage({
            text: res.error || 'Impossible d\'activer les notifications.',
            type: 'error'
          });
        }
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Une erreur inattendue est survenue.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setStatusMessage(null);

    try {
      const success = await triggerTestNotification(
        '2M Cosmetics Dakar — Test Réussi 🌟',
        'Votre appareil est prêt à recevoir le suivi en direct de vos commandes à Dakar !'
      );

      if (success) {
        setStatusMessage({
          text: 'Notification de test envoyée avec succès sur votre appareil.',
          type: 'success'
        });
      } else {
        setStatusMessage({
          text: 'Veuillez autoriser les notifications pour recevoir les alertes.',
          type: 'error'
        });
      }
    } catch (e: any) {
      setStatusMessage({
        text: e.message || 'Erreur lors de l\'envoi du test.',
        type: 'error'
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="border border-black/5 bg-white p-5 sm:p-8 rounded-sm shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 shrink-0">
            <BellOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic text-lg text-brand-noir mb-1">Notifications Push PWA</h3>
            <p className="text-xs text-black/50 leading-relaxed">
              Les notifications push ne sont pas prises en charge par ce navigateur. Si vous êtes sur iOS, veillez à installer l'application sur votre écran d'accueil (iOS 16.4+ requis).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black/5 bg-white p-5 sm:p-8 rounded-sm shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isSubscribed ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-taupe/10 text-brand-taupe'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif italic text-lg text-brand-noir">Alertes & Suivi de Livraison</h3>
              <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded font-bold ${
                isSubscribed 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : permission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-black/5 text-black/60'
              }`}>
                {isSubscribed ? 'Actif' : permission === 'denied' ? 'Bloqué' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs text-black/50 mt-1 leading-relaxed max-w-xl">
              Soyez notifié instantanément lors de la validation, de la préparation et du départ de votre coursier à Dakar.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSubscription}
          disabled={loading || permission === 'denied'}
          className={`px-5 py-3 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 rounded-sm shrink-0 min-h-[44px] cursor-pointer ${
            permission === 'denied'
              ? 'bg-black/5 text-black/40 cursor-not-allowed border border-black/10'
              : isSubscribed
              ? 'border border-red-200 text-red-700 hover:bg-red-50'
              : 'bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isSubscribed ? (
            <BellOff className="w-3.5 h-3.5" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
          {loading 
            ? 'Traitement...' 
            : isSubscribed 
            ? 'Désactiver les alertes' 
            : 'Activer les alertes'}
        </button>
      </div>

      {/* Explication en cas de refus dans le navigateur */}
      {permission === 'denied' && (
        <div className="p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-bold">Notifications bloquées dans votre navigateur</p>
            <p className="text-[11px] mt-0.5 text-red-700">
              Pour recevoir les notifications, veuillez cliquer sur l'icône de cadenas ou de réglages à gauche de la barre d'adresse de votre navigateur et autoriser les notifications pour ce site.
            </p>
          </div>
        </div>
      )}

      {/* Message de statut */}
      {statusMessage && (
        <div className={`p-4 text-xs rounded flex items-start gap-2.5 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-500/10 text-emerald-800' 
            : statusMessage.type === 'error'
            ? 'bg-red-50 border border-red-500/10 text-red-800'
            : 'bg-blue-50 border border-blue-500/10 text-blue-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* Option d'envoi de test si abonné */}
      {isSubscribed && (
        <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black/60 bg-brand-cream/40 p-4 rounded-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-gold shrink-0" />
            <span>Vérifier que les notifications s'affichent bien sur cet appareil</span>
          </div>
          <button
            onClick={handleTestNotification}
            disabled={testLoading}
            className="px-4 py-2 border border-black/10 bg-white text-black hover:border-brand-taupe hover:text-brand-taupe text-[9px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[38px]"
          >
            {testLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {testLoading ? 'Envoi...' : 'Envoyer un test'}
          </button>
        </div>
      )}
    </div>
  );
}
