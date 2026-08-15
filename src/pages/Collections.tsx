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
    "Collections Thématiques & Rituels | Maison 2M Cosmetics Dakar",
    "Explorez nos sélections de soins botaniques et rituels dermo-cosmétiques pensés pour le climat sénégalais par Maison 2M Cosmetics à Dakar."
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
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
          <Link to="/" className="hover:text-brand-gold flex items-center gap-1 transition-colors">
            <Home className="w-3 h-3" /> Accueil
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black/80">Collections Thématiques</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border-b border-black/5 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            Éditions Ciblées & Rituels d'Exception
          </span>
          <h1 className="text-4xl md:text-5xl font-serif italic text-black/90 mb-5">
            Nos Rituels & Sélections Signatures
          </h1>
          <p className="text-sm text-black/65 leading-relaxed font-light">
            Découvrez nos collections éditées avec soin par notre équipe de Dakar. Des rituels harmonieux pensés pour sublimer votre peau au quotidien, protéger votre éclat et respecter votre équilibre naturel.
          </p>
        </div>
      </div>

      {/* Collections Grid Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-sm">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-3" />
            <p className="text-xs text-black/40 font-mono uppercase tracking-widest">
              Chargement de nos collections...
            </p>
          </div>
        ) : catalogues.length === 0 ? (
          <div className="border border-black/5 bg-white p-14 text-center shadow-xs max-w-md mx-auto rounded-sm">
            <BookOpen className="w-10 h-10 text-brand-gold/40 mx-auto mb-4" />
            <h3 className="font-serif italic text-xl mb-2 text-black/90">
              Collections en cours de curation
            </h3>
            <p className="text-xs text-black/60 font-light leading-relaxed mb-6">
              Nos spécialistes préparent de nouvelles harmonies de soins. En attendant, parcourez notre catalogue général.
            </p>
            <Link 
              to="/catalogue/nouveautes" 
              className="px-6 py-3 bg-brand-noir hover:bg-brand-gold text-white text-[10px] uppercase tracking-widest font-bold transition-colors inline-block rounded-sm hover:text-brand-noir"
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
                className="group bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300 hover:border-brand-gold/40"
              >
                {/* Cover Image */}
                <div className="h-56 bg-brand-cream border-b border-black/5 relative overflow-hidden flex items-center justify-center">
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
                        Maison 2M Cosmetics
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-brand-noir/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full opacity-90 group-hover:bg-brand-gold group-hover:text-brand-noir transition-colors">
                    Explorer le rituel
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold block mb-1">
                      Rituel Signature
                    </span>
                    <h2 className="text-2xl font-serif italic text-black/90 group-hover:text-brand-gold transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-black/65 font-light mt-2.5 line-clamp-3 leading-relaxed">
                      {cat.description || "Sélection exclusive de formulations cosmétiques élaborées pour magnifier votre peau sous le soleil de Dakar."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-black/80 group-hover:text-brand-gold transition-colors">
                    <span>Découvrir les soins du rituel</span>
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
