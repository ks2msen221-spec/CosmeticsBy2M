import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, ChevronRight, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { catalogService } from '../lib/catalogService';
import { usePageSEO } from '../utils/seo';

interface CatalogueItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
}

export default function Collections() {
  const [catalogues, setCatalogues] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSEO(
    "Nos Collections & Sélections | 2M Cosmetics Dakar",
    "Découvrez nos sélections de soins cosmétiques naturels pensées pour le climat de Dakar au Sénégal par 2M Cosmetics. Des produits clairs et bien pensés."
  );

  useEffect(() => {
    async function loadActiveCatalogues() {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('catalogues')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setCatalogues(data.map((item: any) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              description: item.description || null,
              cover_image_url: item.cover_image_url || null,
              is_active: item.is_active !== false
            })));
            setLoading(false);
            return;
          }
        }

        // Fallback mock service
        const all = await catalogService.getCatalogues();
        const active = all
          .filter((c: any) => c.is_active !== false)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description || null,
            cover_image_url: item.cover_image_url || null,
            is_active: true
          }));
        setCatalogues(active);
      } catch (err) {
        console.error("Erreur lors du chargement des collections:", err);
      } finally {
        setLoading(false);
      }
    }

    loadActiveCatalogues();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors shrink-0">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-black/80 shrink-0">Nos Collections</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border-b border-black/5 py-10 sm:py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            Sélections thématiques
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-black/90 mb-4 sm:mb-5">
            Nos Collections &amp; Sélections de Soins
          </h1>
          <p className="text-xs sm:text-sm text-black/65 leading-relaxed font-light">
            Découvrez nos sélections de produits regroupées par besoins. Des associations simples formulées avec des ingrédients d'origine naturelle pour vous guider facilement au quotidien à Dakar.
          </p>
        </div>
      </div>

      {/* Collections Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
            <p className="text-xs text-black/40 font-mono uppercase tracking-widest">
              Chargement de nos collections...
            </p>
          </div>
        ) : catalogues.length === 0 ? (
          <div className="border border-black/5 bg-white p-8 sm:p-14 text-center shadow-xs max-w-md mx-auto rounded-sm">
            <BookOpen className="w-10 h-10 text-brand-gold/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl mb-2 text-black/90">
              Collections en cours de préparation
            </h3>
            <p className="text-xs text-black/60 font-light leading-relaxed mb-6">
              Notre équipe prépare de nouvelles sélections de soins. En attendant, parcourez l'ensemble de notre catalogue.
            </p>
            <Link 
              to="/produits" 
              className="px-6 py-3.5 bg-brand-noir hover:bg-brand-gold text-white text-[10px] uppercase tracking-widest font-bold transition-colors inline-block rounded-sm hover:text-brand-noir min-h-[44px]"
            >
              Je découvre tous les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {catalogues.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue/${cat.slug}`}
                className="group bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300 hover:border-brand-gold/40"
              >
                {/* Cover Image */}
                <div className="h-48 sm:h-56 bg-brand-cream border-b border-black/5 relative overflow-hidden flex items-center justify-center">
                  {cat.cover_image_url ? (
                    <img
                      src={cat.cover_image_url}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <BookOpen className="w-12 h-12 text-brand-gold/40 group-hover:text-brand-gold transition-colors" />
                      <span className="text-[10px] uppercase tracking-widest text-black/40 font-mono">
                        2M Cosmetics
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-brand-noir/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full opacity-90 group-hover:bg-brand-gold group-hover:text-brand-noir transition-colors">
                    Je découvre la sélection
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold block mb-1">
                      Sélection thématique
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif italic text-black/90 group-hover:text-brand-gold transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-black/65 font-light mt-2.5 line-clamp-3 leading-relaxed">
                      {cat.description || "Sélection de cosmétiques naturels et transparents pour prendre soin de votre peau au quotidien à Dakar."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-black/80 group-hover:text-brand-gold transition-colors min-h-[44px]">
                    <span>Je découvre les produits</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
