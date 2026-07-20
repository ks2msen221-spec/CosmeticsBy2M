import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Category, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Sparkles, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <span className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-4">Erreur 404</span>
        <h2 className="text-3xl font-serif italic mb-4">Catégorie Introuvable</h2>
        <p className="text-xs text-black/50 max-w-md mx-auto mb-8">
          La catégorie demandée n'existe pas ou a été retirée de nos comptoirs 2M Cosmetics.
        </p>
        <Link 
          to="/" 
          className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all inline-block"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-[#9A8C73] flex items-center gap-1">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">{category.name}</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-black/5 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold block mb-2">
              Comptoir de Soins
            </span>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 text-black/90">
              {category.name}
            </h1>
            <p className="text-sm text-black/60 leading-relaxed font-light">
              {category.description || "Gamme de produits d'exception, formulés selon les plus hauts standards scientifiques pour magnifier votre beauté naturelle."}
            </p>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Sidebar Filter Column (Desktop only, placeholder to establish structure) */}
          <div className="w-full lg:w-1/4 shrink-0 space-y-6">
            <div className="border border-black/5 bg-white p-6 md:p-8">
              <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold flex items-center gap-1.5 mb-4 pb-2 border-b border-black/5">
                <Filter className="w-3.5 h-3.5 text-[#9A8C73]" />
                Filtre de Soins
              </span>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-black/80 mb-2">Disponibilité</h4>
                  <label className="flex items-center gap-2 text-xs text-black/60 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-black/10 text-[#9A8C73] focus:ring-[#9A8C73]" />
                    <span>En stock à Dakar ({products.filter(p => p.stock > 0).length})</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-black/80 mb-2">Qualités</h4>
                  <ul className="space-y-1 text-xs text-[#9A8C73] font-serif italic">
                    <li>✓ Actifs bio d’Afrique</li>
                    <li>✓ Sans trace blanche</li>
                    <li>✓ Tolérance dermatologique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid Column */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/40 font-bold pb-2 border-b border-black/5">
              <span>{products.length} {products.length > 1 ? 'soins disponibles' : 'soin disponible'}</span>
              <span>Tri : Par défaut</span>
            </div>

            {products.length === 0 ? (
              <div className="border border-black/5 bg-white p-16 text-center shadow-sm">
                <Sparkles className="w-8 h-8 text-[#9A8C73]/40 mx-auto mb-4" />
                <h3 className="font-serif italic text-lg mb-2">Bientôt Disponible</h3>
                <p className="text-xs text-black/50 max-w-sm mx-auto mb-6">
                  Nos dermatologues peaufinent les formulations de cette catégorie. Laissez-nous votre adresse email sur la page d'accueil pour être alerté en exclusivité de leur sortie.
                </p>
                <Link to="/" className="px-6 py-2.5 bg-black text-white text-[10px] uppercase tracking-widest font-bold">
                  Découvrir nos best-sellers
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
