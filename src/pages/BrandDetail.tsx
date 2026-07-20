import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Brand, Product } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Home, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <span className="text-[10px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-4">Erreur 404</span>
        <h2 className="text-3xl font-serif italic mb-4">Marque Introuvable</h2>
        <p className="text-xs text-black/50 max-w-md mx-auto mb-8">
          Cette marque d'exception n'est pas ou plus référencée par Maison 2M Cosmetics.
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
          <span className="text-black/80">{brand.name}</span>
        </div>
      </div>

      {/* Brand Profile Showcase */}
      <div className="bg-white border-b border-black/5 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Brand Title and Bio */}
            <div className="lg:col-span-2 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#9A8C73]" />
                Maison de Formulation Partenaire
              </span>
              <h1 className="text-4xl md:text-5xl font-serif italic text-black/90">
                {brand.name}
              </h1>
              <div className="h-[1px] w-20 bg-[#9A8C73]/40"></div>
              <p className="text-sm text-black/70 leading-relaxed font-light">
                {brand.bio || "Laboratoire de haute excellence qui collabore avec 2M Cosmetics pour offrir des formulations d'une pureté absolue."}
              </p>
            </div>

            {/* Brand Logo / Aesthetic Block */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-44 h-44 rounded-full border border-black/5 bg-[#FAF9F6] p-8 flex items-center justify-center shadow-inner relative overflow-hidden group">
                {brand.logo_url ? (
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name} 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <span className="font-serif italic text-2xl text-[#9A8C73]">{brand.name.substring(0,2).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 bg-[#9A8C73]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Brand Products Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex justify-between items-center mb-8 text-[10px] uppercase tracking-widest text-black/40 font-bold pb-2 border-b border-black/5">
          <span>{products.length} {products.length > 1 ? 'soins formulés par cette maison' : 'soin formulé par cette maison'}</span>
          <span>Sénégal</span>
        </div>

        {products.length === 0 ? (
          <div className="border border-black/5 bg-white p-16 text-center shadow-sm max-w-2xl mx-auto">
            <Sparkles className="w-8 h-8 text-[#9A8C73]/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-lg mb-2">Formulations en cours d'analyse</h3>
            <p className="text-xs text-black/50 max-w-sm mx-auto mb-6">
              Les derniers lots de cette maison font l'objet d'essais dermatologiques rigoureux avant d'intégrer notre boutique.
            </p>
            <Link to="/" className="px-6 py-2.5 bg-black text-white text-[10px] uppercase tracking-widest font-bold">
              Explorer les autres marques
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
