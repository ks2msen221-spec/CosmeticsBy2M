import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ShoppingBag, 
  MapPin, 
  Plus, 
  Check, 
  Loader2, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  AlertCircle, 
  QrCode,
  CreditCard,
  CheckCircle2,
  Phone,
  User,
  Tag,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'motion/react';
import { CONTACT_CONFIG } from '../config/contact';
import { usePageSEO } from '../utils/seo';
import { queueOfflineOrder } from '../lib/offlineSync';

// Interfaces for our database/mock structures
interface ShippingZone {
  id: string;
  name: string;
  fee: number;
}

interface Address {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  phone: string;
  shipping_zone_id: string;
}

interface PaymentMethod {
  id: string;
  code: 'cod' | 'wave' | 'om';
  label: string;
  qr_code_url: string | null;
  is_active: boolean;
}

const MOCK_SHIPPING_ZONES: ShippingZone[] = [
  { id: 'zone_dakar_centre', name: 'Dakar Plateau / Fann / Almadies', fee: 1500 },
  { id: 'zone_dakar_banlieue', name: 'Dakar Banlieue (Pikine, Guédiawaye, Keur Massar)', fee: 2500 },
  { id: 'zone_rufisque', name: 'Rufisque / Bargny / Diamniadio', fee: 3500 },
  { id: 'zone_regions', name: 'Autres régions du Sénégal (Salloum, Casamance, Saint-Louis, etc.)', fee: 5000 }
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_cod', code: 'cod', label: 'Paiement à la livraison', qr_code_url: null, is_active: true },
  { id: 'pm_wave', code: 'wave', label: 'Wave Sénégal', qr_code_url: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?w=400&q=80', is_active: true },
  { id: 'pm_om', code: 'om', label: 'Orange Money Sénégal', qr_code_url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=400&q=80', is_active: true }
];

export default function Checkout() {
  const { cartItems, loading: cartLoading, subtotal, totalQuantity, updateQuantity, clearCart } = useCart();
  const { user, profile, isMocked } = useAuth();
  const navigate = useNavigate();

  usePageSEO(
    "Finaliser ma Commande | 2M Cosmetics Dakar",
    "Finalisez votre commande de cosmétiques en toute sécurité avec 2M Cosmetics. Livraison à domicile à Dakar et au Sénégal."
  );

  // State arrays loaded from DB or fallback
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // User selections
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<'cod' | 'wave' | 'om'>('cod');
  const [transactionReference, setTransactionReference] = useState<string>('');

  // Add Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newPhone, setNewPhone] = useState(profile?.phone || '');
  const [newZoneId, setNewZoneId] = useState('');

  // Page loading & feedback states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Stock mismatch modal alert state
  const [stockMismatchAlert, setStockMismatchAlert] = useState<{
    issues: { product_id: string; name: string; available: number; current: number }[];
  } | null>(null);

  // Load everything on mount
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/panier');
      return;
    }

    async function loadCheckoutData() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Load Shipping Zones
        let zonesData: ShippingZone[] = [];
        if (supabase && !isMocked) {
          const { data, error: zonesErr } = await supabase
            .from('shipping_zones')
            .select('*');
          if (!zonesErr && data && data.length > 0) {
            zonesData = data.map((z: any) => ({
              id: z.id,
              name: z.name,
              fee: Number(z.fee_cents ?? 0)
            }));
          } else {
            zonesData = MOCK_SHIPPING_ZONES;
          }
        } else {
          zonesData = MOCK_SHIPPING_ZONES;
        }
        setShippingZones(zonesData);
        if (zonesData.length > 0) {
          setNewZoneId(zonesData[0].id);
        }

        // 2. Load Payment Methods
        let pmData: PaymentMethod[] = [];
        if (supabase && !isMocked) {
          const { data, error: pmErr } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('is_active', true);
          if (!pmErr && data && data.length > 0) {
            pmData = data.map((p: any) => ({
              id: p.id,
              code: p.code,
              label: p.label || p.name || p.code,
              qr_code_url: p.qr_code_url,
              is_active: p.is_active ?? true
            }));
          } else {
            pmData = MOCK_PAYMENT_METHODS;
          }
        } else {
          pmData = MOCK_PAYMENT_METHODS;
        }
        setPaymentMethods(pmData);

        // 3. Load Addresses
        let addrData: Address[] = [];
        if (supabase && !isMocked) {
          const { data, error: addrErr } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id);
          
          if (!addrErr && data) {
            addrData = data as Address[];
          }
        } else {
          // Mock Addresses from LocalStorage or Default
          const saved = localStorage.getItem(`2m_cosmetics_mock_addresses_${user.id}`);
          if (saved) {
            addrData = JSON.parse(saved);
          } else {
            // Seed a default address based on profile info
            const defaultAddr: Address = {
              id: 'addr_default_1',
              user_id: user.id,
              label: 'Adresse par défaut',
              full_address: profile?.address || CONTACT_CONFIG.address,
              phone: profile?.phone || CONTACT_CONFIG.phone,
              shipping_zone_id: 'zone_dakar_centre'
            };
            addrData = [defaultAddr];
            localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(addrData));
          }
        }

        setAddresses(addrData);
        if (addrData.length > 0) {
          setSelectedAddressId(addrData[0].id);
        }

      } catch (err) {
        console.error("Error loading checkout data, using mock sets:", err);
        setShippingZones(MOCK_SHIPPING_ZONES);
        setPaymentMethods(MOCK_PAYMENT_METHODS);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [user, profile, isMocked, cartItems, cartLoading, navigate]);

  // Handle adding a new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressError(null);

    if (!newTitle.trim() || !newFullAddress.trim() || !newPhone.trim() || !newZoneId) {
      setAddressError('Veuillez remplir tous les champs de l\'adresse.');
      return;
    }

    try {
      const newAddressObj = {
        label: newTitle.trim(),
        full_address: newFullAddress.trim(),
        phone: newPhone.trim(),
        shipping_zone_id: newZoneId
      };

      let createdAddress: Address;

      if (supabase && !isMocked) {
        const { data, error: insertErr } = await supabase
          .from('addresses')
          .insert({
            ...newAddressObj,
            user_id: user.id
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        createdAddress = data as Address;
      } else {
        // Save to Mock list
        createdAddress = {
          id: 'addr_' + Math.random().toString(36).substring(2, 9),
          user_id: user.id,
          ...newAddressObj
        };
        const updated = [...addresses, createdAddress];
        localStorage.setItem(`2m_cosmetics_mock_addresses_${user.id}`, JSON.stringify(updated));
      }

      setAddresses(prev => [...prev, createdAddress]);
      setSelectedAddressId(createdAddress.id);
      
      // Reset Form
      setNewTitle('');
      setNewFullAddress('');
      setIsAddingAddress(false);
    } catch (err: any) {
      console.error("Failed to insert address:", err);
      setAddressError(err.message || 'Impossible d\'enregistrer l\'adresse.');
    }
  };

  // Calculate delivery fee
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const selectedZone = shippingZones.find(z => z.id === selectedAddress?.shipping_zone_id);
  
  // Delivery fee is 0 if subtotal matches 50,000 FCFA
  const shippingFee = selectedZone 
    ? (subtotal >= 50000 ? 0 : selectedZone.fee) 
    : 0;

  const totalAmount = subtotal + shippingFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Adjust cart quantities and re-submit order
  const handleAdjustAndContinue = async () => {
    if (!stockMismatchAlert) return;
    setSubmitting(true);
    setError(null);
    try {
      for (const issue of stockMismatchAlert.issues) {
        await updateQuantity(issue.product_id, issue.available);
      }
      setStockMismatchAlert(null);
      setTimeout(() => {
        handleSubmitOrder();
      }, 150);
    } catch (err: any) {
      console.error("Failed to adjust quantities:", err);
      setError("Impossible d'ajuster les quantités automatiquement. Veuillez vérifier votre panier.");
      setSubmitting(false);
    }
  };

  // Submit Order to Cloudflare Worker
  const handleSubmitOrder = async () => {
    if (!user) return;
    setError(null);

    if (!selectedAddressId) {
      setError('Veuillez sélectionner ou ajouter une adresse de livraison.');
      return;
    }

    // Submit Order to Cloudflare Worker or Mock
    // Note: Transaction reference is purely optional for Wave and Orange Money. If left blank, the order is created with status "awaiting_verification" (à valider).
    setSubmitting(true);

    try {
      // 0. Pre-checkout stock check against database
      const productIds = cartItems.map(item => item.product_id);
      const stockIssues: { product_id: string; name: string; available: number; current: number }[] = [];

      if (supabase && !isMocked) {
        const { data: dbProducts, error: dbErr } = await supabase
          .from('products')
          .select('id, name, stock_quantity')
          .in('id', productIds);

        if (!dbErr && dbProducts) {
          cartItems.forEach(item => {
            const p = dbProducts.find((pItem: any) => pItem.id === item.product_id);
            const stock = p?.stock_quantity ?? item.product?.stock ?? 0;
            if (item.quantity > stock) {
              stockIssues.push({
                product_id: item.product_id,
                name: p?.name || item.product?.name || 'Soin',
                available: stock,
                current: item.quantity
              });
            }
          });
        }
      } else {
        // Fallback for local mock
        const localProdsStr = localStorage.getItem('2m_cosmetics_products');
        if (localProdsStr) {
          try {
            const localProds = JSON.parse(localProdsStr);
            cartItems.forEach(item => {
              const p = localProds.find((lp: any) => lp.id === item.product_id);
              const stock = p?.stock ?? item.product?.stock ?? 0;
              if (item.quantity > stock) {
                stockIssues.push({
                  product_id: item.product_id,
                  name: item.product?.name || 'Soin',
                  available: stock,
                  current: item.quantity
                });
              }
            });
          } catch(e) {}
        }
      }

      if (stockIssues.length > 0) {
        setStockMismatchAlert({ issues: stockIssues });
        setSubmitting(false);
        return;
      }

      // 1. Fetch real JWT Token from Supabase
      let jwtToken = 'mock-jwt-token';
      if (supabase && !isMocked) {
        const { data: sessionData } = await supabase.auth.getSession();
        jwtToken = sessionData.session?.access_token || '';
      }

      // 2. Read worker URL strictly from environment variable
      const workerUrl = (import.meta as any).env.VITE_ORDERS_API_URL;

      if (!workerUrl || typeof workerUrl !== 'string' || workerUrl.trim() === '' || workerUrl.includes('placeholder')) {
        throw new Error("Le service de commande est temporairement indisponible. Veuillez réessayer dans quelques instants ou nous contacter directement.");
      }

      const payload = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        address_id: selectedAddressId,
        payment_method_code: selectedPaymentMethodCode,
        transaction_reference: transactionReference.trim() || undefined
      };

      console.log('Sending order request to worker at:', workerUrl, 'with payload:', payload);

      // Offline check
      if (!navigator.onLine) {
        if (selectedPaymentMethodCode === 'cod') {
          const offlineId = await queueOfflineOrder({
            items: payload.items,
            address_id: selectedAddressId,
            payment_method_code: selectedPaymentMethodCode,
            transaction_reference: transactionReference.trim() || undefined,
            user_id: user?.id || 'guest',
            jwt_token: jwtToken
          });

          await clearCart();
          navigate('/commande/confirmation', { 
            state: { 
              status: 'offline_pending', 
              orderId: offlineId,
              total: totalAmount,
              paymentMethod: selectedPaymentMethodCode
            } 
          });
          return;
        } else {
          throw new Error("Vous êtes actuellement hors ligne. La finalisation d'un paiement Wave ou Orange Money nécessite une connexion internet active pour sécuriser la transaction. Vos articles restent précieusement sauvegardés dans votre panier.");
        }
      }

      let response: Response;
      try {
        response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify(payload)
        });
      } catch (fetchErr: any) {
        console.error("Worker API network call failed:", fetchErr);
        // If network went down during fetch for COD order, queue it
        if (!navigator.onLine && selectedPaymentMethodCode === 'cod') {
          const offlineId = await queueOfflineOrder({
            items: payload.items,
            address_id: selectedAddressId,
            payment_method_code: selectedPaymentMethodCode,
            transaction_reference: transactionReference.trim() || undefined,
            user_id: user?.id || 'guest',
            jwt_token: jwtToken
          });
          await clearCart();
          navigate('/commande/confirmation', { 
            state: { 
              status: 'offline_pending', 
              orderId: offlineId,
              total: totalAmount,
              paymentMethod: selectedPaymentMethodCode
            } 
          });
          return;
        }
        throw new Error("Le service de commande est temporairement indisponible. Veuillez réessayer dans quelques instants ou nous contacter directement.");
      }

      let result: any = null;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error("Failed to parse worker response JSON:", jsonErr);
        throw new Error("Le service de commande est temporairement indisponible. Veuillez réessayer dans quelques instants ou nous contacter directement.");
      }

      if (!response.ok || !result || !result.success) {
        console.error("Worker returned failure response:", result);
        let rawError = result?.error || "Le service de commande est temporairement indisponible. Veuillez réessayer dans quelques instants ou nous contacter directement.";
        if (typeof rawError === 'string' && (
          rawError.toLowerCase().includes('stock') ||
          rawError.toLowerCase().includes('insufficient') ||
          rawError.toLowerCase().includes('disponible') ||
          rawError.toLowerCase().includes('quantit')
        )) {
          rawError = "Le stock de certains articles a évolué à l'instant. Veuillez vérifier et réajuster les quantités dans votre panier.";
        }
        throw new Error(rawError);
      }

      // 3. Successful Completion Actions
      // Clear the cart completely
      await clearCart();

      // Navigate to confirmation with status, total and order ID returned by the server
      navigate('/commande/confirmation', { 
        state: { 
          status: result.status, 
          orderId: result.order_id,
          total: result.total,
          paymentMethod: selectedPaymentMethodCode
        } 
      });

    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setError(err.message || 'Une erreur inattendue est survenue lors de la validation de votre commande.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(p => p.code === selectedPaymentMethodCode);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin mb-4" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-black/40">Chargement des options de livraison...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-24 selection:bg-brand-taupe/20">
      
      {/* Breadcrumbs */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 sm:py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link to="/" className="hover:text-brand-gold transition-colors shrink-0">Accueil</Link>
          <ChevronRight className="w-3 h-3 text-black/20 shrink-0" />
          <Link to="/panier" className="hover:text-brand-gold transition-colors shrink-0">Mon Panier</Link>
          <ChevronRight className="w-3 h-3 text-black/20 shrink-0" />
          <span className="text-black/80 shrink-0">Validation de commande</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-2">
            Paiement &amp; Livraison Sécurisés • Dakar
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-black/90">Finaliser Votre Commande</h1>
          <p className="text-xs text-black/60 font-light mt-2 max-w-xl leading-relaxed">
            Renseignez votre adresse de livraison et choisissez votre mode de paiement (Wave, Orange Money ou à la livraison). Nous expédions rapidement à Dakar et dans tout le Sénégal.
          </p>
        </header>

        {stockMismatchAlert && (
          <div className="mb-8 p-4 sm:p-6 bg-amber-50 border border-amber-300 text-amber-900 rounded-sm shadow-md max-w-4xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-serif italic font-bold text-base text-amber-950">
                  Changement de disponibilité des stocks
                </h4>
                {stockMismatchAlert.issues.map((issue, idx) => (
                  <p key={idx} className="text-xs text-amber-900 leading-relaxed font-sans">
                    Le stock a changé entre-temps pour <strong className="font-semibold">{issue.name}</strong> : il n'en reste que <strong>{issue.available}</strong> disponible(s) (vous en avez {issue.current} dans votre panier).
                  </p>
                ))}
                <p className="text-xs font-medium text-amber-800 pt-1">
                  Voulez-vous ajuster automatiquement les quantités et continuer ?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleAdjustAndContinue}
                disabled={submitting}
                className="px-6 py-3 bg-brand-noir hover:bg-brand-gold text-brand-cream hover:text-brand-noir text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer shadow-sm rounded-sm disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? "Ajustement en cours..." : "Ajuster et continuer"}
              </button>
              <button
                onClick={() => {
                  setStockMismatchAlert(null);
                  navigate('/panier');
                }}
                className="px-5 py-3 border border-amber-900/20 text-amber-900 text-[10px] uppercase font-bold tracking-widest hover:bg-amber-100 transition-all cursor-pointer rounded-sm min-h-[44px]"
              >
                Revenir au panier
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-500/15 text-red-800 text-xs flex items-start gap-3 rounded-sm max-w-4xl">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Une anomalie a ralenti la validation :</strong>
              <p className="mt-1 font-mono text-[11px] text-red-700/90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Address and Payment Selection (Col 7) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Step 1: Shipping Address Section */}
            <div className="border border-black/5 bg-white p-5 sm:p-6 md:p-8 shadow-sm rounded-sm">
              <div className="flex justify-between items-center pb-4 border-b border-black/5 mb-6">
                <h3 className="text-sm uppercase tracking-wider text-black font-extrabold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  1. Adresse de Livraison au Sénégal
                </h3>
                {!isAddingAddress && (
                  <button
                    onClick={() => {
                      setIsAddingAddress(true);
                      setAddressError(null);
                    }}
                    className="text-[10px] uppercase tracking-widest text-brand-gold hover:text-black transition-colors font-bold flex items-center gap-1 cursor-pointer min-h-[32px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nouvelle Adresse
                  </button>
                )}
              </div>

              {/* Form to Add New Address */}
              {isAddingAddress ? (
                <form onSubmit={handleAddAddress} className="space-y-4 bg-brand-cream p-5 border border-black/5 rounded-sm">
                  <h4 className="text-[11px] uppercase tracking-widest text-brand-gold font-bold">Ajouter un point de livraison</h4>
                  
                  {addressError && (
                    <div className="p-3 bg-red-50 text-red-800 text-[11px] rounded-sm border border-red-100">
                      {addressError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-black/50 font-bold mb-1">
                        Intitulé (ex: Domicile, Bureau)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Mon Domicile"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-xs bg-white border border-black/10 p-2.5 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-black/50 font-bold mb-1">
                        Téléphone de Livraison
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={`ex: ${CONTACT_CONFIG.phone}`}
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full text-xs bg-white border border-black/10 p-2.5 outline-none focus:border-brand-gold transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-black/50 font-bold mb-1">
                      Zone de Livraison Sénégal (Régule les frais)
                    </label>
                    <select
                      value={newZoneId}
                      onChange={(e) => setNewZoneId(e.target.value)}
                      className="w-full text-xs bg-white border border-black/10 p-2.5 outline-none focus:border-brand-gold transition-colors font-sans"
                    >
                      {shippingZones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} (+{formatPrice(zone.fee)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-black/50 font-bold mb-1">
                      Adresse complète (Quartier, Rue, Porte, Indications)
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="ex: Sacré-Cœur 3, Immeuble 2M, 2ème étage à droite..."
                      value={newFullAddress}
                      onChange={(e) => setNewFullAddress(e.target.value)}
                      className="w-full text-xs bg-white border border-black/10 p-2.5 outline-none focus:border-brand-gold transition-colors font-serif italic resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
                    >
                      Ajouter cette adresse
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 border border-black/15 text-black hover:bg-black/5 text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer bg-white"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Address List Picker */}
              {!isAddingAddress && addresses.length === 0 ? (
                <div className="p-6 border border-dashed border-brand-gold/30 bg-brand-cream text-center rounded-sm">
                  <p className="text-xs text-black/50 mb-3">Aucune adresse de livraison enregistrée.</p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 bg-brand-noir text-white hover:bg-brand-gold hover:text-brand-noir text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer"
                  >
                    Créer ma première adresse
                  </button>
                </div>
              ) : !isAddingAddress ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    const zone = shippingZones.find(z => z.id === addr.shipping_zone_id);

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected 
                            ? 'border-brand-gold bg-brand-cream ring-1 ring-brand-gold' 
                            : 'border-black/5 hover:border-black/20 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif italic font-bold text-xs text-black/80">{addr.label}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 bg-brand-gold/10 text-brand-gold text-[8px] uppercase tracking-widest font-extrabold rounded">Sélectionné</span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-black/60 font-serif italic leading-relaxed pt-1">{addr.full_address}</p>
                        </div>

                        <div className="pt-3 border-t border-black/5 mt-3 flex items-center justify-between text-[10px] text-black/40 font-mono">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-gold" /> {addr.phone}</span>
                          <span className="font-bold text-brand-gold">{zone ? zone.name.split(' (')[0] : 'Zone inconnue'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Step 2: Payment Methods Section */}
            <div className="border border-black/5 bg-white p-6 md:p-8 shadow-sm rounded-sm">
              <h3 className="text-sm uppercase tracking-wider text-black font-extrabold pb-4 border-b border-black/5 mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-gold" />
                2. Mode de Paiement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((pm) => {
                  const isSelected = pm.code === selectedPaymentMethodCode;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => {
                        setSelectedPaymentMethodCode(pm.code);
                        setError(null);
                      }}
                      className={`p-4 border text-center transition-all cursor-pointer flex flex-col justify-between items-center ${
                        isSelected 
                          ? 'border-brand-gold bg-brand-cream ring-1 ring-brand-gold' 
                          : 'border-black/5 hover:border-black/20 bg-white'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold block mb-1">
                        {pm.code === 'cod' ? 'Espèces' : pm.code === 'wave' ? 'Wave' : 'Orange Money'}
                      </span>
                      <span className="font-serif italic font-bold text-xs text-black/80">{pm.label}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-brand-gold text-brand-cream flex items-center justify-center mt-3 scale-90">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic QR Display and Ref code input for wave/om */}
              {selectedPaymentMethodCode !== 'cod' && selectedPaymentMethod && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-cream p-6 border border-black/5 rounded-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    {/* QR Code Card */}
                    <div className="w-36 h-36 bg-white border border-black/10 p-2 shrink-0 flex flex-col items-center justify-center relative shadow-sm">
                      {selectedPaymentMethod.qr_code_url ? (
                        <img 
                          src={selectedPaymentMethod.qr_code_url} 
                          alt="QR Code" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <QrCode className="w-20 h-20 text-brand-noir/30" />
                      )}
                      <div className="absolute inset-0 bg-black/5 select-none pointer-events-none"></div>
                    </div>

                    <div className="space-y-2 text-xs text-black/70 font-light">
                      <span className="text-[9px] uppercase tracking-widest text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">Paiement Mobile</span>
                      <h4 className="font-serif italic font-bold text-black text-sm">Transfert avant expédition</h4>
                      <p className="leading-relaxed text-[11px]">
                        Scannez le code QR ci-contre avec votre application <strong>{selectedPaymentMethod.label}</strong> ou effectuez le transfert du montant exact de la commande :
                      </p>
                      <p className="font-mono text-xs font-bold text-black bg-white px-2.5 py-1 border border-black/5 inline-block rounded-sm mt-1">
                        Montant : {formatPrice(totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Reference Input (Optionnel) */}
                  <div className="pt-4 border-t border-black/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] uppercase tracking-widest text-black/50 font-bold">
                        Référence de transaction
                      </label>
                      <span className="text-[9px] uppercase tracking-wider text-black/40 font-mono font-medium">
                        Facultatif
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="ex: ID de transaction Wave ou Orange Money (facultatif)"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-black/10 p-3 outline-none focus:border-brand-gold transition-colors uppercase placeholder:normal-case rounded-sm"
                    />
                    <div className="mt-2.5 p-3 bg-brand-cream/80 border border-brand-gold/20 rounded-sm text-[11px] text-black/75 font-sans leading-relaxed flex items-start gap-2">
                      <span className="text-brand-gold font-bold text-xs mt-0.5">•</span>
                      <p>
                        <strong>Vous n'avez pas la référence sous la main ?</strong> Pas de souci, notre équipe vous contactera par WhatsApp ou par téléphone pour confirmer le paiement.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Security Assurance */}
            <div className="flex items-center gap-3 text-black/40 font-mono text-[9px] px-2">
              <ShieldCheck className="w-5 h-5 text-brand-taupe shrink-0" />
              <span>
                Paiement et données sécurisés • Vos coordonnées sont strictement confidentielles.
              </span>
            </div>

          </div>

          {/* RIGHT: Cart recap and submit action (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-black/5 p-6 md:p-8 shadow-sm relative rounded-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>

              <h3 className="text-xs uppercase tracking-widest text-black/40 font-bold border-b border-black/5 pb-3 mb-6">
                Récapitulatif de Commande
              </h3>

              {/* Items Mini Scroll */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 divide-y divide-black/5">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex gap-4 pt-3 first:pt-0 items-center">
                    <div className="w-12 h-14 bg-brand-cream border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif italic text-black/20 text-[8px]">2M</span>
                      )}
                    </div>
                    <div className="flex-grow text-xs min-w-0">
                      <h4 className="font-serif italic text-black/80 font-bold truncate leading-snug">
                        {item.product?.name || "Chargement..."}
                      </h4>
                      <p className="text-[10px] text-black/40 font-mono mt-0.5">
                        {item.quantity} x {formatPrice(item.product?.price || 0)}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-black/80 shrink-0">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost calculations */}
              <div className="space-y-4 font-sans text-xs border-t border-black/5 pt-4">
                <div className="flex justify-between items-center text-black/60">
                  <span>Sous-total ({totalQuantity} {totalQuantity > 1 ? 'unités' : 'unité'}) :</span>
                  <span className="font-mono font-bold text-black/80">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-black/60">
                  <span>Frais de livraison :</span>
                  {subtotal >= 50000 ? (
                    <span className="text-green-700 font-bold uppercase text-[9px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Offert</span>
                  ) : selectedZone ? (
                    <span className="font-mono font-bold text-black/80">{formatPrice(shippingFee)}</span>
                  ) : (
                    <span className="text-black/40 italic">Sélectionnez une adresse</span>
                  )}
                </div>

                <div className="pt-4 border-t border-black/5 space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-black/80">Total de la commande :</span>
                    <span className="text-xl font-mono font-bold text-black">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Threshold info */}
              {subtotal < 50000 && (
                <div className="mt-4 p-3 bg-amber-50/70 border border-amber-500/10 text-amber-800 text-[10px] flex gap-2 rounded-sm leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Bénéficiez de la <strong>livraison gratuite</strong> à Dakar dès 50 000 FCFA d'achats !
                  </span>
                </div>
              )}

              {/* Dynamic Submit Button */}
              <div className="mt-8">
                <button
                  type="button"
                  disabled={submitting || !selectedAddressId}
                  onClick={handleSubmitOrder}
                  className={`w-full py-4 text-brand-cream text-[10px] uppercase tracking-widest font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2.5 cursor-pointer rounded-sm ${
                    !selectedAddressId 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : submitting 
                      ? 'bg-brand-noir/80 cursor-wait' 
                      : 'bg-brand-noir hover:bg-brand-gold hover:text-brand-noir'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Validation en cours...
                    </>
                  ) : selectedPaymentMethodCode === 'cod' ? (
                    'Je confirme ma commande'
                  ) : (
                    'J\'ai effectué le paiement'
                  )}
                </button>

                <p className="text-[9px] text-center text-black/40 font-light mt-3 leading-tight max-w-[280px] mx-auto">
                  En validant, vous confirmez l'exactitude de vos informations de livraison.
                </p>
              </div>

            </div>

            {/* Dakar Pharmacy Callout */}
            <div className="border border-black/5 bg-white p-6 rounded-sm text-xs">
              <h4 className="font-serif italic font-bold text-black/80 border-b border-black/5 pb-2 mb-3">Service client 2M Cosmetics</h4>
              <p className="text-black/60 leading-relaxed text-[11px]">
                Une question sur votre commande ou sur un soin ? Notre équipe à Dakar vous répond de 8h à 19h au <a href={`tel:${CONTACT_CONFIG.phoneRaw}`} className="font-semibold text-black hover:text-brand-gold transition-colors">{CONTACT_CONFIG.phone}</a>.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
