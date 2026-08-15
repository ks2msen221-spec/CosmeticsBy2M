import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Category, Product, Brand, Catalogue } from '../types/catalog';
import ProductCard from '../components/ProductCard';
import { Sparkles, Award, ArrowRight, ShieldCheck, Heart, Truck, Sparkle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { usePageSEO } from '../utils/seo';

export default function Home() {
  usePageSEO(
    "Maison 2M Cosmetics — Cosmétiques Naturels & Soins d'Exception à Dakar",
    "Découvrez Maison 2M Cosmetics à Dakar : soins visage, sérums botaniques et rituels corps aux précieux actifs africains (Moringa, Baobab, Karité). Livraison rapide au Sénégal."
  );

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
          catalogService.getProducts(),
          catalogService.getBrands(),
          catalogService.getCatalogues()
        ]);
        setCategories(cats);
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
    <div className="w-full bg-brand-cream min-h-screen">
      {/* Premium Hero Section */}
      <section className="border-b border-black/5 flex flex-col lg:flex-row overflow-hidden bg-white">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative min-h-[520px]">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cream text-brand-gold text-[10px] uppercase tracking-[0.25em] font-extrabold rounded-full border border-brand-gold/20">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Bienvenue chez Maison 2M Cosmetics
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[76px] font-serif leading-[0.95] tracking-tight mb-6 text-black/90">
            Révélez l'Éclat <br/>
            <span className="italic ml-4 sm:ml-8 text-brand-gold">Naturel</span> de votre Peau
          </h1>
          
          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-black/75 mb-8 font-light">
            Prenez soin de vous avec nos rituels dermo-cosmétiques d'exception à Dakar. Des formulations saines, douces et enrichies en trésors botaniques ouest-africains (Moringa, Baobab, Karité) pour sublimer votre beauté sous le soleil du Sénégal, en toute sérénité.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-8">
            <Link 
              to="/catalogue/nouveautes" 
              className="px-8 py-4 bg-brand-noir text-brand-cream text-[11px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-all inline-flex items-center justify-center gap-2 shadow-sm rounded-sm"
            >
              Découvrir nos Soins
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              to="/collections" 
              className="px-6 py-4 border border-black/15 text-black/80 hover:bg-brand-cream text-[11px] uppercase tracking-widest font-bold transition-all text-center rounded-sm"
            >
              Nos Rituels Beauté
            </Link>
          </div>

          <div className="pt-6 border-t border-black/5 flex flex-wrap items-center gap-6 text-xs text-black/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Livraison soignée à Dakar en 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Paiement à la livraison ou Wave / OM</span>
            </div>
          </div>
        </div>

        {/* Right Content Visual */}
        <div className="w-full lg:w-1/2 relative bg-brand-cream/80 p-8 md:p-16 flex items-center justify-center min-h-[450px]">
          <div className="w-full max-w-[420px] aspect-[4/5] bg-black/5 shadow-2xl relative overflow-hidden group rounded-sm">
            <img 
              src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
              alt="Soins d'exception Maison 2M Cosmetics Dakar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-brand-cream/90">Conseil de Conseillère</p>
              <p className="text-2xl font-serif italic">Des Sérums Purs & Équilibrants</p>
              <p className="text-xs text-brand-cream/80 font-light mt-1">Conçus pour régénérer la peau sans effet gras.</p>
              <div className="h-[1px] w-12 bg-brand-gold mt-3 group-hover:w-20 transition-all duration-500"></div>
            </div>
          </div>
          
          {/* Secondary Floating Premium Seal */}
          <div className="absolute -bottom-6 -left-6 md:-left-16 w-48 h-60 bg-white border border-black/5 p-5 shadow-xl hidden sm:block rounded-sm">
            <div className="w-full h-2/3 bg-brand-cream mb-3 flex flex-col items-center justify-center text-center p-2 rounded-xs">
              <Award className="w-7 h-7 text-brand-gold mb-1.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-noir">Formules Testées</span>
              <span className="text-xs text-brand-gold font-script italic">Haute Tolérance</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest leading-tight font-extrabold text-black/80">Actifs Botaniques Purs</p>
            <p className="text-[9px] text-black/50 mt-0.5">Moringa, Baobab, Nébédaye & Karité</p>
          </div>
        </div>
      </section>

      {/* Reassurance Bar */}
      <section className="bg-white border-b border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold shrink-0 border border-black/5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-black/85">Livraison Rapide Dakar</h3>
              <p className="text-[11px] text-black/55">À votre domicile ou bureau sous 24h à 48h</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold shrink-0 border border-black/5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-black/85">Paiement Simple & Serein</h3>
              <p className="text-[11px] text-black/55">En espèces à la réception, Wave ou OM</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold shrink-0 border border-black/5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-black/85">100% Actifs Authentiques</h3>
              <p className="text-[11px] text-black/55">Ingrédients nobles et traçabilité garantie</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold shrink-0 border border-black/5">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-black/85">Conseils Personnalisés</h3>
              <p className="text-[11px] text-black/55">Votre conseillère beauté à votre écoute</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Universes Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold block mb-2">Nos Univers de Beauté</span>
          <h2 className="text-3xl md:text-4xl font-serif text-black/90">Trouvez le soin parfait pour votre peau</h2>
          <div className="h-[2px] w-12 bg-brand-gold mx-auto mt-4 mb-4"></div>
          <p className="text-xs sm:text-sm text-black/60 font-light leading-relaxed">
            Que vous cherchiez à hydrater, unifier ou protéger votre épiderme, chaque rituel est pensé pour répondre avec douceur à vos besoins spécifiques.
          </p>
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
                className="border border-black/5 bg-white overflow-hidden shadow-sm flex flex-col hover:border-brand-gold/50 transition-all group rounded-sm"
              >
                <div className="h-52 relative overflow-hidden bg-gray-100">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-taupe/40 text-sm font-serif italic">
                      Maison 2M
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold block mb-1">Rituel Beauté</span>
                    <h3 className="text-xl font-serif italic mb-3 group-hover:text-brand-gold transition-colors text-black/90">{category.name}</h3>
                    <p className="text-xs text-black/60 leading-relaxed mb-6 line-clamp-2 font-light">{category.description}</p>
                  </div>
                  <Link 
                    to={`/categorie/${category.slug}`} 
                    className="text-[10px] uppercase tracking-widest font-bold text-brand-noir group-hover:text-brand-gold transition-colors flex items-center gap-1.5 mt-auto pt-4 border-t border-black/5"
                  >
                    Explorer la sélection <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold block mb-2">Les Incontournables</span>
              <h2 className="text-3xl md:text-4xl font-serif text-black/90">Les soins chouchous de nos clientes</h2>
              <p className="text-xs sm:text-sm text-black/60 font-light mt-2">
                Les soins les plus plébiscités à Dakar pour retrouver une peau radieuse, protégée et soyeuse.
              </p>
            </div>
            <Link 
              to="/catalogue/nouveautes" 
              className="text-xs text-brand-taupe hover:text-brand-gold font-bold tracking-widest uppercase flex items-center gap-1.5 mt-4 md:mt-0 transition-colors"
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
              Aucun soin à afficher pour le moment.
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

      {/* Brands and Philosophy Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Brand Info 1 */}
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-bold block">Notre Philosophie</span>
            <h3 className="text-2xl sm:text-3xl font-serif italic text-black/90 leading-snug">L'Alliance de la Botanique Africaine & de la Science</h3>
            <p className="text-xs text-black/65 leading-relaxed font-light">
              À la Maison 2M Cosmetics, nous croyons qu'une peau en pleine santé mérite ce que la nature a de plus précieux. Nous sélectionnons rigoureusement des ingrédients locaux éco-responsables et testés sous contrôle dermatologique pour vous offrir un confort absolu et des résultats visibles.
            </p>
            <div className="flex gap-8 pt-4 border-t border-black/5">
              <div>
                <span className="block text-2xl font-serif italic text-brand-gold">100%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-black/40">Actifs Purs</span>
              </div>
              <div>
                <span className="block text-2xl font-serif italic text-brand-gold">0%</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-black/40">Traces Blanches</span>
              </div>
              <div>
                <span className="block text-2xl font-serif italic text-brand-gold">24h</span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-black/40">Livraison Dakar</span>
              </div>
            </div>
          </div>

          {/* Quick links to Brand Stories */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-black/5 bg-white p-8 shadow-sm flex flex-col justify-between hover:border-brand-gold/40 transition-colors rounded-sm">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold block mb-1">Maison Partenaire</span>
                  <h4 className="text-xl font-serif italic mb-3 text-black/90">{brand.name}</h4>
                  <p className="text-xs text-black/60 leading-relaxed mb-6 line-clamp-3 font-light">{brand.bio}</p>
                </div>
                <Link 
                  to={`/marque/${brand.slug}`} 
                  className="text-[10px] uppercase tracking-widest font-bold text-brand-noir hover:text-brand-gold transition-colors flex items-center gap-1.5 pt-4 border-t border-black/5"
                >
                  Découvrir son histoire <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Advisory & Customer Care Callout */}
      <section className="border-t border-black/5 bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block">
            Conseil Personnalisé
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-black/90">
            Un doute sur le soin adapté à votre type de peau ?
          </h2>
          <p className="text-xs sm:text-sm text-black/60 max-w-lg mx-auto font-light leading-relaxed">
            Notre équipe d'expertes beauté est disponible pour vous guider par WhatsApp ou téléphone et composer votre routine idéale.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link 
              to="/blog" 
              className="px-6 py-3 bg-brand-cream border border-black/10 hover:border-brand-gold text-black text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm"
            >
              Lire la Gazette & Conseils
            </Link>
            <Link 
              to="/recherche" 
              className="px-6 py-3 bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm"
            >
              Trouver mon soin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
