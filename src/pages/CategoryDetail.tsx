import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Category, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Sparkles, Filter, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageSEO } from '../utils/seo';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO(
    category ? `${category.name} | Soins & Cosmétiques Dakar | Maison 2M` : "Catégorie de Soins | Maison 2M Cosmetics",
    category 
      ? `Découvrez notre collection ${category.name} à Dakar : ${category.description.slice(0, 140)}... Livraison rapide et paiement sécurisé.`
      : "Parcourez nos gammes de soins cosmétiques haut de gamme adaptées aux peaux sénégalaises."
  );

  useEffect(() => {
    async function loadCategoryAndProducts() {
      if (!slug) return;
      setLoading(true);
      try {
        const cat = await catalogService.getCategoryBySlug(slug);
        setCategory(cat);
        
        if (cat) {
          const prods = await catalogService.getProducts({ category_id: cat.id });
          setProducts(prods);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading category products", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCategoryAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-20 bg-white border border-black/5 p-8 rounded-sm">
            <div className="h-4 bg-gray-200 w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block mb-4">Catégorie non trouvée</span>
        <h1 className="text-3xl font-serif italic mb-4">Cette catégorie est introuvable</h1>
        <p className="text-xs text-black/60 max-w-md mx-auto mb-8 font-light">
          La gamme demandée a été réorganisée ou n'est plus disponible actuellement.
        </p>
        <Link 
          to="/catalogue/nouveautes" 
          className="px-8 py-3.5 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all inline-block rounded-sm"
        >
          Explorer tout le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">{category.name}</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-black/5 py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[9px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-2">
              Rituel Beauté & Soins Ciblés
            </span>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-5 text-black/90">
              {category.name}
            </h1>
            <p className="text-sm text-black/65 leading-relaxed font-light">
              {category.description || "Une gamme de soins d'exception pensée pour répondre avec douceur et exigence aux besoins de votre peau à Dakar."}
            </p>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Sidebar Filter & Reassurance */}
          <div className="w-full lg:w-1/4 shrink-0 space-y-6">
            <div className="border border-black/5 bg-white p-6 md:p-8 rounded-sm shadow-sm">
              <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold flex items-center gap-1.5 mb-4 pb-2 border-b border-black/5">
                <Filter className="w-3.5 h-3.5" />
                Sélection de Soins
              </span>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-black/80 mb-2">Disponibilité immédiate</h4>
                  <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-sm font-medium">
                    ✓ {products.filter(p => p.stock > 0).length} soin(s) en stock à Dakar
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-black/80 mb-2">Les Promesses Maison 2M</h4>
                  <ul className="space-y-2 text-xs text-black/70 font-light">
                    <li className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>Tolérance dermatologique certifiée</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>Ingrédients botaniques nobles</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>Fini soyeux sans trace blanche</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid Column */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/50 font-bold pb-3 border-b border-black/5">
              <span>{products.length} {products.length > 1 ? 'soins disponibles' : 'soin disponible'}</span>
              <span>Classé par excellence formulatoire</span>
            </div>

            {products.length === 0 ? (
              <div className="border border-black/5 bg-white p-14 text-center shadow-sm rounded-sm">
                <Sparkles className="w-8 h-8 text-brand-gold/60 mx-auto mb-4" />
                <h3 className="font-serif italic text-xl mb-2 text-black/90">Nouvelle Collection en Préparation</h3>
                <p className="text-xs text-black/60 max-w-sm mx-auto mb-6 font-light leading-relaxed">
                  Nos expertes en cosmétologie sélectionnent de nouvelles pépites pour cette gamme. Découvrez en attendant nos soins complémentaires.
                </p>
                <Link to="/catalogue/nouveautes" className="px-6 py-3 bg-brand-noir text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-colors inline-block rounded-sm">
                  Découvrir tous nos soins disponibles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
