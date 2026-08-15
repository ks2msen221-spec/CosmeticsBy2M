import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ClipboardList, 
  Search, 
  Check, 
  X, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    images?: string[];
    price?: number;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: 'awaiting_verification' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method_code: 'cod' | 'wave' | 'om';
  shipping_fee: number;
  subtotal: number;
  total: number;
  user_id: string;
  address_id?: string;
  transaction_ref?: string | null;
  transaction_reference?: string | null;
  address?: {
    title?: string;
    full_address?: string;
    phone?: string;
  };
  order_items?: OrderItem[];
  items?: OrderItem[]; // Fallback list
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

const SEEDED_MOCK_ORDERS = [
  {
    id: 'ord_2m_9831',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    status: 'awaiting_verification',
    payment_method_code: 'wave',
    shipping_fee: 1500,
    subtotal: 49000,
    total: 50500,
    user_id: 'usr_demo_1',
    transaction_ref: 'WV-SNG-90184A-2M',
    address: {
      title: 'Appartement Almadies',
      full_address: 'Almadies, Immeuble R+4, Face à la Clinique des Mamelles, Dakar',
      phone: '+221 77 568 29 10'
    },
    items: [
      {
        id: 'item_1',
        order_id: 'ord_2m_9831',
        product_id: 'prod_1',
        quantity: 2,
        unit_price: 24500,
        total_price: 49000,
        product: {
          name: 'Sérum Éclat Ultime Vitamine C',
          images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80']
        }
      }
    ],
    profile: {
      full_name: 'Aminata Diop',
      email: 'aminata.diop@example.com',
      phone: '+221 77 568 29 10'
    }
  },
  {
    id: 'ord_2m_9830',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'confirmed',
    payment_method_code: 'cod',
    shipping_fee: 1500,
    subtotal: 18500,
    total: 20000,
    user_id: 'usr_demo_2',
    transaction_ref: null,
    address: {
      title: 'Domicile Plateau',
      full_address: '12 Avenue Nelson Mandela, Dakar Plateau',
      phone: '+221 76 894 12 34'
    },
    items: [
      {
        id: 'item_2',
        order_id: 'ord_2m_9830',
        product_id: 'prod_2',
        quantity: 1,
        unit_price: 18500,
        total_price: 18500,
        product: {
          name: 'Crème de Nuit Intense Rénovatrice',
          images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=200&q=80']
        }
      }
    ],
    profile: {
      full_name: 'Babacar Sy',
      email: 'babacar.sy@example.com',
      phone: '+221 76 894 12 34'
    }
  },
  {
    id: 'ord_2m_9829',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'processing',
    payment_method_code: 'om',
    shipping_fee: 0,
    subtotal: 62000,
    total: 62000,
    user_id: 'usr_demo_3',
    transaction_ref: 'OM-DKR-330198-2M',
    address: {
      title: 'Bureau Sacré-Cœur',
      full_address: 'Sacré-Cœur 3, Immeuble Seydi Djamil, Dakar',
      phone: '+221 78 122 45 67'
    },
    items: [
      {
        id: 'item_3',
        order_id: 'ord_2m_9829',
        product_id: 'prod_1',
        quantity: 2,
        unit_price: 24500,
        total_price: 49000,
        product: {
          name: 'Sérum Éclat Ultime Vitamine C',
          images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80']
        }
      },
      {
        id: 'item_4',
        order_id: 'ord_2m_9829',
        product_id: 'prod_3',
        quantity: 1,
        unit_price: 13000,
        total_price: 13000,
        product: {
          name: 'Eau Micellaire Apaisante Botanique',
          images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80']
        }
      }
    ],
    profile: {
      full_name: 'Fatou Sow',
      email: 'fatou.sow@example.com',
      phone: '+221 78 122 45 67'
    }
  },
  {
    id: 'ord_2m_9828',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'delivered',
    payment_method_code: 'wave',
    shipping_fee: 2500,
    subtotal: 35000,
    total: 37500,
    user_id: 'usr_demo_4',
    transaction_ref: 'WV-DKR-100249-2M',
    address: {
      title: 'Maison Pikine',
      full_address: 'Quartier Tally Boubess, Pikine, Dakar',
      phone: '+221 70 334 56 78'
    },
    items: [
      {
        id: 'item_5',
        order_id: 'ord_2m_9828',
        product_id: 'prod_4',
        quantity: 1,
        unit_price: 35000,
        total_price: 35000,
        product: {
          name: 'Élixir Redensifiant Jeunesse Divine',
          images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?w=200&q=80']
        }
      }
    ],
    profile: {
      full_name: 'Moussa Ndiaye',
      email: 'moussa.ndiaye@example.com',
      phone: '+221 70 334 56 78'
    }
  }
];

