import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Category, Product, Brand, Catalogue } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { Sparkles, Award, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods, brs, catsList] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getProducts(), // Default fetches all
          catalogService.getBrands(),
          catalogService.getCatalogues()
        ]);
        setCategories(cats);
        // Let's feature 3-4 premium products on home page
        setFeaturedProducts(prods.slice(0, 4));
        setBrands(brs);
        setCatalogues(catsList);
      } catch (err) {
        console.error("Error loading home page data", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="w-full bg-[#FAF9F6] min-h-screen">
      {/* Premium Hero Section */}
      <section className="border-b border-black/5 flex flex-col lg:flex-row overflow-hidden bg-white">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative min-h-[500px]">
          <div className="absolute top-8 left-8 right-8 flex justify-between items-center lg:static lg:mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Édition Limitée 2026
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-[100px] font-serif leading-[0.85] tracking-tighter mb-8 mt-12 lg:mt-0">
            L'Éclat <br/>
            <span className="italic ml-8 md:ml-12 text-[#9A8C73]">Naturel</span>
          </h2>
          
          <p className="max-w-md text-sm leading-relaxed text-black/70 mb-10">
            Découvrez une sélection d'exception de formulations dermatologiques et de cosmétiques bio à Dakar. Une approche moderne de la dermo-cosmétique, validée par nos experts pour magnifier votre peau sous le soleil du Sénégal.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 md:gap-12">
            <Link 
              to="/catalogue/nouveautes" 
              className="px-10 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-[11px] uppercase tracking-widest font-bold hover:bg-[#9A8C73] hover:text-[#1A1A1A] transition-all inline-block text-center shadow-sm"
            >
              Explorer les Nouveautés
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-black/40">Livraison Dakar</span>
              <span className="text-[11px] text-black/80 font-serif italic">Sous 24h à 48h à votre porte</span>
            </div>
          </div>
        </div>

        {/* Right Content Visual */}
        <div className="w-full lg:w-1/2 relative bg-[#F2F1ED] p-8 md:p-16 flex items-center justify-center min-h-[450px]">
          <div className="w-full max-w-[420px] aspect-[4/5] bg-[#D6D3CB] shadow-2xl relative overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
              alt="Maison 2M Cosmetics Hero"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#FAF9F6]/80">Formule Ciblée</p>
              <p className="text-2xl font-serif italic">Sérums de Haute Précision</p>
              <div className="h-[1px] w-8 bg-[#9A8C73] mt-2 group-hover:w-16 transition-all duration-500"></div>
            </div>
          </div>
          
          {/* Secondary Floating Premium Seal */}
          <div className="absolute -bottom-6 -left-6 md:-left-20 w-44 md:w-48 h-64 bg-white border border-black/5 p-5 shadow-xl hidden sm:block">
            <div className="w-full h-2/3 bg-[#FAF9F6] mb-4 flex flex-col items-center justify-center text-center p-2">
              <Award className="w-8 h-8 text-[#9A8C73] mb-2" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Validation</span>
              <span className="text-[9px] text-[#9A8C73] font-serif italic">Dermatologique</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest leading-tight font-extrabold text-black/80">Bio-Actifs Purs</p>
            <p className="text-[8px] text-black/50">Moringa, Baobab & Karité</p>
          </div>
        </div>
      </section>

      {/* Categories & Universes Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A8C73] font-bold block mb-2">Collections Officielles</span>
          <h2 className="text-3xl md:text-4xl font-serif">Parcourir par Univers</h2>
          <div className="h-[1px] w-12 bg-[#9A8C73] mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white border border-black/5 animate-pulse rounded p-8">
                <div className="h-4 bg-gray-200 w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-200 w-2/3 mb-4"></div>
                <div className="h-20 bg-gray-100 w-full mb-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="border border-black/5 bg-white p-0 overflow-hidden shadow-sm flex flex-col hover:border-[#9A8C73] transition-all group"
              >
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9A8C73]/40 text-sm font-serif italic">
                      Maison 2M
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-1">Catégorie</span>
                    <h3 className="text-xl font-serif italic mb-3 group-hover:text-[#9A8C73] transition-colors">{category.name}</h3>
                    <p className="text-xs text-black/60 leading-relaxed mb-6 line-clamp-2">{category.description}</p>
                  </div>
                  <Link 
                    to={`/categorie/${category.slug}`} 
                    className="text-[10px] uppercase tracking-widest font-bold text-black group-hover:text-[#9A8C73] transition-colors flex items-center gap-1 mt-auto"
                  >
                    Voir la collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="bg-white border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A8C73] font-bold block mb-2">Sélection d'exception</span>
              <h2 className="text-3xl md:text-4xl font-serif">Les soins recommandés</h2>
            </div>
            <Link 
              to="/catalogue/nouveautes" 
              className="text-xs text-[#9A8C73] hover:underline font-bold tracking-widest uppercase flex items-center gap-1.5 mt-4 md:mt-0"
            >
              Voir tout le catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border border-black/5 bg-white p-6 rounded space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2"></div>
                  <div className="h-6 bg-gray-200 w-3/4"></div>
                  <div className="h-4 bg-gray-100 w-1/3"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-black/50 italic font-serif">
              Aucun produit à afficher pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brands and Values */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Brand Info 1 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif italic text-black/90">Savoir-Faire local, Standard International</h3>
            <p className="text-xs text-black/60 leading-relaxed">
              Maison 2M Cosmetics s'entoure de formulateurs sénégalais et de dermatologues chevronnés pour valoriser la richesse botanique africaine. Nous garantissons la traçabilité des récoltes et la haute tolérance clinique de chaque élixir.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <span className="block text-2xl font-serif italic text-[#9A8C73]">100%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-black/40">Bio & Naturel</span>
              </div>
              <div>
                <span className="block text-2xl font-serif italic text-[#9A8C73]">0%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-black/40">Traces Blanches</span>
              </div>
            </div>
          </div>

          {/* Quick links to Brand Stories */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-black/5 bg-white p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#9A8C73] font-bold block mb-1">Maison d'excellence</span>
                  <h4 className="text-lg font-serif italic mb-3">{brand.name}</h4>
                  <p className="text-xs text-black/60 leading-relaxed mb-6 line-clamp-3">{brand.bio}</p>
                </div>
                <Link 
                  to={`/marque/${brand.slug}`} 
                  className="text-[10px] uppercase tracking-widest font-bold text-black hover:text-[#9A8C73] transition-colors flex items-center gap-1"
                >
                  Découvrir la marque →
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Safety and Assurance Footer elements */}
      <section className="border-t border-black/5 bg-[#FAF9F6] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-start gap-4 flex-col md:flex-row">
            <div className="w-10 h-10 bg-[#9A8C73]/10 flex items-center justify-center text-[#9A8C73] shrink-0 mx-auto md:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider font-bold text-black/80 mb-1">Formulations Testées</h5>
              <p className="text-[11px] text-black/50 leading-relaxed">Validation dermatologique stricte de chaque actif pour une tolérance cutanée absolue.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 flex-col md:flex-row">
            <div className="w-10 h-10 bg-[#9A8C73]/10 flex items-center justify-center text-[#9A8C73] shrink-0 mx-auto md:mx-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider font-bold text-black/80 mb-1">Engagés pour l'Afrique</h5>
              <p className="text-[11px] text-black/50 leading-relaxed">Valorisation des filières locales éco-responsables à Dakar et en Casamance.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 flex-col md:flex-row">
            <div className="w-10 h-10 bg-[#9A8C73]/10 flex items-center justify-center text-[#9A8C73] shrink-0 mx-auto md:mx-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider font-bold text-black/80 mb-1">Rôles RLS & Confidentialité</h5>
              <p className="text-[11px] text-black/50 leading-relaxed">Transactions et profils sécurisés via la sécurité RLS Supabase de bout en bout.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
