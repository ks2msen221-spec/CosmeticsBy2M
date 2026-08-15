import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Menu,
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Package,
  User as UserIcon,
  LogIn,
  Settings,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import WhatsAppFloatButton from './WhatsAppFloatButton';
import { SocialIcons } from './SocialIcons';
import { CONTACT_CONFIG } from '../config/contact';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const { user, profile } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchVisible(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setMobileSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-noir font-sans flex flex-col selection:bg-brand-taupe/20 selection:text-brand-noir">
      {/* Top Banner */}
      <div className="h-10 bg-brand-noir text-brand-cream flex items-center justify-between text-[10px] tracking-[0.18em] uppercase font-medium px-4 sm:px-6 lg:px-12">
        <div className="hidden md:flex items-center gap-3">
          <SocialIcons iconClassName="w-3.5 h-3.5 text-brand-cream/80" containerClassName="flex items-center gap-2" />
        </div>
        <div className="mx-auto md:mx-0 text-center text-brand-cream/95 text-[9px] sm:text-[10px] truncate px-2">
          Livraison offerte dès 50 000 FCFA à Dakar — Paiement Wave / OM / Espèces
        </div>
        <div className="hidden lg:flex items-center gap-2 text-brand-gold text-[9px] font-semibold">
          Conseil en direct
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-black/5 sticky top-0 bg-brand-cream/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 md:py-5 flex items-center justify-between gap-2">
          
          {/* Left Navigation: Hamburger on Mobile, Nav Links on Desktop */}
          <div className="flex items-center">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 text-brand-noir hover:text-brand-gold active:bg-black/5 transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-widest font-semibold items-center">
              <Link to="/produits" className="hover:text-brand-gold transition-colors py-1">Tous nos produits</Link>
              <Link to="/collections" className="hover:text-brand-gold transition-colors py-1">Nos Collections</Link>
              <Link to="/blog" className="hover:text-brand-gold transition-colors py-1">Nos conseils bien-être</Link>
            </nav>
          </div>

          {/* Center Brand Identity */}
          <Link to="/" className="flex items-center justify-center select-none group shrink-0" title="2M Cosmetics — Accueil">
            <img 
              src="/logo-2m-cosmetics.png" 
              alt="2M Cosmetics Dakar" 
              className="h-9 sm:h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Right Navigation */}
          <div className="flex gap-2 sm:gap-4 md:gap-7 text-[11px] uppercase tracking-widest font-semibold items-center">
            {/* Quick Access link to admin for admins */}
            {profile?.role === 'admin' && (
              <Link to="/admin" className="hidden lg:inline-block text-amber-700 hover:opacity-70 font-bold font-mono text-[9px] lowercase border border-amber-700/20 px-2 py-0.5 rounded">
                [admin]
              </Link>
            )}

            {/* Desktop User Link */}
            <div className="hidden md:flex items-center">
              {user ? (
                <Link to="/compte" className="hover:text-brand-gold transition-colors flex items-center gap-1.5 font-bold text-brand-taupe py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
                  <span>{profile?.full_name?.split(' ')[0] || 'Mon Compte'}</span>
                </Link>
              ) : (
                <Link to="/connexion" className="hover:text-brand-gold transition-colors py-1">Mon Compte</Link>
              )}
            </div>

            {/* Search Button */}
            <button 
              type="button"
              onClick={() => setIsSearchVisible(!isSearchVisible)} 
              className="hover:text-brand-gold transition-colors flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto gap-1.5 cursor-pointer rounded-sm"
              title="Rechercher un produit"
              aria-label="Rechercher un produit"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Recherche</span>
            </button>

            {/* Cart Button with badge */}
            <Link 
              to="/panier" 
              className="hover:text-brand-gold transition-colors flex items-center justify-center h-10 sm:h-auto px-2 sm:px-0 gap-1.5 font-bold relative rounded-sm"
              aria-label={`Panier d'achats (${totalQuantity} articles)`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Panier ({totalQuantity})</span>
              {totalQuantity > 0 && (
                <span className="sm:hidden absolute -top-0.5 -right-0.5 bg-brand-gold text-brand-noir text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Dynamic Desktop Search Box */}
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
              <button type="button" onClick={() => setIsSearchVisible(false)} className="p-2 -mr-2" aria-label="Fermer la recherche">
                <X className="w-4 h-4 text-black/40 hover:text-black" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Side Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-[85vw] max-w-sm h-full bg-brand-cream text-brand-noir shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-black/10 z-10"
              role="dialog"
              aria-label="Menu principal"
            >
              {/* Drawer Top / Header */}
              <div>
                <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white/60 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/logo-2m-cosmetics.png" 
                      alt="2M Cosmetics" 
                      className="h-8 w-auto object-contain"
                    />
                    <span className="font-serif italic text-sm font-bold text-black/80">2M Cosmetics</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-11 h-11 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 active:bg-black/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                    aria-label="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search input inside drawer */}
                <div className="p-4 border-b border-black/5 bg-brand-cream">
                  <form onSubmit={handleMobileSearchSubmit} className="flex items-center gap-2 bg-white border border-black/10 rounded-sm px-3 py-2 focus-within:border-brand-gold transition-colors">
                    <Search className="w-4 h-4 text-black/40 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full text-xs font-serif italic outline-none bg-transparent placeholder-black/40"
                    />
                    {mobileSearchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setMobileSearchQuery('')}
                        className="p-1 text-black/30 hover:text-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </form>
                </div>

                {/* Primary Navigation Links */}
                <nav className="p-4 space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-extrabold px-3 py-1 block">
                    Catalogue &amp; Soins
                  </span>

                  <Link 
                    to="/produits" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                          Tous nos produits
                        </span>
                        <span className="text-[10px] text-black/45 font-light">Soins visage, corps et sérums</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link 
                    to="/collections" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                          Nos Collections
                        </span>
                        <span className="text-[10px] text-black/45 font-light">Sélections thématiques &amp; rituels</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link 
                    to="/blog" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                          Nos conseils bien-être
                        </span>
                        <span className="text-[10px] text-black/45 font-light">Guides, routines &amp; astuces Dakar</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="pt-3 pb-1">
                    <div className="h-[1px] bg-black/5 mx-3"></div>
                  </div>

                  {/* Account & Shopping Links */}
                  <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-extrabold px-3 py-1 block">
                    Mon Espace &amp; Commandes
                  </span>

                  {user ? (
                    <>
                      <Link 
                        to="/compte" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-taupe group-hover:scale-105 transition-transform">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                              Mon Compte
                            </span>
                            <span className="text-[10px] text-black/45 font-mono truncate max-w-[170px] block">
                              {profile?.full_name || user.email}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link 
                        to="/compte/commandes" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-taupe group-hover:scale-105 transition-transform">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                              Mes Commandes
                            </span>
                            <span className="text-[10px] text-black/45 font-light">Suivi d'expédition &amp; historique</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </>
                  ) : (
                    <Link 
                      to="/connexion" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
                          <LogIn className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                            Connexion / S'inscrire
                          </span>
                          <span className="text-[10px] text-black/45 font-light">Accédez à vos commandes</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  <Link 
                    to="/panier" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm hover:bg-black/5 active:bg-black/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-white border border-black/5 flex items-center justify-center text-brand-gold group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold block text-black/90 group-hover:text-brand-gold transition-colors">
                          Mon Panier
                        </span>
                        <span className="text-[10px] text-black/45 font-light">
                          {totalQuantity} {totalQuantity > 1 ? 'articles sélectionnés' : 'article sélectionné'}
                        </span>
                      </div>
                    </div>
                    {totalQuantity > 0 ? (
                      <span className="bg-brand-gold text-brand-noir text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {totalQuantity}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-black/30 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Link>

                  {/* Admin Link if role is admin */}
                  {profile?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between min-h-[48px] px-3 py-2.5 rounded-sm bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 transition-colors group border border-amber-600/20 mt-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-amber-600/20 flex items-center justify-center text-amber-800">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider font-bold block text-amber-900">
                            Administration
                          </span>
                          <span className="text-[10px] text-amber-800/70 font-mono">Console de gestion 2M</span>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase font-mono font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Drawer Bottom / Contact & Socials */}
              <div className="p-5 border-t border-black/5 bg-white/70 backdrop-blur-xs space-y-4">
                {/* Direct WhatsApp Callout */}
                <a
                  href={CONTACT_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-sm text-emerald-900 transition-colors group min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.011 1.001c-6.066 0-10.98 4.914-10.98 10.98 0 1.939.504 3.834 1.464 5.503l-1.558 5.69 5.823-1.527c1.611.88 3.425 1.343 5.251 1.343 6.066 0 10.98-4.914 10.98-10.98 0-6.066-4.914-10.98-10.98-10.98zm0 2.001c4.962 0 8.98 4.018 8.98 8.98 0 4.962-4.018 8.98-8.98 8.98-1.559 0-3.084-.405-4.43-1.17l-.317-.18-3.284.861.876-3.2-.197-.313c-.841-1.336-1.288-2.884-1.288-4.478 0-4.962 4.018-8.98 8.98-8.98zm-3.666 4.793c-.198 0-.522.074-.795.372-.273.298-1.042 1.018-1.042 2.483 0 1.465 1.066 2.88 1.215 3.078.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.174-1.413-.074-.124-.273-.198-.571-.347-.298-.149-1.758-.868-2.031-.967-.273-.099-.471-.149-.669.149-.198.298-.769.967-.943 1.165-.174.198-.347.223-.645.074-.298-.149-1.26-.464-2.401-1.482-.888-.791-1.487-1.768-1.661-2.066-.174-.298-.018-.459.131-.607.134-.133.298-.347.446-.521.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.917-2.207-.242-.579-.487-.501-.669-.51l-.571-.01z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-bold block leading-tight">Conseil WhatsApp</span>
                      <span className="text-[10px] text-emerald-800/80 font-light">Échangez avec notre équipe</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Social media icons */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">Suivez-nous</span>
                  <SocialIcons iconClassName="w-4 h-4" containerClassName="flex items-center gap-3.5" />
                </div>

                {/* Location signature */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-black/40 font-mono">
                  <span>Dakar, Sénégal</span>
                  <span>2M Cosmetics</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Floating WhatsApp Button (hidden when mobile menu is open) */}
      <WhatsAppFloatButton hidden={isMobileMenuOpen} />
    </div>
  );
}
