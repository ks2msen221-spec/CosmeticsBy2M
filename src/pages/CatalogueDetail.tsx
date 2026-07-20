import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Catalogue, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Printer, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function CatalogueDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <span className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-4">Erreur 404</span>
        <h2 className="text-3xl font-serif italic mb-4">Collection Introuvable</h2>
        <p className="text-xs text-black/50 max-w-md mx-auto mb-8">
          Le catalogue indépendant ou la sélection demandée n'existe pas chez 2M Cosmetics.
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-[#9A8C73] flex items-center gap-1">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">{catalogue.name}</span>
        </div>
      </div>

      {/* Catalogue Header Details */}
      <div className="bg-white border-b border-black/5 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-[#9A8C73]" />
              Catalogue Édition Spéciale
            </span>
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 text-black/90">
              {catalogue.name}
            </h1>
            <p className="text-sm text-black/60 leading-relaxed font-light">
              {catalogue.description || "Sélection exclusive de formulations cosmétiques élaborées pour répondre aux exigences dermatologiques les plus pointues."}
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to={`/catalogue/${catalogue.slug}/print`}
              className="px-6 py-4 border border-black/15 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-all flex items-center gap-2.5 shadow-sm bg-white"
            >
              <Printer className="w-4 h-4" />
              Version Imprimable (PDF)
            </Link>
          </div>
        </div>
      </div>

      {/* Catalogue Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/40 font-bold pb-2 border-b border-black/5">
          <span>{products.length} {products.length > 1 ? 'soins répertoriés' : 'soin répertorié'}</span>
          <span>Sénégal</span>
        </div>

        {products.length === 0 ? (
          <div className="border border-black/5 bg-white p-16 text-center shadow-sm max-w-xl mx-auto">
            <Sparkles className="w-8 h-8 text-[#9A8C73]/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-lg mb-2">Catalogue vide</h3>
            <p className="text-xs text-black/50 max-w-sm mx-auto mb-6">
              Aucun produit n'est actuellement rattaché à cette sélection. Nos équipes sont en train de mettre à jour le catalogue.
              </p>
            <Link to="/" className="px-6 py-2.5 bg-black text-white text-[10px] uppercase tracking-widest font-bold">
              Retourner à l'accueil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
