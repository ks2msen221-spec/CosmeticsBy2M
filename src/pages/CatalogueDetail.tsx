import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Catalogue, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Printer, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageSEO } from '../utils/seo';

export default function CatalogueDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO(
    catalogue ? `${catalogue.name} | 2M Cosmetics Dakar` : "Collection de Soins | 2M Cosmetics Dakar",
    catalogue 
      ? `Découvrez la sélection ${catalogue.name} chez 2M Cosmetics à Dakar au Sénégal : ${catalogue.description?.slice(0, 120)}... Ingrédients clairs et livraison rapide.`
      : "Parcourez nos collections et sélections de cosmétiques à Dakar au Sénégal."
  );

  useEffect(() => {
    async function loadCatalogueAndProducts() {
      if (!slug) return;
      setLoading(true);
      try {
        const cat = await catalogService.getCatalogueBySlug(slug);
        setCatalogue(cat);
        
        if (cat) {
          const prods = await catalogService.getProducts({ catalogue_id: cat.id });
          setProducts(prods);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading catalogue products", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadCatalogueAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-32 bg-white border border-black/5 p-8 rounded-sm">
            <div className="h-4 bg-gray-200 w-1/4 mb-3"></div>
            <div className="h-6 bg-gray-200 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block mb-4">Collection Introuvable</span>
        <h1 className="text-3xl font-serif italic mb-4">Cette collection n'est plus répertoriée</h1>
        <p className="text-xs text-black/60 max-w-md mx-auto mb-8 font-light">
          La sélection demandée a été déplacée ou n'est plus disponible.
        </p>
        <Link 
          to="/collections" 
          className="px-8 py-3.5 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all inline-block rounded-sm"
        >
          Je découvre toutes nos collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors shrink-0">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to="/collections" className="hover:text-brand-gold transition-colors shrink-0">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-black/80 shrink-0">{catalogue.name}</span>
        </div>
      </div>

      {/* Catalogue Header Details */}
      <div className="bg-white border-b border-black/5 py-10 sm:py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-brand-gold" />
              Sélection thématique
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic mb-4 sm:mb-5 text-black/90">
              {catalogue.name}
            </h1>
            <p className="text-xs sm:text-sm text-black/65 leading-relaxed font-light">
              {catalogue.description || "Une sélection de soins choisis pour prendre soin de votre peau au quotidien avec simplicité et efficacité."}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to={`/catalogue/${catalogue.slug}/print`}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 border border-black/15 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-noir hover:text-brand-cream transition-all flex items-center justify-center gap-2.5 shadow-xs bg-white rounded-sm min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-brand-gold" />
              Consulter la version imprimable
            </Link>
          </div>
        </div>
      </div>

      {/* Catalogue Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8 text-[10px] uppercase tracking-widest text-black/50 font-bold pb-3 border-b border-black/5">
          <span>{products.length} {products.length > 1 ? 'produits disponibles' : 'produit disponible'}</span>
          <span>Disponible à Dakar</span>
        </div>

        {products.length === 0 ? (
          <div className="border border-black/5 bg-white p-8 sm:p-14 text-center shadow-sm max-w-xl mx-auto rounded-sm">
            <Sparkles className="w-8 h-8 text-brand-gold/60 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl mb-2 text-black/90">Sélection en cours de mise à jour</h3>
            <p className="text-xs text-black/60 max-w-sm mx-auto mb-6 font-light leading-relaxed">
              Nous ajoutons actuellement de nouveaux produits à cette collection. Explorez nos autres gammes en attendant.
            </p>
            <Link to="/produits" className="px-6 py-3.5 bg-brand-noir text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-colors inline-block rounded-sm min-h-[44px]">
              Je découvre tous les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
