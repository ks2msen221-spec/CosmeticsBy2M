import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import BrandDetail from './pages/BrandDetail';
import CatalogueDetail from './pages/CatalogueDetail';
import Collections from './pages/Collections';
import CataloguePrint from './pages/CataloguePrint';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutConfirmation from './pages/CheckoutConfirmation';
import Login from './pages/Login';
import Account from './pages/Account';
import AccountOrders from './pages/AccountOrders';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Search from './pages/Search';
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
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
          {/* Layout Wrapper with consistent Editorial design */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categorie/:slug" element={<CategoryDetail />} />
            <Route path="marque/:slug" element={<BrandDetail />} />
            <Route path="collections" element={<Collections />} />
            <Route path="produits" element={<Products />} />
            <Route path="catalogue" element={<Navigate to="/produits" replace />} />
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
