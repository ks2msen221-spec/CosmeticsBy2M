import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Hourglass, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CheckoutConfirmation() {
  const location = useLocation();
  const { status, orderId, total, paymentMethod } = location.state || {
    status: 'awaiting_verification',
    orderId: 'ord_default',
    total: 0,
    paymentMethod: 'wave'
  };

  const isConfirmed = status === 'confirmed';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16 flex items-center justify-center selection:bg-[#9A8C73]/20">
      <div className="max-w-2xl w-full px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-black/5 p-8 md:p-12 shadow-sm rounded-sm relative overflow-hidden"
        >
          {/* Accent Gold Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9A8C73]"></div>

          <div className="text-center mb-8">
            {isConfirmed ? (
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-6 border border-green-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Hourglass className="w-8 h-8 animate-pulse" />
              </div>
            )}

            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-2">
              Statut de la Commande • 2M SÉNÉGAL
            </span>

            <h2 className="text-3xl md:text-4xl font-serif italic text-black/90 mb-4">
              {isConfirmed ? 'Commande Enregistrée' : 'Validation Suspendue'}
            </h2>
            
            <div className="h-[1px] w-12 bg-[#9A8C73] mx-auto mb-6"></div>

            <p className="text-sm text-black/70 font-light leading-relaxed max-w-lg mx-auto">
              {isConfirmed ? (
                <strong className="text-green-700 font-semibold text-base block mb-2">
                  Commande confirmée, vous serez livré prochainement.
                </strong>
              ) : (
                <strong className="text-amber-700 font-semibold text-base block mb-2">
                  Votre paiement est en cours de vérification, vous recevrez une confirmation sous peu.
                </strong>
              )}
              {isConfirmed 
                ? "Nos préparateurs en herboristerie et cosmétique de Dakar emballent actuellement vos soins de prestige. Notre livreur prendra contact par téléphone avant son passage."
                : "Nous attendons la confirmation de l'opérateur mobile pour valider la transaction. Dès réception des fonds sur nos comptes, votre commande sera expédiée immédiatement."
              }
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-[#FAF9F6] border border-black/5 p-6 rounded-sm space-y-4 mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold border-b border-black/5 pb-2">
              Détails de la validation
            </h3>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-light">
              <div>
                <span className="text-black/40 block">Identifiant Commande :</span>
                <span className="font-mono text-black/80 font-bold">{orderId}</span>
              </div>
              
              <div>
                <span className="text-black/40 block">Date de validation :</span>
                <span className="text-black/80 font-mono">
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="text-black/40 block">Mode de Règlement :</span>
                <span className="text-black/80 font-medium">
                  {paymentMethod === 'cod' ? 'Paiement à la livraison' : paymentMethod === 'wave' ? 'Wave Sénégal' : 'Orange Money'}
                </span>
              </div>

              <div>
                <span className="text-black/40 block">Montant final calculé :</span>
                <span className="text-black/90 font-mono font-bold">
                  {total > 0 ? formatPrice(total) : 'En cours de calcul'}
                </span>
              </div>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/compte/commandes" 
              className="w-full sm:w-auto text-center px-8 py-3.5 bg-[#1A1A1A] text-[#FAF9F6] text-[10px] uppercase tracking-widest font-bold hover:bg-[#9A8C73] hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-2 rounded-sm shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Suivre mes commandes
            </Link>

            <Link 
              to="/" 
              className="w-full sm:w-auto text-center px-8 py-3.5 border border-black/15 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#9A8C73]" />
              Retour au catalogue
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 flex items-center gap-3 text-black/40 text-[9px] font-mono justify-center">
            <ShieldCheck className="w-4 h-4 text-[#9A8C73]" />
            <span>2M Cosmetics Sénégal • Service Clientèle Privée</span>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
