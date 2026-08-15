import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Info, 
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';
import { CONTACT_CONFIG } from '../config/contact';
import { usePageSEO } from '../utils/seo';

export default function Cart() {
  const { cartItems, loading, subtotal, totalQuantity, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  usePageSEO(
    "Mon Panier | 2M Cosmetics Dakar",
    "Consultez vos produits et soins sélectionnés chez 2M Cosmetics Dakar au Sénégal. Livraison rapide à Dakar."
  );

  const [liveStocks, setLiveStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchLiveStocks() {
      if (cartItems.length === 0) return;
      const productIds = cartItems.map(item => item.product_id);
      
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('products')
            .select('id, stock_quantity')
            .in('id', productIds);
          
          if (!error && data) {
            const map: Record<string, number> = {};
            data.forEach((p: any) => {
              map[p.id] = p.stock_quantity ?? 0;
            });
            setLiveStocks(map);
            return;
          }
        }
        
        // Fallback
        const map: Record<string, number> = {};
        cartItems.forEach(item => {
          map[item.product_id] = item.product?.stock ?? 0;
        });
        setLiveStocks(map);
      } catch (err) {
        console.error("Error fetching live stocks for cart items:", err);
      }
    }

    fetchLiveStocks();
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleCheckoutClick = () => {
    // Under App.tsx routing, checkout is protected, so navigating there is safe.
    navigate('/commande');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 bg-white border border-black/5 rounded p-4 flex gap-4">
                  <div className="w-24 bg-gray-200 h-full rounded"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-4 bg-gray-200 w-1/3"></div>
                    <div className="h-6 bg-gray-200 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-white border border-black/5 rounded p-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-24 selection:bg-brand-taupe/20">
      
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3 text-black/20" />
          <span className="text-black/80">Mon Panier</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <header className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-2">
            2M Cosmetics — Dakar
          </span>
          <h1 className="text-4xl font-serif italic text-black/90">Votre Panier</h1>
          <p className="text-xs text-black/60 font-light mt-2 max-w-xl">
            Vérifiez votre sélection de produits avant de valider votre commande. Notre équipe prépare chaque colis avec soin à Dakar.
          </p>
        </header>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-black/5 bg-white p-16 text-center max-w-2xl mx-auto shadow-sm rounded-sm"
          >
            <ShoppingBag className="w-12 h-12 text-brand-gold/40 mx-auto mb-6" />
            <h2 className="text-2xl font-serif italic mb-3 text-black/90">Votre panier est vide</h2>
            <p className="text-xs text-black/60 font-light leading-relaxed max-w-md mx-auto mb-8">
              Vous n'avez pas encore sélectionné de produit. Découvrez notre catalogue de soins formulés simplement pour répondre aux besoins de votre peau.
            </p>
            <div className="h-[1px] w-12 bg-brand-gold/40 mx-auto mb-8"></div>
            <Link 
              to="/produits" 
              className="inline-block px-10 py-4 bg-brand-noir text-brand-cream text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-all duration-300 shadow-md rounded-sm"
            >
              Je découvre les soins
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex justify-between items-center pb-3 border-b border-black/5 text-[10px] uppercase tracking-widest text-black/40 font-bold">
                <span>Articles sélectionnés ({totalQuantity})</span>
                <button 
                  onClick={clearCart}
                  className="hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
                >
                  Vider le panier
                </button>
              </div>

              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const product = item.product;
                  const price = product?.price || 0;
                  const itemTotal = price * item.quantity;
                  const availableStock = liveStocks[item.product_id] !== undefined
                    ? liveStocks[item.product_id]
                    : (product?.stock ?? 0);

                  return (
                    <motion.div 
                      key={item.product_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-black/5 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-6 relative group rounded-sm"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-30 bg-brand-cream border border-black/5 overflow-hidden flex items-center justify-center shrink-0 self-center sm:self-start rounded-sm">
                        {product?.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="font-serif italic text-black/20 text-[10px]">2M</span>
                        )}
                      </div>

                      {/* Item details */}
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              {product?.brand && (
                                <span className="text-[9px] uppercase tracking-wider text-brand-taupe font-bold">
                                  {product.brand.name}
                                </span>
                              )}
                              <h3 className="font-serif italic text-base md:text-lg text-black/90 hover:text-brand-gold transition-colors leading-tight">
                                {product ? (
                                  <Link to={`/produit/${product.slug}`}>{product.name}</Link>
                                ) : (
                                  "Produit en cours de chargement..."
                                )}
                              </h3>
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-black/30 hover:text-red-700 p-1 transition-colors cursor-pointer"
                              title="Retirer l'article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="pt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-black/50 font-mono">
                            <span>Prix unitaire : {formatPrice(price)}</span>
                          </div>

                          {/* Stock limited warning banner under article */}
                          {availableStock < item.quantity && (
                            <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-amber-800">
                              <div className="flex items-center gap-2 text-xs">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  Stock limité : seulement <strong>{availableStock}</strong> disponible(s) (vous en avez <strong>{item.quantity}</strong> dans votre panier)
                                </span>
                              </div>
                              <button
                                onClick={() => updateQuantity(item.product_id, availableStock)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                              >
                                Ajuster à {availableStock}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Quantity and Line Total actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-black/5 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-black/10 rounded-sm bg-brand-cream">
                            <button 
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="px-2.5 py-1 text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 font-mono text-xs font-bold text-black min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="px-2.5 py-1 text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={item.quantity >= availableStock}
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right font-mono">
                            <span className="text-[10px] uppercase text-black/40 block font-bold tracking-wider">Sous-total</span>
                            <span className="font-bold text-black text-sm">{formatPrice(itemTotal)}</span>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Reassurance Footer */}
              <div className="flex items-center gap-2.5 text-black/50 font-mono text-[9px] pt-4">
                <ShieldCheck className="w-4 h-4 text-brand-taupe" />
                <span>Commandes et paiements sécurisés • Service client basé à Dakar.</span>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="space-y-6">
              
              <div className="bg-white border border-black/5 p-6 md:p-8 shadow-sm relative rounded-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>

                <h3 className="text-xs uppercase tracking-widest text-black/40 font-bold border-b border-black/5 pb-3 mb-6">
                  Récapitulatif de Commande
                </h3>

                {/* Subtotal row */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-black/60">
                    <span>Articles ({totalQuantity} {totalQuantity > 1 ? 'unités' : 'unité'}) :</span>
                    <span className="font-mono font-bold text-black/80">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-black/60">
                    <span>Frais de livraison :</span>
                    {subtotal >= 50000 ? (
                      <span className="text-green-700 font-bold uppercase text-[10px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Gratuit</span>
                    ) : (
                      <span className="font-mono font-bold text-black/80">3 500 FCFA</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/5 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-black/80">Total estimé :</span>
                      <span className="text-xl font-mono font-bold text-black">
                        {formatPrice(subtotal + (subtotal >= 50000 ? 0 : 3500))}
                      </span>
                    </div>
                    <span className="text-[9px] text-black/40 block text-right font-mono italic">
                      Calculé en temps réel • TVA Incluse
                    </span>
                  </div>
                </div>

                {/* Info Callout about delivery free threshold */}
                {subtotal < 50000 && (
                  <div className="mt-6 p-3.5 bg-amber-50 border border-amber-500/10 text-amber-800 text-[11px] flex gap-2 rounded-sm leading-relaxed">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Ajoutez encore <strong className="font-mono font-bold">{formatPrice(50000 - subtotal)}</strong> de soins pour bénéficier de la <strong>livraison gratuite</strong> à Dakar !
                    </span>
                  </div>
                )}

                {/* Authentication Info */}
                {!user && (
                  <div className="mt-6 p-4 bg-brand-cream border border-black/5 text-black/60 text-[10px] flex gap-2.5 leading-relaxed rounded-sm">
                    <Info className="w-4 h-4 text-brand-taupe shrink-0 mt-0.5" />
                    <span>
                      Vous commandez en tant que visiteur. Votre panier sera synchronisé lors de votre connexion.
                    </span>
                  </div>
                )}

                {/* Main Action buttons */}
                <div className="space-y-3 mt-8">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-4 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-sm"
                  >
                    Je valide ma commande
                  </button>

                  <Link 
                    to="/" 
                    className="w-full py-3.5 border border-black/15 text-[10px] uppercase tracking-widest font-bold hover:bg-black/[0.02] transition-all flex items-center justify-center gap-2 bg-white rounded-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Je continue mes achats
                  </Link>
                </div>
              </div>

              {/* Service Details Callout */}
              <div className="border border-black/5 bg-white p-6 rounded-sm text-xs space-y-4">
                <h4 className="font-serif italic font-bold text-black/80 border-b border-black/5 pb-2">Des questions sur nos formules ?</h4>
                <div className="flex items-start gap-2.5 text-black/60 leading-relaxed text-[11px]">
                  <HelpCircle className="w-4 h-4 text-brand-taupe shrink-0 mt-0.5" />
                  <p>
                    Notre équipe à Dakar vous conseille avec plaisir pour adapter vos choix à vos besoins. Appelez-nous au <a href={`tel:${CONTACT_CONFIG.phoneRaw}`} className="font-semibold text-black hover:text-brand-gold transition-colors">{CONTACT_CONFIG.phone}</a>.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
