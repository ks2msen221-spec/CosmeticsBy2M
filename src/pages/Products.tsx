import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Category, Brand, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { 
  Sparkles, 
  Home, 
  ChevronRight, 
  Filter, 
  Search as SearchIcon, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePageSEO } from '../utils/seo';

export default function Products() {
  usePageSEO(
    "Tous nos Produits & Soins à Dakar | 2M Cosmetics",
    "Découvrez notre gamme complète de cosmétiques et soins à Dakar au Sénégal : formulations simples, ingrédients d'origine naturelle et transparence garantie."
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('categorie') || 'all';
  const initialBrand = searchParams.get('marque') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('tri') || 'featured';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const [prods, cats, brs] = await Promise.all([
          catalogService.getProducts(),
          catalogService.getCategories(),
          catalogService.getBrands()
        ]);
        setProducts(prods);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error("Error loading products catalogue:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Sync state to URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory !== 'all') params.categorie = selectedCategory;
    if (selectedBrand !== 'all') params.marque = selectedBrand;
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (sortBy !== 'featured') params.tri = sortBy;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy, setSearchParams]);

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const categoryObj = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
          if (categoryObj && product.category_id !== categoryObj.id && product.category?.slug !== selectedCategory) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'all') {
          const brandObj = brands.find(b => b.slug === selectedBrand || b.id === selectedBrand);
          if (brandObj && product.brand_id !== brandObj.id && product.brand?.slug !== selectedBrand) {
            return false;
          }
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesDesc = (product.description || '').toLowerCase().includes(q);
          const matchesBrand = (product.brand?.name || '').toLowerCase().includes(q);
          const matchesCat = (product.category?.name || '').toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesBrand && !matchesCat) {
            return false;
          }
        }

        // Stock filter
        if (onlyInStock && product.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'fr');
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'fr');
        // Default 'featured' / recent
        return 0;
      });
  }, [products, selectedCategory, selectedBrand, searchQuery, onlyInStock, sortBy, categories, brands]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim() !== '' || onlyInStock || sortBy !== 'featured';

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setSortBy('featured');
    setOnlyInStock(false);
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">Tous nos produits</span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-white border-b border-black/5 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              Catalogue 2M Cosmetics Dakar
            </span>
            <h1 className="text-4xl md:text-5xl font-serif italic text-black/90 mb-4">
              Tous nos produits
            </h1>
            <p className="text-sm text-black/65 font-light leading-relaxed">
              Explorez nos soins formulés simplement avec des ingrédients d'origine naturelle (Moringa, Baobab, Karité). Nous détaillons chaque composition pour vous aider à choisir les produits adaptés à votre peau à Dakar.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        
        {/* Category Pills Bar */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-brand-noir text-brand-cream shadow-sm'
                : 'bg-white border border-black/10 text-black/70 hover:border-brand-gold/50 hover:text-black'
            }`}
          >
            Tous les produits ({products.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            const count = products.filter(p => p.category_id === cat.id || p.category?.slug === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-brand-noir text-brand-cream shadow-sm'
                    : 'bg-white border border-black/10 text-black/70 hover:border-brand-gold/50 hover:text-black'
                }`}
              >
                {cat.name} {count > 0 && <span className="opacity-60 text-[10px] ml-1">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-black/5 p-4 md:p-5 rounded-sm shadow-xs mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input inside products */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, ingrédient (ex: Moringa)..."
              className="w-full bg-brand-cream/60 border border-black/10 pl-10 pr-8 py-2.5 text-xs text-black placeholder:text-black/40 rounded-sm focus:outline-none focus:border-brand-gold/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                title="Effacer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Brand, InStock, Sort, Reset */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            
            {/* Brand Select */}
            {brands.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold hidden sm:inline">Marque :</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-white border border-black/10 px-3 py-2 text-xs text-black/80 rounded-sm focus:outline-none focus:border-brand-gold/60 cursor-pointer"
                >
                  <option value="all">Toutes les marques</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-black/10 px-3 py-2 text-xs text-black/80 rounded-sm focus:outline-none focus:border-brand-gold/60 cursor-pointer font-medium"
              >
                <option value="featured">Sélection recommandée</option>
                <option value="price_asc">Prix : croissant</option>
                <option value="price_desc">Prix : décroissant</option>
                <option value="name_asc">Nom : A à Z</option>
                <option value="name_desc">Nom : Z à A</option>
              </select>
            </div>

            {/* In Stock toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 bg-brand-cream/40 border border-black/10 rounded-sm hover:border-black/20 transition-colors">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-brand-noir w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span className="text-xs text-black/70 font-medium">En stock uniquement</span>
            </label>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-sm transition-colors cursor-pointer"
                title="Réinitialiser tous les filtres"
              >
                <RotateCcw className="w-3 h-3" />
                Effacer filtres
              </button>
            )}
          </div>
        </div>

        {/* Results Header Counter */}
        <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/50 font-bold pb-3 border-b border-black/5">
          <span>
            {loading 
              ? "Recherche de nos produits..." 
              : `${filteredProducts.length} ${filteredProducts.length > 1 ? 'produits répertoriés' : 'produit répertorié'}`
            }
          </span>
          <span>Disponible à Dakar &amp; Expédition Sénégal</span>
        </div>

        {/* Products Grid / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="border border-black/5 bg-white p-6 space-y-4 animate-pulse rounded-sm">
                <div className="aspect-[4/5] bg-gray-100 rounded-sm"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
                <div className="h-6 bg-gray-200 w-3/4"></div>
                <div className="h-4 bg-gray-100 w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-black/5 bg-white p-14 md:p-16 text-center max-w-xl mx-auto shadow-xs rounded-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-cream border border-brand-gold/30 flex items-center justify-center mx-auto text-brand-gold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif italic text-2xl text-black/90">Aucun produit ne correspond à ces critères</h3>
            <p className="text-xs text-black/60 max-w-sm mx-auto font-light leading-relaxed">
              Modifiez vos filtres ou explorez d'autres catégories pour découvrir nos produits.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-brand-noir hover:bg-brand-gold text-white hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all inline-block rounded-sm cursor-pointer shadow-sm"
              >
                Afficher tous les produits
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Trust & Reassurance Block */}
        <div className="mt-20 border-t border-black/5 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-start gap-4 p-6 bg-white border border-black/5 rounded-sm">
              <Truck className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif italic text-base text-black/90 mb-1">Livraison Rapide à Dakar</h4>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Livraison à domicile sous 24h à 48h à Dakar et expédition soignée dans toutes les régions du Sénégal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white border border-black/5 rounded-sm">
              <ShieldCheck className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif italic text-base text-black/90 mb-1">Transparence des Ingrédients</h4>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Des listes d'ingrédients complètes et vérifiées sur chaque produit, sans composants superflus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white border border-black/5 rounded-sm">
              <HeartHandshake className="w-6 h-6 text-brand-gold shrink-0 mt-1" />
              <div>
                <h4 className="font-serif italic text-base text-black/90 mb-1">Conseils &amp; Accompagnement</h4>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Une question sur un produit ou votre routine ? Contactez notre équipe directement sur WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
