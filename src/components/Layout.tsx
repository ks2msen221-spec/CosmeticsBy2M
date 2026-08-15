import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import WhatsAppFloatButton from './WhatsAppFloatButton';
import { SocialIcons } from './SocialIcons';
import { CONTACT_CONFIG } from '../config/contact';

export default function Layout() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.unauthorized) {
      setUnauthorizedMessage("Accès restreint : Vous devez être connecté avec un compte administrateur 2M Cosmetics pour accéder à la console d'administration.");
      // Clear location state to avoid banner re-triggering upon reload/navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchVisible(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-noir font-sans flex flex-col selection:bg-brand-taupe/20 selection:text-brand-noir">
      {/* Top Banner */}
      <div className="h-10 bg-brand-noir text-brand-cream flex items-center justify-between text-[10px] tracking-[0.18em] uppercase font-medium px-6 lg:px-12">
        <div className="hidden md:flex items-center gap-3">
          <SocialIcons iconClassName="w-3.5 h-3.5 text-brand-cream/80" containerClassName="flex items-center gap-2" />
        </div>
        <div className="mx-auto md:mx-0 text-center text-brand-cream/95">
          Livraison offerte dès 50 000 FCFA à Dakar — Paiement à la livraison ou via Wave / OM
        </div>
        <div className="hidden lg:flex items-center gap-2 text-brand-gold text-[9px] font-semibold">
          Conseil en ligne
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-black/5 sticky top-0 bg-brand-cream/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          {/* Left Navigation */}
          <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-semibold items-center">
            <Link to="/produits" className="hover:text-brand-gold transition-colors">Tous nos produits</Link>
            <Link to="/collections" className="hover:text-brand-gold transition-colors">Nos Collections</Link>
            <Link to="/blog" className="hover:text-brand-gold transition-colors">Nos conseils bien-être</Link>
          </nav>
          
          {/* Mobile hamburger shortcut */}
          <div className="md:hidden flex gap-3 text-[10px] uppercase tracking-widest font-semibold items-center">
            <Link to="/produits" className="hover:text-brand-gold transition-colors">Produits</Link>
            <Link to="/collections" className="hover:text-brand-gold transition-colors">Collections</Link>
            <Link to="/blog" className="hover:text-brand-gold transition-colors">Conseils</Link>
            <Link to="/admin" className="hover:opacity-50 transition-opacity text-amber-700 font-bold">Admin</Link>
          </div>

          {/* Center Brand Identity */}
          <Link to="/" className="flex items-center justify-center select-none group" title="2M Cosmetics — Accueil">
            <img 
              src="/logo-2m-cosmetics.png" 
              alt="2M Cosmetics Dakar" 
              className="h-10 sm:h-11 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Right Navigation */}
          <div className="flex gap-7 text-[11px] uppercase tracking-widest font-semibold items-center">
            {/* Quick Access links to admin */}
            <Link to="/admin" className="hidden lg:inline-block text-amber-700 hover:opacity-70 font-bold font-mono text-[9px] lowercase border border-amber-700/20 px-2 py-0.5 rounded">
              [admin]
            </Link>
            {user ? (
              <Link to="/compte" className="hover:text-brand-gold transition-colors flex items-center gap-1.5 font-bold text-brand-taupe">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
                <span>{profile?.full_name?.split(' ')[0] || 'Mon Espace'}</span>
              </Link>
            ) : (
              <Link to="/connexion" className="hover:text-brand-gold transition-colors">Mon Compte</Link>
            )}
            <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)} 
              className="hover:text-brand-gold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Rechercher un produit"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recherche</span>
            </button>
            <Link to="/panier" className="hover:text-brand-gold transition-colors flex items-center gap-1.5 font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Panier ({totalQuantity})</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Search Box */}
        {isSearchVisible && (
          <div className="border-t border-black/5 bg-brand-cream py-4 px-6 animate-fade-in shadow-sm">
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-black/40" />
              <input 
                type="text"
                placeholder="Rechercher un produit, un ingrédient (Moringa, Baobab, SPF...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-serif italic outline-none bg-transparent placeholder-black/40 py-1 focus:border-b focus:border-brand-gold"
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchVisible(false)} className="p-1">
                <X className="w-4 h-4 text-black/40 hover:text-black" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-grow bg-brand-cream">
        {unauthorizedMessage && (
          <div className="bg-amber-50 border-b border-amber-500/10 text-amber-900 text-xs py-3.5 px-6 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-4xl">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium">{unauthorizedMessage}</span>
            </div>
            <button 
              onClick={() => setUnauthorizedMessage(null)}
              className="p-1 hover:bg-amber-100/60 rounded text-amber-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* Footer Info Bar */}
      <footer className="border-t border-black/5 py-12 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-black/5">
            {/* Brand Logo & Identity */}
            <div className="flex items-center gap-4">
              <Link to="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity" title="2M Cosmetics Dakar">
                <img 
                  src="/logo-2m-cosmetics.png" 
                  alt="2M Cosmetics" 
                  className="h-11 md:h-12 w-auto object-contain"
                />
              </Link>
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-brand-noir">2M Cosmetics</span>
                <span className="block text-sm text-black/60 font-script italic">Cosmétiques naturels et transparents au Sénégal</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">Échangeons sur nos réseaux</span>
              <div className="hidden sm:block h-[1px] w-8 bg-black/20"></div>
              <SocialIcons iconClassName="w-4 h-4" containerClassName="flex items-center gap-3" />
              <span className="text-xs font-script italic text-black/60">@2m_cosmetics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold mb-2 font-bold">Notre Boutique à Dakar</span>
              <span className="text-xs text-black/80 font-medium leading-relaxed">{CONTACT_CONFIG.address}</span>
              <div className="flex flex-col gap-1 mt-2 text-xs">
                <a href={`tel:${CONTACT_CONFIG.phoneRaw}`} className="text-black/70 hover:text-brand-gold transition-colors font-mono">
                  {CONTACT_CONFIG.phone}
                </a>
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-black/70 hover:text-brand-gold transition-colors">
                  {CONTACT_CONFIG.email}
                </a>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold mb-2 font-bold">Conseil & Commandes</span>
              <p className="text-xs text-black/70 leading-relaxed font-light mb-2">
                Une question sur un produit ou besoin d'un suivi pour votre livraison ?
              </p>
              <a 
                href={CONTACT_CONFIG.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                Discuter sur WhatsApp →
              </a>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold mb-2 font-bold">Paiement & Livraison</span>
              <span className="text-xs text-black/80 font-medium">Livraison en 24h à 48h sur Dakar</span>
              <p className="text-xs text-black/60 font-light mt-1">
                Paiement en espèces à la réception de votre colis, ou par Wave / Orange Money.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold mb-2 font-bold">Transparence</span>
              <span className="text-xs text-black/80 font-medium">Ingrédients Clairs & Vérifiés</span>
              <p className="text-xs text-black/60 font-light mt-1">
                Des formulations simples avec des ingrédients d'origine naturelle, sans composants superflus.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 pt-6 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-black/40 uppercase tracking-wider">
          <div>© {new Date().getFullYear()} 2M Cosmetics — Cosmétiques naturels à Dakar.</div>
          <div className="flex gap-6 lowercase font-mono">
            <Link to="/produits" className="hover:text-black">produits</Link>
            <Link to="/collections" className="hover:text-black">collections</Link>
            <Link to="/blog" className="hover:text-black">conseils</Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatButton />
    </div>
  );
}
