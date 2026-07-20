import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Info, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cartItems, loading, subtotal, totalQuantity, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#FAF9F6] pb-24 selection:bg-[#9A8C73]/20">
      
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-[#9A8C73] transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3 text-black/20" />
          <span className="text-black/80">Mon Panier</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <header className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-2">
            Maison 2M Cosmetics — Sénégal
          </span>
          <h1 className="text-4xl font-serif italic text-black/90">Votre Panier de Soins</h1>
          <p className="text-xs text-black/50 font-light mt-2">
            Récapitulatif de vos intentions d'achat avant validation par notre service dermatologique de Dakar.
          </p>
        </header>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-black/5 bg-white p-16 text-center max-w-2xl mx-auto shadow-sm"
          >
            <ShoppingBag className="w-12 h-12 text-[#9A8C73]/30 mx-auto mb-6" />
            <h2 className="text-2xl font-serif italic mb-3">Votre panier est vide</h2>
            <p className="text-xs text-black/50 font-light leading-relaxed max-w-md mx-auto mb-8">
              Vous n'avez pas encore sélectionné de formulation. Explorez nos collections d'exceptions et nos soins hautement concentrés pour révéler la beauté de votre peau.
            </p>
            <div className="h-[1px] w-12 bg-black/10 mx-auto mb-8"></div>
            <Link 
              to="/" 
              className="inline-block px-10 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-[10px] uppercase tracking-widest font-bold hover:bg-[#9A8C73] hover:text-[#1A1A1A] transition-all duration-300 shadow-md"
            >
              Découvrir nos soins
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex justify-between items-center pb-3 border-b border-black/5 text-[10px] uppercase tracking-widest text-black/40 font-bold">
                <span>Soins sélectionnés ({totalQuantity})</span>
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

                  return (
                    <motion.div 
                      key={item.product_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-black/5 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-6 relative group"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-30 bg-[#FAF9F6] border border-black/5 overflow-hidden flex items-center justify-center shrink-0 self-center sm:self-start">
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
                                <span className="text-[9px] uppercase tracking-wider text-[#9A8C73] font-bold">
                                  {product.brand.name}
                                </span>
                              )}
                              <h3 className="font-serif italic text-base md:text-lg text-black/90 hover:text-[#9A8C73] transition-colors leading-tight">
                                {product ? (
                                  <Link to={`/produit/${product.slug}`}>{product.name}</Link>
                                ) : (
                                  "Formulation en cours de chargement..."
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
                            {product && product.stock < item.quantity && (
                              <span className="text-red-600 font-bold">Stock max atteint ({product.stock})</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Line Total actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-black/5 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-black/10 rounded-sm bg-[#FAF9F6]">
                            <button 
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="px-2.5 py-1 text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none text-xs"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 font-mono text-xs font-bold text-black min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="px-2.5 py-1 text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none text-xs"
                              disabled={product ? item.quantity >= product.stock : false}
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

              {/* Secure Checkout and Local Notes */}
              <div className="flex items-center gap-2.5 text-black/50 font-mono text-[9px] pt-4">
                <ShieldCheck className="w-4 h-4 text-[#9A8C73]" />
                <span>Base de données cryptée Supabase • Authentification RLS de bout en bout.</span>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="space-y-6">
              
              <div className="bg-white border border-black/5 p-6 md:p-8 shadow-sm relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#9A8C73]"></div>

                <h3 className="text-xs uppercase tracking-widest text-black/40 font-bold border-b border-black/5 pb-3 mb-6">
                  Synthèse de Commande
                </h3>

                {/* Subtotal row */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-black/60">
                    <span>Articles ({totalQuantity} unités) :</span>
                    <span className="font-mono font-bold text-black/80">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-black/60">
                    <span>Frais d'expédition :</span>
                    {subtotal >= 50000 ? (
                      <span className="text-green-700 font-bold uppercase text-[10px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Gratuit</span>
                    ) : (
                      <span className="font-mono font-bold text-black/80">3 500 FCFA</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-black/5 space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-black/80">Estimation totale :</span>
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

                {/* Authentication Warning / Context */}
                {!user && (
                  <div className="mt-6 p-4 bg-[#FAF9F6] border border-black/5 text-black/60 text-[10px] flex gap-2.5 leading-relaxed rounded-sm">
                    <Info className="w-4 h-4 text-[#9A8C73] shrink-0 mt-0.5" />
                    <span>
                      Vous commandez en tant que <strong>Visiteur</strong>. Votre panier sera fusionné en toute sécurité avec votre compte dès que vous vous connecterez.
                    </span>
                  </div>
                )}

                {/* Main Action buttons */}
                <div className="space-y-3 mt-8">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-4 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    Passer la Commande
                  </button>

                  <Link 
                    to="/" 
                    className="w-full py-3.5 border border-black/15 text-[10px] uppercase tracking-widest font-bold hover:bg-black/[0.02] transition-all flex items-center justify-center gap-2 bg-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Continuer mes Achats
                  </Link>
                </div>
              </div>

              {/* Service Details Callout */}
              <div className="border border-black/5 bg-white p-6 rounded-sm text-xs space-y-4">
                <h4 className="font-serif italic font-bold text-black/80 border-b border-black/5 pb-2">Des questions sur vos formulations ?</h4>
                <div className="flex items-start gap-2.5 text-black/60 leading-relaxed text-[11px]">
                  <HelpCircle className="w-4 h-4 text-[#9A8C73] shrink-0 mt-0.5" />
                  <p>
                    Nos pharmaciens-dermatologues sont disponibles à nos comptoirs à Dakar pour adapter chaque routine à votre épiderme. Appelez-nous au +221 77 123 45 67.
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
