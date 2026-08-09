import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { catalogService } from '../lib/catalogService';

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
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-[#9A8C73] flex items-center gap-1">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">Collections</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border-b border-black/5 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#9A8C73]" />
            Éditions Spéciales 2M Cosmetics
          </span>
          <h1 className="text-4xl md:text-5xl font-serif italic text-black/90 mb-6">
            Nos Collections Thématiques
          </h1>
          <p className="text-sm text-black/60 leading-relaxed font-light">
            Explorez nos sélections cosmétiques éditées sur-mesure pour accompagner vos rituels de soins, vos routines de saison et nos sélections exclusives.
          </p>
        </div>
      </div>

      {/* Collections Grid Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
            <Loader2 className="w-8 h-8 text-[#9A8C73] animate-spin mb-3" />
            <p className="text-xs text-black/40 font-mono uppercase tracking-widest">
              Chargement des collections...
            </p>
          </div>
        ) : catalogues.length === 0 ? (
          <div className="border border-black/5 bg-white p-16 text-center shadow-xs max-w-md mx-auto rounded-sm">
            <BookOpen className="w-10 h-10 text-[#9A8C73]/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl mb-2 text-black/90">
              Aucune collection disponible pour le moment
            </h3>
            <p className="text-xs text-black/50 font-light leading-relaxed mb-6">
              Nos équipes préparent actuellement de nouvelles sélections thématiques pour la boutique.
            </p>
            <Link 
              to="/" 
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#9A8C73] text-white text-[10px] uppercase tracking-widest font-bold transition-colors inline-block rounded-sm"
            >
              Découvrir tous nos soins
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogues.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue/${cat.slug}`}
                className="group bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="h-56 bg-[#FAF9F6] border-b border-black/5 relative overflow-hidden flex items-center justify-center">
                  {cat.cover_image_url ? (
                    <img
                      src={cat.cover_image_url}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <BookOpen className="w-12 h-12 text-[#9A8C73]/30 group-hover:text-[#9A8C73]/50 transition-colors" />
                      <span className="text-[10px] uppercase tracking-widest text-black/30 font-mono">
                        2M Cosmetics Dakar
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full opacity-90 group-hover:bg-[#9A8C73] transition-colors">
                    Découvrir
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#9A8C73] font-bold block mb-1">
                      Collection Édition
                    </span>
                    <h2 className="text-2xl font-serif italic text-black/90 group-hover:text-[#9A8C73] transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-black/60 font-light mt-2.5 line-clamp-3 leading-relaxed">
                      {cat.description || "Sélection exclusive de formulations cosmétiques élaborées pour répondre aux exigences dermatologiques les plus pointues."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-black/80 group-hover:text-[#9A8C73] transition-colors">
                    <span>Explorer la sélection</span>
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
