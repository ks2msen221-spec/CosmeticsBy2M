import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { Search as SearchIcon, Home, Sparkles, AlertCircle } from 'lucide-react';
import { usePageSEO } from '../utils/seo';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  usePageSEO(
    query ? `Recherche : "${query}" | Maison 2M Cosmetics Dakar` : "Rechercher un Soin | Maison 2M Cosmetics Dakar",
    "Trouvez les soins, sérums et rituels botaniques adaptés à votre peau chez Maison 2M Cosmetics à Dakar."
  );
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const results = await catalogService.getProducts({ search: query });
        setProducts(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    
    performSearch();
  }, [query]);

  const handleSuggestionClick = (term: string) => {
    setSearchParams({ q: term });
  };

  const suggestions = ['Moringa', 'Baobab', 'Solaire', 'Karité', 'Sérum', 'Dakar'];

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <span>&gt;</span>
          <span className="text-black/80">Recherche</span>
        </div>
      </div>

      {/* Main Search Body */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        
        {/* Title & Query Display */}
        <div className="mb-12 border-b border-black/5 pb-8">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold block mb-2">
            Résultats de Recherche
          </span>
          <h1 className="text-3xl md:text-4xl font-serif italic text-black/90 flex items-center gap-3">
            <SearchIcon className="w-6 h-6 text-brand-gold" />
            {query.trim() ? (
              <>Recherche pour : <span className="text-brand-gold">“{query}”</span></>
            ) : (
              "Explorez nos Formulations"
            )}
          </h1>
          
          {/* Quick Suggestions list */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold mr-2">Suggestions populaires :</span>
            {suggestions.map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestionClick(term)}
                className={`px-3 py-1 text-[11px] font-mono border rounded-full transition-all cursor-pointer ${query.toLowerCase() === term.toLowerCase() ? 'bg-brand-noir text-brand-cream border-brand-noir' : 'bg-white border-black/5 text-black/60 hover:border-brand-gold/40 hover:text-black'}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="border border-black/5 bg-white p-6 space-y-4 animate-pulse rounded">
                <div className="aspect-[4/5] bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
                <div className="h-6 bg-gray-200 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : !query.trim() ? (
          <div className="bg-white border border-black/5 p-12 text-center max-w-xl mx-auto shadow-sm">
            <SearchIcon className="w-8 h-8 text-brand-taupe/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-lg mb-2">Rechercher une formulation</h3>
            <p className="text-xs text-black/50 leading-relaxed mb-6">
              Saisissez le nom d'un produit, d'un actif botanique (Moringa, Baobab, etc.) ou une problématique de peau pour découvrir nos soins adaptés.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-black/5 p-16 text-center max-w-2xl mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-500/70 mx-auto mb-4" />
            <h3 className="font-serif italic text-lg mb-2">Aucun résultat trouvé</h3>
            <p className="text-xs text-black/50 leading-relaxed mb-6">
              Nous n'avons pas trouvé de soin correspondant à <span className="font-bold">“{query}”</span> dans nos comptoirs. Essayez d'élargir votre recherche ou d'utiliser l'une de nos suggestions ci-dessus.
            </p>
            <div className="h-[1px] w-12 bg-black/10 mx-auto mb-6"></div>
            <Link 
              to="/" 
              className="inline-block px-8 py-3 bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer"
            >
              Retourner à l'accueil
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/40 font-bold pb-2 border-b border-black/5">
              <span>{products.length} {products.length > 1 ? 'soins trouvés' : 'soin trouvé'}</span>
              <span>Dakar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
