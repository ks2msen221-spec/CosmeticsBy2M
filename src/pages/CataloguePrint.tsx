import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../lib/catalogService';
import { Catalogue, Product } from '../types/catalog';
import { Printer, ArrowLeft, Shield } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contact';

export default function CataloguePrint() {
  const { slug } = useParams<{ slug: string }>();
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrintData() {
      if (!slug) return;
      try {
        const cat = await catalogService.getCatalogueBySlug(slug);
        setCatalogue(cat);
        if (cat) {
          const prods = await catalogService.getProducts({ catalogue_id: cat.id });
          setProducts(prods);
        }
      } catch (err) {
        console.error("Error loading print catalogue details", err);
      } finally {
        setLoading(false);
      }
    }
    loadPrintData();
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-sm font-mono text-black/50">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        Génération du catalogue d'impression...
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center text-black">
        <h2 className="text-xl font-serif italic mb-4">Catalogue Introuvable</h2>
        <Link to="/" className="px-6 py-2 bg-black text-white text-[10px] uppercase tracking-widest font-bold">
          Retourner au site
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 text-black font-sans selection:bg-[#9A8C73]/20">
      
      {/* Injecting CSS Media Queries for Printing */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .print-card {
            page-break-inside: avoid !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding-bottom: 1.5rem !important;
            margin-bottom: 1.5rem !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Action Panel (hidden during window.print()) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FAF9F6] border border-black/5 p-4 mb-8">
          <Link 
            to={`/catalogue/${catalogue.slug}`} 
            className="text-[10px] uppercase tracking-widest font-bold text-black/60 hover:text-black flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour au catalogue web
          </Link>
          
          <button 
            onClick={handlePrint}
            className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#9A8C73] text-[#FAF9F6] hover:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Télécharger en PDF / Imprimer
          </button>
        </div>

        {/* Corporate Header Block */}
        <header className="border-b-2 border-black pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-3xl font-serif italic tracking-wider font-extrabold">MAISON 2M COSMETICS</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#9A8C73] font-bold mt-1">Officiel — Sénégal</p>
            <p className="text-[10px] text-black/50 mt-1 font-mono">{CONTACT_CONFIG.address} • {CONTACT_CONFIG.phone} • {CONTACT_CONFIG.email}</p>
          </div>
          <div className="text-left sm:text-right font-mono">
            <span className="inline-block bg-black text-white text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 mb-2">
              B2B & Tarifs publics
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-black/80">Collection : {catalogue.name}</p>
            <p className="text-[10px] text-black/40">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </header>

        {/* Catalog intro */}
        <div className="mb-10">
          <h2 className="text-xl font-serif italic mb-2 text-black/90">Fiche de Référence Produit — {catalogue.name}</h2>
          <p className="text-xs text-black/60 leading-relaxed max-w-3xl">
            {catalogue.description || "Sélection exclusive de formulations d'exception. Ce document sert de grille tarifaire officielle et de fiche technique d'inventaire pour nos clients privilèges et partenaires dermatologiques au Sénégal."}
          </p>
        </div>

        {/* Dynamic Products list optimized for print */}
        {products.length === 0 ? (
          <div className="border border-dashed border-black/20 p-12 text-center text-xs italic text-black/50">
            Aucun produit répertorié dans ce catalogue imprimable.
          </div>
        ) : (
          <div className="space-y-8">
            <h3 className="text-xs uppercase tracking-widest font-bold border-b pb-2 text-[#9A8C73]">
              Nomenclature des Soins Disponibles ({products.length})
            </h3>

            {/* List Table Layout for pristine formatting */}
            <div className="space-y-6">
              {products.map((product, idx) => (
                <div key={product.id} className="print-card border-b border-black/5 pb-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <span className="font-mono text-[10px] text-black/40 block">N° {idx + 1} • ID: {product.id}</span>
                      <h4 className="text-base font-serif italic font-bold text-black/90">{product.name}</h4>
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#9A8C73]">
                        {product.brand?.name || 'Maison 2M'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-black">
                        {formatPrice(product.price)}
                      </span>
                      <span className="block text-[9px] font-mono text-black/50 mt-1">
                        Stock Dakar : {product.stock > 0 ? `${product.stock} unités` : 'Rupture'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-black/70 mb-3 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6] p-3 border border-black/5 rounded-sm font-mono text-[9px] leading-relaxed text-black/70">
                    <div>
                      <strong className="text-black/80 uppercase text-[8px] tracking-wider block">Ingrédients :</strong>
                      <span className="italic">{product.ingredients || 'Non spécifié'}</span>
                    </div>
                    <div>
                      <strong className="text-black/80 uppercase text-[8px] tracking-wider block">Allergènes déclarés :</strong>
                      <span className="italic text-red-700">{product.allergens || 'Aucun connu'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Legal Footer */}
        <footer className="mt-16 pt-8 border-t border-black/10 text-center text-[9px] text-black/40 font-mono space-y-2">
          <div className="flex items-center justify-center gap-1 text-black/50">
            <Shield className="w-3.5 h-3.5 text-[#9A8C73]" />
            <span>Document de consultation officiel de Maison 2M Cosmetics. RLS & Authentification cryptée Supabase.</span>
          </div>
          <p>© {new Date().getFullYear()} Maison 2M Cosmetics Sénégal. Tous droits de reproduction réservés.</p>
        </footer>

      </div>
    </div>
  );
}