export default function AdminOrders() {
  const { user, isMocked } = useAuth();
  
  // State variables
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Selection & Filters
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Loaded details
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Load orders from database or fallback mock
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      if (supabase && !isMocked) {
        // Fetch raw orders
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select(`
            *,
            address:addresses(*),
            payment_method:payment_methods(code, label),
            order_items(
              *,
              product:products(*)
            )
          `)
          .order('created_at', { ascending: false });

        if (ordersErr) throw ordersErr;

        if (ordersData && ordersData.length > 0) {
          const normalizedOrders = (ordersData as any[]).map((order: any) => {
            const items = (order.order_items || []).map((item: any) => ({
              ...item,
              unit_price: item.unit_price_cents,
              total_price: item.unit_price_cents * item.quantity
            }));
            
            return {
              ...order,
              total: order.total_cents,
              shipping_fee: order.shipping_fee_cents,
              subtotal: order.total_cents - order.shipping_fee_cents,
              payment_method_code: order.payment_method?.code || order.payment_method_code,
              order_items: items,
              items: items
            };
          });

          // Fetch corresponding profiles to display user information
          const userIds = Array.from(new Set(normalizedOrders.map((o: any) => o.user_id).filter(Boolean)));
          
          let profileMap = new Map<string, any>();
          if (userIds.length > 0) {
            const { data: profilesData, error: profilesErr } = await supabase
              .from('profiles')
              .select('*')
              .in('id', userIds);

            if (!profilesErr && profilesData) {
              profilesData.forEach((p: any) => {
                profileMap.set(p.id, p);
              });
            }
          }

          // Combine raw orders, profiles and unified fallback arrays
          const formattedOrders: Order[] = normalizedOrders.map((order) => {
            const mappedProfile = profileMap.get(order.user_id) || {
              full_name: 'Utilisateur de Dakar',
              email: 'client@2m-cosmetics.com',
              phone: order.address?.phone || null
            };

            return {
              ...order,
              profile: mappedProfile
            };
          });

          setOrders(formattedOrders);
          if (formattedOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(formattedOrders[0].id);
          }
        } else {
          setOrders([]);
        }
      } else {
        // Mock fallback simulation
        // Check if mock database exists in localStorage
        const localMockKey = '2m_cosmetics_admin_mock_orders';
        let storedOrders = localStorage.getItem(localMockKey);
        
        if (!storedOrders) {
          // Fallback to searching all mock orders saved per user, or seed default list
          const gatheredOrders: Order[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('2m_cosmetics_mock_orders_')) {
              try {
                const userOrders = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(userOrders)) {
                  userOrders.forEach((o: any) => {
                    // Inject standard demo user details if missing
                    gatheredOrders.push({
                      ...o,
                      profile: o.profile || {
                        full_name: 'Client Privé',
                        email: 'client.local@2m-cosmetics.com',
                        phone: o.address?.phone || null
                      },
                      items: o.order_items || o.items || []
                    });
                  });
                }
              } catch (e) {
                console.error(e);
              }
            }
          }

          // Merge gathered orders with our premium standard seed orders
          const merged = [...gatheredOrders];
          SEEDED_MOCK_ORDERS.forEach(seeded => {
            if (!merged.some(m => m.id === seeded.id)) {
              merged.push(seeded as any);
            }
          });

          // Sort by creation date
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          localStorage.setItem(localMockKey, JSON.stringify(merged));
          setOrders(merged);
          if (merged.length > 0 && !selectedOrderId) {
            setSelectedOrderId(merged[0].id);
          }
        } else {
          const parsed: Order[] = JSON.parse(storedOrders);
          setOrders(parsed);
          if (parsed.length > 0 && !selectedOrderId) {
            setSelectedOrderId(parsed[0].id);
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError("Une erreur de communication est survenue lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isMocked]);

  // Handle Order Status transitions
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setActionLoadingId(orderId);
    setError(null);
    setSuccess(null);

    try {
      if (supabase && !isMocked) {
        const { error: updateErr } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (updateErr) throw updateErr;
      } else {
        // Mock storage update
        const localMockKey = '2m_cosmetics_admin_mock_orders';
        const currentMockOrders = JSON.parse(localStorage.getItem(localMockKey) || '[]');
        
        const updated = currentMockOrders.map((o: any) => {
          if (o.id === orderId) {
            return { ...o, status: newStatus };
          }
          return o;
        });

        localStorage.setItem(localMockKey, JSON.stringify(updated));

        // Also update individual user's order to maintain deep consistency in client account views!
        const targetOrder = currentMockOrders.find((o: any) => o.id === orderId);
        if (targetOrder) {
          const userOrdersKey = `2m_cosmetics_mock_orders_${targetOrder.user_id}`;
          const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
          const updatedUserOrders = userOrders.map((uo: any) => {
            if (uo.id === orderId) {
              return { ...uo, status: newStatus };
            }
            return uo;
          });
          localStorage.setItem(userOrdersKey, JSON.stringify(updatedUserOrders));
        }
      }

      // Update local view state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Determine success feedback message based on action
      if (newStatus === 'confirmed') {
        setSuccess(`Le paiement de la commande #${orderId} a été validé. Statut : CONFIRMÉE.`);
      } else if (newStatus === 'cancelled') {
        setSuccess(`La commande #${orderId} a été annulée / rejetée.`);
      } else {
        setSuccess(`Statut de la commande #${orderId} mis à jour avec succès : ${newStatus.toUpperCase()}.`);
      }

      // Clear toast after 5s
      setTimeout(() => setSuccess(null), 5000);

    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(`Échec de la transition de statut pour la commande #${orderId}.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Status helper mapping
  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'awaiting_verification': return { label: 'À Valider', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'confirmed': return { label: 'Confirmée', color: 'bg-green-50 text-green-700 border-green-200' };
      case 'processing': return { label: 'En Préparation', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'shipped': return { label: 'Expédiée', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'delivered': return { label: 'Livrée', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'cancelled': return { label: 'Annulée', color: 'bg-red-50 text-red-700 border-red-200' };
    }
  };

  const getPaymentMethodLabel = (code: Order['payment_method_code']) => {
    switch (code) {
      case 'cod': return 'Paiement à la livraison';
      case 'wave': return 'Wave Sénégal';
      case 'om': return 'Orange Money';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  // Filtering orders
  const filteredOrders = orders.filter(order => {
    // 1. Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      (order.profile?.full_name?.toLowerCase() || '').includes(searchLower) ||
      (order.profile?.phone || '').includes(searchLower) ||
      (order.address?.full_address?.toLowerCase() || '').includes(searchLower) ||
      (order.transaction_ref?.toLowerCase() || '').includes(searchLower) ||
      (order.transaction_reference?.toLowerCase() || '').includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Tab status filter
    if (activeTab === 'awaiting') return order.status === 'awaiting_verification';
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Count pending awaiting confirmation orders
  const pendingCount = orders.filter(o => o.status === 'awaiting_verification').length;

  return (
    <div className="space-y-6 selection:bg-brand-taupe/20" id="admin-orders-page">
      
      {/* Editorial Header */}
      <header className="border-b border-black/5 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-taupe font-bold block mb-2">
            Console d'Administration • Dakar
          </span>
          <h1 className="text-3xl font-serif italic text-black/90">Gestion des Commandes</h1>
          <p className="text-xs text-black/50 font-light mt-1">
            Suivez, préparez et expédiez les formulations de Maison 2M, et validez les règlements mobiles.
          </p>
        </div>
        
        <button 
          onClick={() => fetchOrders(false)}
          className="flex items-center gap-1.5 px-4 py-2 border border-black/10 rounded-sm hover:bg-brand-cream text-xs font-mono text-black/70 hover:text-black transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </header>

      {/* Analytics Counter Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/5 p-4 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold block">Paiements à Vérifier</span>
            <span className="text-2xl font-mono font-bold text-amber-600">
              {pendingCount}
            </span>
          </div>
          <Clock className="w-8 h-8 text-amber-500/20" />
        </div>
        
        <div className="bg-white border border-black/5 p-4 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold block">En cours de Préparation</span>
            <span className="text-2xl font-mono font-bold text-blue-600">
              {orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length}
            </span>
          </div>
          <ShoppingBag className="w-8 h-8 text-blue-500/20" />
        </div>

        <div className="bg-white border border-black/5 p-4 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold block">Total Commandes</span>
            <span className="text-2xl font-mono font-bold text-black/80">
              {orders.length}
            </span>
          </div>
          <TrendingUp className="w-8 h-8 text-brand-taupe/20" />
        </div>
      </div>

      {/* Notifications and Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 border border-green-500/10 text-green-800 text-xs rounded-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col gap-4 bg-white border border-black/5 p-4 rounded-sm shadow-xs">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            placeholder="Rechercher par ID, client, numéro, adresse, ou référence Wave/OM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-black/10 text-xs rounded-sm focus:outline-hidden focus:border-brand-taupe bg-brand-cream/20"
          />
        </div>

        {/* Tab Filter buttons */}
        <div className="flex flex-wrap gap-1.5 border-b border-black/5 pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'all' 
                ? 'border-brand-taupe text-brand-taupe bg-brand-cream/40' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            Tous ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('awaiting')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'awaiting' 
                ? 'border-amber-500 text-amber-700 bg-amber-50/50' 
                : 'border-transparent text-amber-600/60 hover:text-amber-600'
            }`}
          >
            À valider ({pendingCount})
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'confirmed' 
                ? 'border-green-600 text-green-700 bg-green-50/20' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            Confirmées
          </button>

          <button
            onClick={() => setActiveTab('processing')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'processing' 
                ? 'border-blue-600 text-blue-700 bg-blue-50/20' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            En Préparation
          </button>

          <button
            onClick={() => setActiveTab('shipped')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'shipped' 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            Expédiées
          </button>

          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'delivered' 
                ? 'border-gray-500 text-gray-700 bg-gray-50' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            Livrées
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-t-sm transition-all border-b-2 ${
              activeTab === 'cancelled' 
                ? 'border-red-600 text-red-700 bg-red-50/20' 
                : 'border-transparent text-black/40 hover:text-black/80'
            }`}
          >
            Annulées
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-black/5 p-20 text-center rounded-sm shadow-xs flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-brand-taupe border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-[10px] uppercase tracking-widest text-black/40 font-mono">Chargement du registre...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-black/5 p-16 text-center rounded-sm shadow-xs">
          <ClipboardList className="w-10 h-10 text-brand-taupe/30 mx-auto mb-3" />
          <h4 className="text-sm font-serif italic text-black/70 mb-1">Aucune commande répertoriée</h4>
          <p className="text-[11px] text-black/40 max-w-sm mx-auto font-light">
            Aucun achat ne correspond à vos filtres ou à votre recherche pour le moment.
          </p>
        </div>
      ) : (
        /* Split Screen Master-Detail Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: MASTER LIST COLUMN (5 Cols or 12 Cols if no selected) */}
          <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredOrders.map(order => {
              const isActive = order.id === selectedOrderId;
              const meta = getStatusLabel(order.status);
              const totalItemsCount = (order.items || order.order_items || []).reduce((acc, item) => acc + item.quantity, 0);
              const orderDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 border rounded-sm transition-all cursor-pointer text-left ${
                    isActive 
                      ? 'bg-brand-noir text-white border-brand-noir shadow-md' 
                      : 'bg-white text-black border-black/5 hover:border-black/15 shadow-2xs'
                  }`}
                  id={`order-item-${order.id}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold">
                      #{order.id.replace('ord_', '')}
                    </span>
                    <span className={`px-2 py-0.5 text-[8px] uppercase tracking-widest font-extrabold rounded-xs border ${meta?.color}`}>
                      {meta?.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className={`font-medium font-serif italic ${isActive ? 'text-white/90' : 'text-black/85'}`}>
                      {order.profile?.full_name || 'Client anonyme'}
                    </p>
                    <p className={`text-[10px] font-mono flex items-center gap-1 ${isActive ? 'text-white/60' : 'text-black/45'}`}>
                      <span>{orderDate}</span>
                      <span>•</span>
                      <span>{totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}</span>
                    </p>
                    <div className="pt-2 flex justify-between items-center border-t border-black/5 mt-2">
                      <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'text-white/40' : 'text-black/40'}`}>
                        {getPaymentMethodLabel(order.payment_method_code)}
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Highlighting pending wave/OM verification with a subtle notice inside list */}
                  {order.status === 'awaiting_verification' && (
                    <div className={`mt-2 p-1.5 border rounded-xs text-[9px] flex items-center gap-1 font-mono ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                        : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">Réf: {order.transaction_ref || order.transaction_reference || 'Manquante'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: DETAILED INSPECTOR COLUMN (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-black/5 rounded-sm shadow-xs overflow-hidden sticky top-6">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 space-y-6"
                >
                  {/* Detailed inspector header */}
                  <div className="border-b border-black/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-black/40">COMMANDE :</span>
                        <strong className="font-mono text-xs font-extrabold text-black/90 uppercase">{selectedOrder.id}</strong>
                      </div>
                      <p className="text-[10px] text-black/40 font-mono mt-0.5">
                        Passée le {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] uppercase text-black/40 font-bold">Statut Actuel :</span>
                      <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-extrabold rounded-sm border ${getStatusLabel(selectedOrder.status)?.color}`}>
                        {getStatusLabel(selectedOrder.status)?.label}
                      </span>
                    </div>
                  </div>

                  {/* SAFETY COMPLIANCE INTERFACE FOR WAVE/OM PAYMENTS */}
                  {selectedOrder.status === 'awaiting_verification' && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-sm p-4 text-xs space-y-3">
                      <div className="flex gap-2 items-start text-amber-800">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold uppercase tracking-wider text-[10px] text-amber-700">Rapprochement Financier Manuel Obligatoire</h4>
                          <p className="font-light mt-1 text-black/70 leading-relaxed text-[11px]">
                            Conformément à la charte de sécurité Maison 2M, cette commande payée par <strong className="font-bold">{getPaymentMethodLabel(selectedOrder.payment_method_code)}</strong> nécessite que vous vérifiez la présence des fonds sur votre terminal marchand Wave/OM à Dakar avant de confirmer la livraison.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-amber-200/60 p-3 rounded-xs font-mono text-[10px] space-y-1.5 text-black/70">
                        <div className="flex justify-between">
                          <span>Client :</span>
                          <span className="font-bold text-black">{selectedOrder.profile?.full_name || 'Inconnu'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant Attendue :</span>
                          <span className="font-bold text-black">{formatPrice(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mécanisme :</span>
                          <span className="font-semibold text-amber-800">{getPaymentMethodLabel(selectedOrder.payment_method_code)}</span>
                        </div>
                        <div className="flex justify-between border-t border-black/5 pt-1.5 mt-1.5 text-[11px]">
                          <span className="font-bold text-amber-800">RÉFÉRENCE COMPTEUR :</span>
                          <span className="font-bold text-black select-all bg-amber-50 px-1 rounded-xs border border-amber-200">
                            {selectedOrder.transaction_ref || selectedOrder.transaction_reference || 'NON SAISIE PAR LE CLIENT'}
                          </span>
                        </div>
                      </div>

                      {/* Manual approval action buttons */}
                      <div className="flex gap-3 justify-end pt-1">
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                          className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-red-200 text-red-700 hover:bg-red-50 transition-all rounded-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Rejeter le Paiement
                        </button>
                        
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                          className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold bg-green-600 hover:bg-green-700 text-white transition-all rounded-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Valider le Paiement (Confirmée)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GENERAL WORKFLOW LOGICAL STATUS TRANSITIONS (For confirmed -> processing -> shipped -> delivered) */}
                  {selectedOrder.status !== 'awaiting_verification' && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <div className="bg-gray-50 border border-black/5 rounded-sm p-4 text-xs space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-black/50 font-mono">Fulfillment Étape Suivante</span>
                        <span className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold">Logistique Dakar</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-light text-black/60">
                          Progression logique du traitement :
                        </span>
                        
                        {/* Status logic selector */}
                        {selectedOrder.status === 'confirmed' && (
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                            className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold bg-brand-noir hover:bg-brand-taupe hover:text-brand-noir text-white rounded-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Passer en Préparation (processing)
                          </button>
                        )}

                        {selectedOrder.status === 'processing' && (
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                            className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold bg-brand-noir hover:bg-brand-taupe hover:text-brand-noir text-white rounded-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                          >
                            <Truck className="w-3 h-3" />
                            Expédier la Commande (shipped)
                          </button>
                        )}

                        {selectedOrder.status === 'shipped' && (
                          <button
                            disabled={actionLoadingId !== null}
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                            className="px-4 py-2 text-[9px] uppercase tracking-widest font-bold bg-green-600 hover:bg-green-700 text-white rounded-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Marquer comme Livrée (delivered)
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CUSTOMER & DELIVERY INFRASTRUCTURE DETAILS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer details card */}
                    <div className="border border-black/5 p-4 rounded-sm bg-white space-y-2.5 text-xs">
                      <h4 className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold flex items-center gap-1 border-b border-black/5 pb-1.5">
                        <User className="w-3.5 h-3.5" />
                        Informations Client
                      </h4>
                      <div className="space-y-1.5">
                        <p className="font-bold text-black/80 font-serif italic text-sm">
                          {selectedOrder.profile?.full_name || 'Non renseigné'}
                        </p>
                        
                        <div className="space-y-1 font-mono text-[10px] text-black/50">
                          <a 
                            href={`tel:${selectedOrder.address?.phone || selectedOrder.profile?.phone}`} 
                            className="flex items-center gap-1.5 hover:text-brand-taupe transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-brand-taupe/60" />
                            <span>{selectedOrder.address?.phone || selectedOrder.profile?.phone || 'Pas de numéro'}</span>
                          </a>

                          <a 
                            href={`mailto:${selectedOrder.profile?.email}`} 
                            className="flex items-center gap-1.5 hover:text-brand-taupe transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-brand-taupe/60" />
                            <span className="truncate">{selectedOrder.profile?.email || 'Pas d\'e-mail'}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Delivery details card */}
                    <div className="border border-black/5 p-4 rounded-sm bg-white space-y-2.5 text-xs">
                      <h4 className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold flex items-center gap-1 border-b border-black/5 pb-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Adresse de Livraison
                      </h4>
                      <div className="space-y-1">
                        <p className="font-bold text-black/80 font-serif italic">
                          {selectedOrder.address?.title || 'Adresse d\'expédition'}
                        </p>
                        <p className="text-black/50 leading-relaxed text-[11px] font-serif italic">
                          {selectedOrder.address?.full_address || 'Adresse à Dakar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LINE ITEMS ORDERED TABLE */}
                  <div className="space-y-2 text-xs">
                    <h4 className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold border-b border-black/5 pb-1">
                      Articles Commandés ({ (selectedOrder.items || selectedOrder.order_items || []).length })
                    </h4>

                    <div className="border border-black/5 rounded-sm divide-y divide-black/5 overflow-hidden">
                      {((selectedOrder.items || selectedOrder.order_items || []) as OrderItem[]).map((item) => {
                        const product = item.product || { name: 'Formulation Premium 2M', price: item.unit_price, images: [] };
                        const hasImage = product.images && product.images.length > 0;

                        return (
                          <div key={item.id} className="flex gap-4 p-3 bg-white hover:bg-brand-cream/20 transition-colors items-center">
                            <div className="w-10 h-12 bg-brand-cream border border-black/5 rounded-xs overflow-hidden flex items-center justify-center shrink-0">
                              {hasImage ? (
                                <img 
                                  src={product.images![0]} 
                                  alt={product.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[8px] font-serif italic text-black/20">2M</span>
                              )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <h5 className="font-serif italic font-bold text-black/85 truncate leading-snug">
                                {product.name}
                              </h5>
                              <p className="font-mono text-[9px] text-black/40 mt-0.5">
                                Identifiant: {item.product_id.replace('prod_', '')}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono text-[10px] text-black/40 font-light block">
                                {item.quantity} x {formatPrice(item.unit_price)}
                              </span>
                              <strong className="font-mono font-bold text-black text-xs block mt-0.5">
                                {formatPrice(item.total_price)}
                              </strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DETAILED PRICE RECONCILIATION SUMMARY */}
                  <div className="border-t border-black/5 pt-4 flex justify-end text-xs font-light text-black/60">
                    <div className="w-full sm:w-72 space-y-2">
                      <div className="flex justify-between font-mono">
                        <span>Sous-total articles :</span>
                        <span className="text-black font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>Frais d'expédition Dakar :</span>
                        <span className="text-black font-semibold">
                          {selectedOrder.shipping_fee === 0 ? 'Gratuit' : formatPrice(selectedOrder.shipping_fee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono border-t border-black/5 pt-2 text-sm font-semibold text-black">
                        <span>Montant total d'ordre :</span>
                        <span className="font-bold text-brand-taupe">{formatPrice(selectedOrder.total)}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-black/40 pt-1 border-t border-dashed border-black/5">
                        <span>Mode de paiement utilisé :</span>
                        <span className="font-medium text-black/60">{getPaymentMethodLabel(selectedOrder.payment_method_code)}</span>
                      </div>
                    </div>
                  </div>

                  {/* FULFILLMENT TIMELINE */}
                  <div className="bg-brand-cream border border-black/5 p-4 rounded-sm text-xs space-y-3">
                    <h4 className="text-[9px] uppercase tracking-widest text-brand-taupe font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Chronologie d'Expédition Client
                    </h4>
                    
                    <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-black/5">
                      {/* Step 1: Placed */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0.5 w-[23px] h-[23px] rounded-full border border-black/5 bg-white flex items-center justify-center font-mono text-[9px] text-brand-taupe font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-serif italic font-bold text-black/80">Commande Enregistrée</p>
                          <p className="text-[10px] text-black/40 font-mono mt-0.5">
                            {new Date(selectedOrder.created_at).toLocaleString('fr-FR')} • Dakar, Sénégal
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Verification / Confirmation */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-[23px] h-[23px] rounded-full border flex items-center justify-center font-mono text-[9px] font-bold ${
                          selectedOrder.status !== 'awaiting_verification' && selectedOrder.status !== 'cancelled'
                            ? 'bg-green-600 border-green-600 text-white'
                            : selectedOrder.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white border-black/5 text-black/30'
                        }`}>
                          {selectedOrder.status !== 'awaiting_verification' && selectedOrder.status !== 'cancelled' ? <Check className="w-3 h-3" /> : '2'}
                        </div>
                        <div>
                          <p className={`font-serif italic font-bold ${
                            selectedOrder.status === 'cancelled' ? 'text-red-700' : 'text-black/80'
                          }`}>
                            {selectedOrder.status === 'cancelled' 
                              ? 'Règlement Refusé / Commande Annulée' 
                              : selectedOrder.payment_method_code === 'cod'
                              ? 'Confirmation Immédiate (Paiement à la livraison)'
                              : selectedOrder.status === 'awaiting_verification'
                              ? 'Paiement en attente de vérification manuelle'
                              : 'Paiement Approuvé par l\'Administration'
                            }
                          </p>
                          <p className="text-[10px] text-black/40 font-mono mt-0.5">
                            {selectedOrder.status !== 'awaiting_verification' && selectedOrder.status !== 'cancelled'
                              ? 'Fonds sécurisés et rapprochés avec succès'
                              : 'Vérification de la référence Wave/Orange Money'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Preparation & Shipping */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-[23px] h-[23px] rounded-full border flex items-center justify-center font-mono text-[9px] font-bold ${
                          selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                            ? 'bg-green-600 border-green-600 text-white'
                            : selectedOrder.status === 'processing'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
                            : 'bg-white border-black/5 text-black/30'
                        }`}>
                          {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? <Check className="w-3 h-3" /> : '3'}
                        </div>
                        <div>
                          <p className="font-serif italic font-bold text-black/80">Logistique & Acheminement</p>
                          <p className="text-[10px] text-black/40 font-mono mt-0.5">
                            {selectedOrder.status === 'processing'
                              ? 'Préparation dermatologique en cours dans nos ateliers'
                              : selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                              ? 'Formulations confiées au livreur 2M Dakar'
                              : 'En attente de traitement logistique'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Delivery */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0.5 w-[23px] h-[23px] rounded-full border flex items-center justify-center font-mono text-[9px] font-bold ${
                          selectedOrder.status === 'delivered'
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-black/5 text-black/30'
                        }`}>
                          {selectedOrder.status === 'delivered' ? <Check className="w-3 h-3" /> : '4'}
                        </div>
                        <div>
                          <p className="font-serif italic font-bold text-black/80">Livraison Complétée</p>
                          <p className="text-[10px] text-black/40 font-mono mt-0.5">
                            {selectedOrder.status === 'delivered'
                              ? 'Remis en main propre au client d\'exception'
                              : 'Signature client requise à la réception'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="p-16 text-center text-black/40">
                  Sélectionnez une commande à gauche pour inspecter ses détails, rapprochements et statuts logistiques.
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
