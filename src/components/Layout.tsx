import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
      setUnauthorizedMessage("Accès restreint : Vous devez être connecté avec un compte administrateur de la Maison 2M Cosmetics pour accéder à la console d'administration.");
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#9A8C73]/20 selection:text-[#1A1A1A]">
      {/* Top Banner */}
      <div className="h-10 bg-[#1A1A1A] text-[#FAF9F6] flex items-center justify-center text-[10px] tracking-[0.2em] uppercase font-medium px-4 text-center">
        Livraison gratuite dès 50.000 FCFA — Sécurité de paiement garantie
      </div>

      {/* Navigation Header */}
      <header className="border-b border-black/5 sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          {/* Left Navigation */}
          <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-semibold">
            <Link to="/" className="hover:opacity-50 transition-opacity">Produits</Link>
            <Link to="/catalogue/selection-botanique" className="hover:opacity-50 transition-opacity">Collections</Link>
            <Link to="/blog" className="hover:opacity-50 transition-opacity">Le Blog</Link>
          </nav>
          
          {/* Mobile hamburger shortcut */}
          <div className="md:hidden flex gap-4 text-[11px] uppercase tracking-widest font-semibold">
            <Link to="/" className="hover:opacity-50 transition-opacity">Shop</Link>
            <Link to="/blog" className="hover:opacity-50 transition-opacity">Blog</Link>
            <Link to="/admin" className="hover:opacity-50 transition-opacity text-amber-700 font-bold">Admin</Link>
          </div>

          {/* Center Brand Identity */}
          <Link to="/" className="flex flex-col items-center select-none group">
            <h1 className="text-3xl font-serif tracking-tighter leading-none italic font-bold group-hover:text-[#9A8C73] transition-colors">2M</h1>
            <span className="text-[9px] uppercase tracking-[0.4em] mt-1 font-semibold text-black/60">Cosmetics</span>
          </Link>

          {/* Right Navigation */}
          <div className="flex gap-8 text-[11px] uppercase tracking-widest font-semibold items-center">
            {/* Quick Access links to test skeletal layout */}
            <Link to="/admin" className="hidden lg:inline-block text-amber-700 hover:opacity-70 font-bold font-mono text-[9px] lowercase border border-amber-700/20 px-2 py-0.5 rounded">
              [admin]
            </Link>
            {user ? (
              <Link to="/compte" className="hover:opacity-50 transition-opacity flex items-center gap-1.5 font-bold text-[#9A8C73]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9A8C73] animate-pulse"></span>
                <span>{profile?.full_name?.split(' ')[0] || 'Compte'}</span>
              </Link>
            ) : (
              <Link to="/connexion" className="hover:opacity-50 transition-opacity">Connexion</Link>
            )}
            <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)} 
              className="hover:opacity-50 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recherche</span>
            </button>
            <Link to="/panier" className="hover:opacity-50 transition-opacity flex items-center gap-1.5 font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Panier ({totalQuantity})</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Search Box */}
        {isSearchVisible && (
          <div className="border-t border-black/5 bg-[#FAF9F6] py-4 px-6 animate-fade-in shadow-sm">
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-black/40" />
              <input 
                type="text"
                placeholder="Rechercher sur 2M Cosmetics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-serif italic outline-none bg-transparent placeholder-black/30 py-1"
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
      <main className="flex-grow bg-[#FAF9F6]">
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
      <footer className="border-t border-black/5 py-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-1 font-bold">Paiements</span>
              <span className="text-[11px] font-medium">Validation Sécurisée Manuelle</span>
              <span className="text-[9px] text-[#9A8C73] font-mono mt-0.5">Cash • Wave • OM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-1 font-bold">Zones desservies</span>
              <span className="text-[11px] font-medium">Dakar & Régions du Sénégal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-1 font-bold">Engagement Qualité</span>
              <span className="text-[11px] font-medium">100% Produits Certifiés Bio</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Suivez-nous</span>
            <div className="h-[1px] w-12 bg-black/20"></div>
            <span className="text-[11px] font-serif italic font-semibold">@2m_cosmetics</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8 pt-4 border-t border-black/5 text-center text-[9px] text-black/30 font-mono uppercase tracking-wider">
          © {new Date().getFullYear()} 2M Group — Tous droits réservés. 
        </div>
      </footer>
    </div>
  );
}
