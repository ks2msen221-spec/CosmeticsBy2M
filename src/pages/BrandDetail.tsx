import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Brand, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Sparkles, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageSEO } from '../utils/seo';

export default function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO(
    brand ? `${brand.name} | Soins & Cosmétiques Dakar | 2M Cosmetics` : "Marque Partenaire | 2M Cosmetics Dakar",
    brand 
      ? `Découvrez les cosmétiques ${brand.name} chez 2M Cosmetics à Dakar au Sénégal : ${brand.bio?.slice(0, 120)}... Ingrédients clairs et livraison rapide.`
      : "Découvrez les marques sélectionnées par 2M Cosmetics à Dakar au Sénégal."
  );

  useEffect(() => {
    async function loadBrandAndProducts() {
      if (!slug) return;
      setLoading(true);
      try {
        const br = await catalogService.getBrandBySlug(slug);
        setBrand(br);
        
        if (br) {
          const prods = await catalogService.getProducts({ brand_id: br.id });
          setProducts(prods);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading brand products", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadBrandAndProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 w-1/4 rounded"></div>
          <div className="h-40 bg-white border border-black/5 p-10 rounded-sm">
            <div className="h-4 bg-gray-200 w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
        <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block mb-4">Marque Non Répertoriée</span>
        <h1 className="text-3xl font-serif italic mb-4">Cette marque est introuvable</h1>
        <p className="text-xs text-black/60 max-w-md mx-auto mb-8 font-light">
          Cette marque n'est pas ou plus répertoriée dans notre catalogue de cosmétiques à Dakar.
        </p>
        <Link 
          to="/produits" 
          className="px-8 py-3.5 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all inline-block rounded-sm"
        >
          Je découvre tous les produits
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
          <Link to="/collections" className="hover:text-brand-gold transition-colors">
            Collections & Marques
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">{brand.name}</span>
        </div>
      </div>

      {/* Brand Profile Showcase */}
      <div className="bg-white border-b border-black/5 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            
            {/* Brand Title and Bio */}
            <div className="lg:col-span-2 space-y-5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-gold" />
                Marque Partenaire
              </span>
              <h1 className="text-4xl md:text-5xl font-serif italic text-black/90">
                {brand.name}
              </h1>
              <div className="h-[1px] w-20 bg-brand-gold/40"></div>
              <p className="text-sm text-black/70 leading-relaxed font-light">
                {brand.bio || "Une marque de cosmétiques qui privilégie la simplicité des formulations et le respect de la peau au quotidien."}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-black/60 font-light">
                <span className="flex items-center gap-1.5 bg-brand-cream border border-black/5 px-3 py-1.5 rounded-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" /> Formules authentifiées
                </span>
                <span className="flex items-center gap-1.5 bg-brand-cream border border-black/5 px-3 py-1.5 rounded-sm">
                  <HeartHandshake className="w-3.5 h-3.5 text-brand-gold" /> Disponible à Dakar
                </span>
              </div>
            </div>

            {/* Brand Logo / Aesthetic Block */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-44 h-44 rounded-2xl border border-black/5 bg-brand-cream p-8 flex items-center justify-center shadow-inner relative overflow-hidden group">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={`Logo ${brand.name}`} 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <span className="font-serif italic text-2xl text-brand-gold font-bold">{brand.name.substring(0,2).toUpperCase()}</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Brand Products Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/50 font-bold pb-3 border-b border-black/5">
          <span>{products.length} {products.length > 1 ? 'produits disponibles' : 'produit disponible'}</span>
          <span>Disponible à Dakar</span>
        </div>

        {products.length === 0 ? (
          <div className="border border-black/5 bg-white p-14 text-center shadow-sm max-w-2xl mx-auto rounded-sm">
            <Sparkles className="w-8 h-8 text-brand-gold/60 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl mb-2 text-black/90">Produits en cours de réapprovisionnement</h3>
            <p className="text-xs text-black/60 max-w-sm mx-auto mb-6 font-light leading-relaxed">
              Les produits de la marque {brand.name} sont en cours de réapprovisionnement dans nos stocks à Dakar.
            </p>
            <Link to="/produits" className="px-6 py-3 bg-brand-noir text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-colors inline-block rounded-sm">
              Je découvre tous les produits
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
