import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  FolderTree, 
  Tag, 
  BookOpen, 
  Truck, 
  CreditCard, 
  ClipboardList, 
  Newspaper,
  LogOut,
  Home as HomeIcon,
  Menu,
  X,
  ShieldCheck,
  User
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Commandes', path: '/admin/commandes', icon: ClipboardList },
  { name: 'Produits', path: '/admin/produits', icon: Package },
  { name: 'Catégories', path: '/admin/categories', icon: FolderTree },
  { name: 'Marques', path: '/admin/marques', icon: Tag },
  { name: 'Catalogues', path: '/admin/catalogues', icon: BookOpen },
  { name: 'Zones de livraison', path: '/admin/zones-livraison', icon: Truck },
  { name: 'Modes de paiement', path: '/admin/modes-paiement', icon: CreditCard },
  { name: 'Blog', path: '/admin/blog', icon: Newspaper },
];

export default function AdminLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error("Failed to sign out from admin layout:", err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row text-brand-noir selection:bg-brand-taupe/20 selection:text-brand-noir">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-black/5 sticky top-0 z-50 shadow-sm">
        <Link to="/admin" className="flex items-center gap-2 group">
          <ShieldCheck className="w-5 h-5 text-brand-taupe" />
          <div className="flex flex-col">
            <span className="font-serif italic font-bold leading-none text-base">2M admin</span>
            <span className="text-[8px] uppercase tracking-wider text-black/40 font-mono">Console de Gestion</span>
          </div>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-black/5 rounded transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Side Navigation (Desktop and Mobile drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-black/5 flex flex-col justify-between z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col flex-grow overflow-y-auto">
          {/* Logo / Admin Header */}
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-noir flex items-center justify-center text-brand-cream">
              <ShieldCheck className="w-4 h-4 text-brand-taupe" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm tracking-tight leading-none">Maison 2M</h2>
              <span className="text-[9px] uppercase tracking-widest font-mono text-black/40 block mt-0.5">Administration</span>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="p-4 mx-4 my-3 bg-brand-cream border border-black/5 rounded-sm flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-taupe/10 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-taupe" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-black/80 truncate leading-tight">
                {profile?.full_name || user?.email || 'Admin 2M'}
              </p>
              <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-600 block mt-0.5 font-bold">● Admin Connecté</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-4 py-4 space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold block px-2.5 mb-2.5 font-mono">Navigation</span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-all group
                    ${isActive 
                      ? 'bg-brand-noir text-white' 
                      : 'text-black/60 hover:bg-brand-cream hover:text-brand-noir'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-taupe' : 'text-black/40 group-hover:text-black/70'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/5 bg-brand-cream/40 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium text-black/60 hover:bg-brand-cream hover:text-brand-noir transition-all"
          >
            <HomeIcon className="w-4 h-4 text-black/40" />
            <span>Aller sur le site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Sidebar background overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow min-w-0 flex flex-col min-h-screen md:h-screen md:overflow-y-auto">
        <div className="flex-grow p-6 md:p-10 lg:p-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
