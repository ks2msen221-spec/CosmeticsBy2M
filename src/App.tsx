import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import BrandDetail from './pages/BrandDetail';
import CatalogueDetail from './pages/CatalogueDetail';
import Collections from './pages/Collections';
import CataloguePrint from './pages/CataloguePrint';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutConfirmation from './pages/CheckoutConfirmation';
import Login from './pages/Login';
import Account from './pages/Account';
import AccountOrders from './pages/AccountOrders';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Search from './pages/Search';
import { Eye, EyeOff } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCatalogues from './pages/admin/AdminCatalogues';
import AdminShippingZones from './pages/admin/AdminShippingZones';
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods';
import AdminOrders from './pages/admin/AdminOrders';
import AdminBlog from './pages/admin/AdminBlog';

export default function App() {
  const [showTestNavigator, setShowTestNavigator] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        {/* Visual Route Tester for Developer/Client convenience */}
        {showTestNavigator && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-[#FAF9F6] p-6 max-w-sm border border-[#9A8C73]/40 shadow-2xl transition-all font-mono text-xs max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#FAF9F6]/10 pb-3 mb-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-[#9A8C73]">
                🧭 Squelette des Routes (Test)
              </h4>
              <button 
                onClick={() => setShowTestNavigator(false)}
                className="text-[#FAF9F6]/60 hover:text-white cursor-pointer"
                title="Masquer le testeur"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] opacity-70 mb-3 font-sans leading-tight">
              Cliquez sur les liens ci-dessous pour tester le routage de chaque URL demandée :
            </p>
            <div className="flex flex-col gap-1.5 text-[11px]">
              <Link to="/" className="hover:text-[#9A8C73] transition-colors">🏠 Accueil : `/`</Link>
              <Link to="/categorie/soins-visage" className="hover:text-[#9A8C73] transition-colors">📂 Catégorie : `/categorie/soins-visage`</Link>
              <Link to="/marque/m-botanics" className="hover:text-[#9A8C73] transition-colors">🏷️ Marque : `/marque/m-botanics`</Link>
              <Link to="/collections" className="hover:text-[#9A8C73] transition-colors">📚 Index Collections : `/collections`</Link>
              <Link to="/catalogue/nouveautes" className="hover:text-[#9A8C73] transition-colors">✨ Catalogue : `/catalogue/nouveautes`</Link>
              <Link to="/catalogue/nouveautes/print" className="hover:text-[#9A8C73] transition-colors">🖨️ Catalogue Print : `/catalogue/nouveautes/print`</Link>
              <Link to="/produit/serum-hydratant" className="hover:text-[#9A8C73] transition-colors">🧴 Produit : `/produit/serum-hydratant`</Link>
              <Link to="/panier" className="hover:text-[#9A8C73] transition-colors">🛒 Panier : `/panier`</Link>
              <Link to="/commande" className="hover:text-[#9A8C73] transition-colors">💳 Commande : `/commande`</Link>
              <Link to="/commande/confirmation" className="hover:text-[#9A8C73] transition-colors">✅ Confirmation : `/commande/confirmation`</Link>
              <Link to="/connexion" className="hover:text-[#9A8C73] transition-colors">🔐 Connexion : `/connexion`</Link>
              <Link to="/compte" className="hover:text-[#9A8C73] transition-colors">👤 Compte : `/compte`</Link>
              <Link to="/compte/commandes" className="hover:text-[#9A8C73] transition-colors">📜 Commandes Client : `/compte/commandes`</Link>
              <Link to="/blog" className="hover:text-[#9A8C73] transition-colors">📰 Blog : `/blog`</Link>
              <Link to="/blog/art-double-nettoyage" className="hover:text-[#9A8C73] transition-colors">📖 Article Blog : `/blog/art-double-nettoyage`</Link>
              <Link to="/admin" className="hover:text-[#9A8C73] text-amber-500 font-bold transition-colors">⚙️ Admin Console : `/admin`</Link>
            </div>
          </div>
        )}

        {!showTestNavigator && (
          <button
            onClick={() => setShowTestNavigator(true)}
            className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] border border-[#9A8C73]/40 text-[#FAF9F6] p-3 shadow-2xl rounded-full hover:bg-[#9A8C73] hover:text-[#1A1A1A] transition-all cursor-pointer"
            title="Afficher le testeur de routes"
          >
            <Eye className="w-5 h-5" />
          </button>
        )}

        <Routes>
          {/* Layout Wrapper with consistent Editorial design */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categorie/:slug" element={<CategoryDetail />} />
            <Route path="marque/:slug" element={<BrandDetail />} />
            <Route path="collections" element={<Collections />} />
            <Route path="catalogue/:slug" element={<CatalogueDetail />} />
            <Route path="produit/:slug" element={<ProductDetail />} />
            <Route path="recherche" element={<Search />} />
            
            {/* Client-Facing Routes */}
            <Route path="panier" element={<Cart />} />
            <Route path="commande" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="commande/confirmation" element={<ProtectedRoute><CheckoutConfirmation /></ProtectedRoute>} />
            <Route path="compte" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="compte/commandes" element={<ProtectedRoute><AccountOrders /></ProtectedRoute>} />
            
            {/* Public Auth and other pages */}
            <Route path="connexion" element={<Login />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
          </Route>

          {/* Secure Admin back-office console with dedicated layout and route protection */}
          <Route path="admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="commandes" replace />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="marques" element={<AdminBrands />} />
            <Route path="catalogues" element={<AdminCatalogues />} />
            <Route path="zones-livraison" element={<AdminShippingZones />} />
            <Route path="modes-paiement" element={<AdminPaymentMethods />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>

          {/* Unwrapped route for printing the catalog */}
          <Route path="catalogue/:slug/print" element={<CataloguePrint />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>
  );
}
