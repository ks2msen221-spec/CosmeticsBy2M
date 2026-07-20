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
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

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
        <span className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-4">Erreur 404</span>
        <h2 className="text-3xl font-serif italic mb-4">Soin Introuvable</h2>
        <p className="text-xs text-black/50 max-w-md mx-auto mb-8">
          Le produit demandé n'existe pas ou n'est plus répertorié dans nos comptoirs de soins Maison 2M.
        </p>
        <Link 
          to="/" 
          className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all inline-block"
        >
          Retour au catalogue
        </Link>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumbs */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-[#9A8C73] flex items-center gap-1">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          {product.category && (
            <>
              <Link to={`/categorie/${product.category.slug}`} className="hover:text-[#9A8C73]">
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
            <div className="aspect-[4/5] bg-white border border-black/5 relative overflow-hidden flex items-center justify-center shadow-sm">
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
                <span className="absolute top-4 left-4 bg-red-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-3 py-1">
                  En rupture de stock
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
                    className={`w-20 h-20 bg-white border cursor-pointer overflow-hidden transition-all p-1 ${selectedImage === img ? 'border-[#9A8C73] scale-95 shadow-sm' : 'border-black/5 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Aperçu ${index + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Premium Product Specifications */}
          <div className="space-y-8 bg-white border border-black/5 p-8 md:p-10 shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#9A8C73]"></div>

            {/* Brand and Rating */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                {product.brand ? (
                  <Link 
                    to={`/marque/${product.brand.slug}`}
                    className="text-[10px] uppercase tracking-[0.25em] text-[#9A8C73] font-bold hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A8C73] font-bold">Maison 2M Cosmetics</span>
                )}

                {averageRating && (
                  <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-black/5 py-1 px-2.5">
                    <div className="flex gap-0.5">{getRatingStars(Math.round(Number(averageRating)))}</div>
                    <span className="text-[10px] font-mono font-bold text-black/60">({reviews.length})</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif italic text-black/90 leading-tight">
                {product.name}
              </h1>

              {/* Price Tag */}
              <div className="pt-2 border-b border-black/5 pb-4 flex justify-between items-baseline">
                <span className="text-2xl font-mono font-bold text-[#1A1A1A]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[10px] text-black/40 font-mono">TVA Incluse / Dakar</span>
              </div>
            </div>

            {/* Availability details & Local note */}
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center gap-2 text-black/80">
                <Package className="w-4 h-4 text-[#9A8C73]" />
                <span className="font-semibold">Disponibilité :</span>
                {product.stock > 0 ? (
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 border border-green-100 rounded text-[11px]">
                    En stock à Dakar ({product.stock} unités)
                  </span>
                ) : (
                  <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 border border-red-100 rounded text-[11px]">
                    Rupture temporaire
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-black/80">
                <ShieldCheck className="w-4 h-4 text-[#9A8C73]" />
                <span className="font-semibold">Garantie 2M :</span>
                <span className="text-black/60 text-[11px]">100% Authentique, testé dermatologiquement.</span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Action */}
            {product.stock > 0 ? (
              <div className="space-y-4 pt-2 border-t border-b border-black/5 pb-6">
                <span className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold block">Sélectionner la quantité :</span>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-black/10 rounded-sm bg-[#FAF9F6] self-start sm:self-auto h-12 shadow-sm">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-4 h-full text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none border-r border-black/5 flex items-center justify-center text-sm"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-5 font-mono text-xs font-bold text-black min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-4 h-full text-black/60 hover:text-black hover:bg-black/[0.02] transition-colors font-bold cursor-pointer select-none border-l border-black/5 flex items-center justify-center text-sm"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Ajouter au Panier
                  </button>
                </div>

                {addedFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-green-50 border border-green-200 text-green-800 text-[11px] flex items-center gap-2 rounded-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Soin ajouté au panier ! ({quantity} {quantity > 1 ? 'unités' : 'unité'})</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="py-4 px-4 border border-red-100 bg-red-50 text-red-800 text-[10px] uppercase tracking-widest font-extrabold text-center rounded-sm">
                Produit temporairement indisponible
              </div>
            )}

            {/* Read-only / Catalogue mode Info Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-500/10 text-amber-800 text-xs flex gap-3 rounded">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] uppercase tracking-wider font-extrabold mb-1">Mode d'exploration exclusif</strong>
                <p className="text-[10px] text-amber-900/80 leading-normal">
                  Nous peaufinons l'expérience de paiement en ligne. La commande et la livraison à domicile seront déployées très prochainement.
                </p>
              </div>
            </div>

            {/* Specs Switchable Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-black/5 text-[10px] uppercase tracking-wider font-bold">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2.5 px-1 cursor-pointer transition-colors relative ${activeTab === 'desc' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Description
                  {activeTab === 'desc' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9A8C73]"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('ing')}
                  className={`pb-2.5 px-4 cursor-pointer transition-colors relative ${activeTab === 'ing' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Ingrédients Bio-actifs
                  {activeTab === 'ing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9A8C73]"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('allergens')}
                  className={`pb-2.5 px-4 cursor-pointer transition-colors relative ${activeTab === 'allergens' ? 'text-black font-extrabold' : 'text-black/40 hover:text-black'}`}
                >
                  Allergènes & Tolérance
                  {activeTab === 'allergens' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9A8C73]"></div>}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-black/70 leading-relaxed font-light min-h-[100px]">
                {activeTab === 'desc' && (
                  <p>{product.description}</p>
                )}
                {activeTab === 'ing' && (
                  <div className="space-y-3">
                    <p className="font-serif italic text-black/80">{product.ingredients || 'Aucun ingrédient chimique de synthèse. Formule 100% pure.'}</p>
                    <span className="text-[9px] uppercase tracking-widest text-[#9A8C73] font-bold flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" />
                      Actifs botaniques pressés à froid
                    </span>
                  </div>
                )}
                {activeTab === 'allergens' && (
                  <div className="space-y-3">
                    <p className="text-red-800 font-serif italic">{product.allergens || 'Zéro allergène majeur. Adapté aux peaux les plus sensibles, à tendance atopique ou hyperpigmentées.'}</p>
                    <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Usage externe uniquement.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Existing Customer Reviews Section */}
        <div className="mt-20 border-t border-black/5 pt-16">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A8C73] font-bold block mb-2">Comptoir des Retours d'Expérience</span>
            <h2 className="text-2xl font-serif italic mb-2">L'avis de notre Club Privé</h2>
            <p className="text-xs text-black/50 mb-10">Consultez les commentaires d'autres clients 2M Cosmetics authentifiés de Dakar.</p>

            {reviews.length === 0 ? (
              <div className="border border-dashed border-black/10 bg-white p-8 text-center text-xs italic text-black/50">
                Aucun avis n'a encore été publié pour ce soin de prestige. Soyez l'un des premiers à laisser votre retour lors du lancement commercial.
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-black/5 bg-white p-6 shadow-sm flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-black/5 flex items-center justify-center text-[#9A8C73] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-serif italic font-bold text-black/80">{review.user_name}</span>
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
