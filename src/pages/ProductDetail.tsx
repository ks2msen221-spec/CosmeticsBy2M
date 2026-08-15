import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Product, Review } from '../types/catalog';
import { 
  ChevronRight, 
  Home, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Info, 
  Leaf, 
  Package, 
  Calendar,
  User,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { usePageSEO } from '../utils/seo';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'ing' | 'allergens'>('desc');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  usePageSEO(
    product ? `${product.name} | Maison 2M Cosmetics Dakar` : "Soin d'Exception | Maison 2M Cosmetics",
    product 
      ? `${product.name} à Dakar : ${product.description.slice(0, 140)}... Livraison rapide à Dakar.`
      : "Découvrez notre sélection de cosmétiques naturels et dermo-soins haut de gamme à Dakar chez Maison 2M Cosmetics."
  );

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 3000);
  };

  useEffect(() => {
    async function loadProductAndReviews() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await catalogService.getProductBySlug(slug);
        setProduct(prod);
        
        if (prod) {
          const revs = await catalogService.getProductReviews(prod.id);
          setReviews(revs);
          if (prod.images && prod.images.length > 0) {
            setSelectedImage(prod.images[0]);
          }
        }
      } catch (err) {
        console.error("Error loading product detail data", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductAndReviews();
  }, [slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-gray-100 rounded"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="h-10 bg-gray-200 w-3/4"></div>
            <div className="h-4 bg-gray-200 w-1/3"></div>
            <div className="h-24 bg-gray-100 w-full"></div>
            <div className="h-10 bg-gray-200 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block mb-4">Soin Introuvable</span>
        <h1 className="text-3xl font-serif italic mb-4">Ce soin n'est plus répertorié</h1>
        <p className="text-xs text-black/60 max-w-md mx-auto mb-8 font-light">
          Le produit demandé est actuellement indisponible ou a été déplacé dans nos collections.
        </p>
        <Link 
          to="/catalogue/nouveautes" 
          className="px-8 py-3.5 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all inline-block rounded-sm"
        >
          Découvrir tous nos soins
        </Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumbs */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link to={`/categorie/${product.category.slug}`} className="hover:text-brand-gold transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-black/80 truncate max-w-[150px] md:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Visual Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-white border border-black/5 relative overflow-hidden flex items-center justify-center shadow-sm rounded-sm">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif italic text-black/20 text-xs">Maison 2M Cosmetics</span>
              )}

              {product.stock <= 0 && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-[8px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-xs">
                  Momentanément indisponible
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 bg-white border cursor-pointer overflow-hidden transition-all p-1 rounded-sm ${selectedImage === img ? 'border-brand-gold scale-95 shadow-sm' : 'border-black/5 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Aperçu ${index + 1} - ${product.name}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Reassurance Callouts on Mobile/Desktop */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3 bg-white border border-black/5 rounded-sm flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/80 block">Livraison 24h</span>
                  <span className="text-[10px] text-black/55 font-light">Partout à Dakar à votre porte</span>
                </div>
              </div>
              <div className="p-3 bg-white border border-black/5 rounded-sm flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/80 block">100% Authentique</span>
                  <span className="text-[10px] text-black/55 font-light">Testé sous contrôle dermatologique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Product Specifications */}
          <div className="space-y-8 bg-white border border-black/5 p-8 md:p-10 shadow-sm relative rounded-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>

            {/* Brand and Rating */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                {product.brand ? (
                  <Link 
                    to={`/marque/${product.brand.slug}`}
                    className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold hover:underline transition-colors"
                  >
                    Maison {product.brand.name}
                  </Link>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold">Maison 2M Cosmetics</span>
                )}

                {averageRating && (
                  <div className="flex items-center gap-1.5 bg-brand-cream border border-black/5 py-1 px-2.5 rounded-sm">
                    <div className="flex gap-0.5">{getRatingStars(Math.round(Number(averageRating)))}</div>
                    <span className="text-[10px] font-mono font-bold text-black/60">({reviews.length} avis)</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif italic text-black/90 leading-tight">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="pt-2 border-b border-black/5 pb-4">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-brand-noir">
                      {formatPrice(product.price)}
                    </span>
                    {product.stock <= 0 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Bientôt de retour
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-black/40 font-mono">TTC • Dakar, Sénégal</span>
                </div>

                {/* Low stock notice */}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded inline-block">
                    Dernières pièces disponibles ({product.stock} restantes)
                  </div>
                )}
              </div>
            </div>

            {/* Availability details & Local note */}
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center gap-2 text-black/80">
                <Package className="w-4 h-4 text-brand-gold" />
                <span className="font-semibold">Disponibilité :</span>
                {product.stock > 0 ? (
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 rounded text-[11px]">
                    En stock à Dakar ({product.stock} unités prêtes à être livrées)
                  </span>
                ) : (
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 border border-red-100 rounded text-[11px]">
                    Momentanément épuisé
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-black/80">
                <HeartHandshake className="w-4 h-4 text-brand-gold" />
                <span className="font-semibold">Paiement :</span>
                <span className="text-black/65 text-[11px]">Espèces à la livraison, Wave ou Orange Money en toute sécurité.</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Action */}
            {product.stock > 0 ? (
              <div className="space-y-4 pt-2 border-t border-b border-black/5 pb-6">
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block">Choisir la quantité :</span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-black/10 rounded-sm bg-brand-cream self-start sm:self-auto h-12 shadow-sm">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-4 h-full text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none border-r border-black/5 flex items-center justify-center text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                      aria-label="Diminuer la quantité"
                    >
                      -
                    </button>
                    
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) {
                          setQuantity(1);
                        } else {
                          setQuantity(Math.min(product.stock, val));
                        }
                      }}
                      className="w-14 text-center font-mono text-xs font-bold text-black bg-transparent outline-none border-none p-0"
                      aria-label="Quantité de produit"
                    />

                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-4 h-full text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none border-l border-black/5 flex items-center justify-center text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stock}
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 h-12 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 rounded-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Ajouter à mon rituel de soins
                  </button>
                </div>

                {addedFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 rounded-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Le soin a bien été ajouté à votre panier ({quantity} {quantity > 1 ? 'flacons' : 'flacon'}).</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-b border-black/5 pb-6">
                <button
                  disabled
                  className="w-full h-12 bg-gray-200 text-gray-500 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-not-allowed rounded-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Momentanément en rupture
                </button>
              </div>
            )}

            {/* Beauty Advisor Ritual Tip */}
            <div className="p-4 bg-brand-cream border border-brand-gold/20 text-brand-noir text-xs flex gap-3 rounded-sm">
              <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[10px] uppercase tracking-wider font-extrabold mb-1 text-brand-gold">Le Conseil de votre Conseillère Beauté</strong>
                <p className="text-[11px] text-black/70 leading-relaxed font-light">
                  Pour décupler les bienfaits de cette formule, appliquez-la sur peau propre et légèrement tiède. Massez délicatement du bout des doigts par mouvements circulaires ascendants.
                </p>
              </div>
            </div>

            {/* Specs Switchable Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-black/5 text-[10px] uppercase tracking-wider font-bold">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2.5 px-2 cursor-pointer transition-colors relative ${activeTab === 'desc' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Description & Bénéfices
                  {activeTab === 'desc' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('ing')}
                  className={`pb-2.5 px-4 cursor-pointer transition-colors relative ${activeTab === 'ing' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Ingrédients & Botanique
                  {activeTab === 'ing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('allergens')}
                  className={`pb-2.5 px-4 cursor-pointer transition-colors relative ${activeTab === 'allergens' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Tolérance & Précautions
                  {activeTab === 'allergens' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"></div>}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-black/75 leading-relaxed font-light min-h-[100px]">
                {activeTab === 'desc' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'ing' && (
                  <div className="space-y-3">
                    <p className="font-serif italic text-black/85 leading-relaxed">{product.ingredients || 'Formule pure, sans ingrédients controversés.'}</p>
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold flex items-center gap-1.5 pt-1">
                      <Leaf className="w-3.5 h-3.5" />
                      Extraits végétaux rigoureusement sourcés
                    </span>
                  </div>
                )}
                {activeTab === 'allergens' && (
                  <div className="space-y-3">
                    <p className="text-black/80 font-light leading-relaxed">{product.allergens || 'Sans parfum artificiel ni agent irritant. Convient parfaitement aux peaux sensibles ou exposées au climat dakarois.'}</p>
                    <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Usage cosmétique externe. Conserver à l'abri de la lumière directe et de la forte chaleur.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Customer Reviews Section */}
        <div className="mt-20 border-t border-black/5 pt-16">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold block mb-2">Témoignages & Avis</span>
            <h2 className="text-2xl font-serif italic mb-2 text-black/90">L'avis de notre communauté à Dakar</h2>
            <p className="text-xs text-black/60 mb-10 font-light">Découvrez les retours authentiques de clientes et clients ayant adopté ce soin dans leur routine quotidienne.</p>

            {reviews.length === 0 ? (
              <div className="border border-dashed border-black/10 bg-white p-8 text-center text-xs italic text-black/50 rounded-sm">
                Ce soin n'a pas encore recueilli d'avis. Partagez votre expérience avec nous après votre première commande !
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-black/5 bg-white p-6 shadow-sm flex gap-4 rounded-sm">
                    <div className="w-10 h-10 rounded-full bg-brand-cream border border-black/5 flex items-center justify-center text-brand-gold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-serif italic font-bold text-black/85">{review.user_name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{getRatingStars(review.rating)}</div>
                          <span className="text-[9px] text-black/40 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-black/70 leading-relaxed font-light">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
