import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ClipboardList, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Hourglass, 
  XCircle, 
  Package, 
  ArrowLeft,
  Loader2,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONTACT_CONFIG } from '../config/contact';
import { usePageSEO } from '../utils/seo';

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
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_method_code: string;
  shipping_fee: number;
  subtotal: number;
  total: number;
  address_id?: string;
  address?: {
    title?: string;
    full_address?: string;
    phone?: string;
  };
  order_items?: OrderItem[];
  items?: any[]; // Mock fallback shape
}

export default function AccountOrders() {
  const { user, isMocked } = useAuth();

  usePageSEO(
    "Mes Commandes de Soins | Maison 2M Cosmetics Dakar",
    "Suivez l'historique et l'acheminement de vos commandes de cosmétiques Maison 2M Cosmetics à Dakar et au Sénégal."
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        let fetchedOrders: Order[] = [];

        if (supabase && !isMocked) {
          const { data, error: dbErr } = await supabase
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!dbErr && data) {
            const normalizedOrders = (data as any[]).map((order: any) => {
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
            fetchedOrders = normalizedOrders as unknown as Order[];
          } else if (dbErr) {
            throw dbErr;
          }
        } else {
          // Mock mode: retrieve from localStorage
          const savedOrders = localStorage.getItem(`2m_cosmetics_mock_orders_${user.id}`);
          if (savedOrders) {
            fetchedOrders = JSON.parse(savedOrders);
          } else {
            // Generate standard seeded order history for user demonstration
            fetchedOrders = [
              {
                id: 'ord_demo_101',
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                status: 'confirmed',
                payment_method_code: 'cod',
                shipping_fee: 1500,
                subtotal: 24500,
                total: 26000,
                address: {
                  title: 'Domicile Plateau',
                  full_address: 'Avenue Léopold Sédar Senghor, Plateau, Dakar',
                  phone: CONTACT_CONFIG.phone
                },
                order_items: [
                  {
                    id: 'item_demo_1',
                    order_id: 'ord_demo_101',
                    product_id: 'prod_1',
                    quantity: 1,
                    unit_price: 24500,
                    total_price: 24500,
                    product: {
                      name: 'Sérum Éclat Ultime Vitamine C',
                      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80']
                    }
                  }
                ]
              }
            ];
            localStorage.setItem(`2m_cosmetics_mock_orders_${user.id}`, JSON.stringify(fetchedOrders));
          }
        }

        setOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          setExpandedOrderId(fetchedOrders[0].id); // Expand first order by default
        }
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError("Impossible de charger l'historique des commandes. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, isMocked]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-green-100">
            <CheckCircle2 className="w-3 h-3" />
            Confirmée
          </span>
        );
      case 'awaiting_verification':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-amber-100 animate-pulse">
            <Hourglass className="w-3 h-3" />
            En vérification
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-blue-100">
            <Truck className="w-3 h-3" />
            Expédiée
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-gray-100">
            <Package className="w-3 h-3" />
            Livrée
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-red-100">
            <XCircle className="w-3 h-3" />
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest font-extrabold rounded-sm border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-brand-taupe animate-spin mb-4" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-black/40">Génération de l'historique d'achats...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-24 selection:bg-brand-taupe/20">
      
      {/* Header Area */}
      <div className="border-b border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black/40 font-bold">
            <Link to="/compte" className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Mon Compte
            </Link>
            <span className="text-black/20">/</span>
            <span className="text-black/80">Commandes</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block mb-2">
            Espace Privé Client 2M
          </span>
          <h1 className="text-4xl font-serif italic text-black/90">Mes Commandes Récentes</h1>
          <p className="text-xs text-black/50 font-light mt-1.5">
            Consultez les détails, les statuts d'expédition, et les validations de règlements de vos soins d'exception de Maison 2M Cosmetics.
          </p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-500/10 text-red-800 text-xs rounded-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="border border-black/5 bg-white p-12 text-center rounded-sm shadow-sm">
            <ClipboardList className="w-12 h-12 text-brand-taupe/30 mx-auto mb-4" />
            <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold block mb-2">Historique vide</span>
            <h3 className="text-xl font-serif italic mb-4 text-black/80">Aucune commande enregistrée</h3>
            <p className="text-xs text-black/50 font-light leading-relaxed max-w-sm mx-auto mb-6">
              Vous n'avez pas encore validé d'ordre dermatologique sur notre boutique de Dakar. Découvrez nos collections pour débuter votre parcours.
            </p>
            <Link 
              to="/" 
              className="inline-block px-8 py-3.5 bg-brand-noir text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-brand-noir transition-colors rounded-sm"
            >
              Découvrir les Soins
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = order.id === expandedOrderId;
              const dateString = new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              // Handle both worker and local mock shapes
              const lineItems = order.order_items || order.items || [];

              return (
                <div 
                  key={order.id} 
                  className="bg-white border border-black/5 rounded-sm shadow-sm overflow-hidden"
                >
                  
                  {/* Collapsed Header Card */}
                  <div 
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-brand-cream/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-black/90">ID: {order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-black/40 text-[10px] font-mono">
                        <Calendar className="w-3.5 h-3.5 text-brand-taupe" />
                        <span>Sénégal • {dateString}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-black/5">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] uppercase tracking-widest text-black/40 font-bold block mb-0.5">Montant Réglé</span>
                        <span className="text-sm font-mono font-bold text-black">{formatPrice(order.total)}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-black/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-black/40" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-black/5 bg-brand-cream/30 overflow-hidden"
                      >
                        <div className="p-5 md:p-6 space-y-6">
                          
                          {/* 1. Address & Payment Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Address details */}
                            <div className="bg-white p-4 border border-black/5 rounded-sm text-xs space-y-2">
                              <h4 className="text-[9px] uppercase tracking-widest text-brand-gold font-bold flex items-center gap-1.5 border-b border-black/5 pb-1.5 mb-2">
                                <MapPin className="w-3.5 h-3.5" />
                                Adresse d'expédition
                              </h4>
                              {order.address ? (
                                <>
                                  <p className="font-bold font-serif italic text-black/80">{order.address.title || 'Livraison standard'}</p>
                                  <p className="text-black/60 font-serif italic">{order.address.full_address}</p>
                                  <p className="font-mono text-[10px] text-black/40 pt-1">Contact: {order.address.phone}</p>
                                </>
                              ) : (
                                <p className="text-black/40 italic">Adresse de livraison à Dakar</p>
                              )}
                            </div>

                            {/* Payment details */}
                            <div className="bg-white p-4 border border-black/5 rounded-sm text-xs space-y-2">
                              <h4 className="text-[9px] uppercase tracking-widest text-brand-gold font-bold flex items-center gap-1.5 border-b border-black/5 pb-1.5 mb-2">
                                <CreditCard className="w-3.5 h-3.5" />
                                Informations de règlement
                              </h4>
                              <p className="text-black/80 font-medium">
                                Mode : <span className="font-semibold">{order.payment_method_code === 'cod' ? 'Paiement à la livraison' : order.payment_method_code === 'wave' ? 'Wave Sénégal' : 'Orange Money'}</span>
                              </p>
                              {order.payment_method_code !== 'cod' && (
                                <div className="mt-2 p-2 bg-brand-cream border border-black/5 text-[10px] font-mono leading-relaxed text-black/50">
                                  <span>Vérification du transfert : </span>
                                  <strong className="text-black/80 font-semibold block pt-0.5">En cours par notre pôle financier de Dakar.</strong>
                                </div>
                              )}
                              {order.payment_method_code === 'cod' && (
                                <p className="text-[10px] text-black/40 leading-relaxed mt-1">
                                  * Veuillez préparer l'appoint exact en espèces lors du passage du livreur 2M à Dakar.
                                </p>
                              )}
                            </div>

                          </div>

                          {/* 2. Items Ordered List */}
                          <div className="space-y-3">
                            <h4 className="text-[9px] uppercase tracking-widest text-brand-gold font-bold border-b border-black/5 pb-1">
                              Articles de l'ordre
                            </h4>

                            <div className="divide-y divide-black/5 bg-white border border-black/5 rounded-sm px-4">
                              {lineItems.map((item: any) => {
                                const prodName = item.product?.name || "Formulation Spécifique 2M";
                                const prodImg = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null;

                                return (
                                  <div key={item.id} className="flex gap-4 py-3.5 items-center text-xs">
                                    <div className="w-10 h-12 bg-brand-cream border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                                      {prodImg ? (
                                        <img 
                                          src={prodImg} 
                                          alt={prodName} 
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="font-serif italic text-black/20 text-[8px]">2M</span>
                                      )}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                      <h5 className="font-serif italic text-black/80 font-bold truncate leading-snug">
                                        {prodName}
                                      </h5>
                                      <p className="text-[10px] text-black/40 font-mono mt-0.5">
                                        {item.quantity} x {formatPrice(item.unit_price)}
                                      </p>
                                    </div>

                                    <span className="font-mono font-bold text-black/80 shrink-0">
                                      {formatPrice(item.total_price)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3. Detailed Price Breakdown */}
                          <div className="flex justify-end pt-2 border-t border-black/5 text-xs text-black/60 font-light">
                            <div className="w-full md:w-64 space-y-2">
                              <div className="flex justify-between font-mono">
                                <span>Sous-total :</span>
                                <span className="text-black/85 font-semibold">{formatPrice(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between font-mono">
                                <span>Frais de livraison :</span>
                                <span className="text-black/85 font-semibold">
                                  {order.shipping_fee === 0 ? 'Gratuit' : formatPrice(order.shipping_fee)}
                                </span>
                              </div>
                              <div className="flex justify-between font-mono pt-2 border-t border-black/5 text-sm font-semibold text-black">
                                <span>Total facturé :</span>
                                <span className="font-bold">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}

        {/* Customer Help Banner */}
        <div className="mt-12 p-6 bg-white border border-black/5 text-xs flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-sm shadow-sm">
          <div className="space-y-1">
            <h4 className="font-serif italic font-bold text-black/80 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-gold" />
              Une interrogation sur vos expéditions ?
            </h4>
            <p className="text-black/50 leading-relaxed text-[11px]">
              Toute modification d'adresse ou demande d'annulation est prise en charge par notre bureau d'herboristerie de Dakar Plateau.
            </p>
          </div>
          <a 
            href={`tel:${CONTACT_CONFIG.phoneRaw}`} 
            className="px-5 py-2.5 border border-black/15 text-black text-[10px] uppercase tracking-widest font-bold hover:bg-brand-cream transition-colors rounded-sm shrink-0 font-mono"
          >
            {CONTACT_CONFIG.phone}
          </a>
        </div>

      </div>
    </div>
  );
}
