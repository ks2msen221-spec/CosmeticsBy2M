import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { catalogService } from '../lib/catalogService';
import { Product } from '../types/catalog';

// Helper to validate UUIDs
const isUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};


export interface CartItem {
  id?: string; // Database entry id (if logged in)
  product_id: string;
  quantity: number;
  product?: Product; // Loaded dynamically to calculate accurate live price
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  subtotal: number;
  totalQuantity: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isMocked } = useAuth();
  const [rawItems, setRawItems] = useState<{ id?: string; product_id: string; quantity: number }[]>([]);
  const [enrichedItems, setEnrichedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const LOCAL_CART_KEY = '2m_cosmetics_guest_cart';
  const MOCK_DB_CART_PREFIX = '2m_cosmetics_mock_user_cart_';

  // Load raw cart items on mount or when user changes
  const loadRawCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        if (isMocked || !supabase) {
          // Mock DB Cart for authenticated user in mock mode
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          const stored = localStorage.getItem(mockDbKey);
          if (stored) {
            setRawItems(JSON.parse(stored));
          } else {
            setRawItems([]);
          }
        } else {
          // Real Supabase Cart
          const { data, error } = await supabase
            .from('cart_items')
            .select('id, product_id, quantity')
            .eq('user_id', user.id);
          
          if (error) {
            console.error("Error loading cart items from Supabase:", error);
            setRawItems([]);
          } else {
            setRawItems(data || []);
          }
        }
      } else {
        // Guest Cart from localStorage
        const stored = localStorage.getItem(LOCAL_CART_KEY);
        if (stored) {
          setRawItems(JSON.parse(stored));
        } else {
          setRawItems([]);
        }
      }
    } catch (err) {
      console.error("Failed to load raw cart:", err);
    } finally {
      setLoading(false);
    }
  }, [user, isMocked]);

  // Merge local guest cart to user cart when user signs in
  useEffect(() => {
    async function mergeCartOnLogin() {
      if (!user) return;

      const guestCartStr = localStorage.getItem(LOCAL_CART_KEY);
      if (!guestCartStr) {
        // No guest cart to merge, just load standard user cart
        await loadRawCart();
        return;
      }

      try {
        const guestItems: { product_id: string; quantity: number }[] = JSON.parse(guestCartStr);
        if (guestItems.length === 0) {
          await loadRawCart();
          return;
        }

        setLoading(true);

        if (isMocked || !supabase) {
          // Merge in Mock Storage
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          const storedUserCartStr = localStorage.getItem(mockDbKey);
          const userItems: { id?: string; product_id: string; quantity: number }[] = storedUserCartStr 
            ? JSON.parse(storedUserCartStr) 
            : [];

          guestItems.forEach((guestItem) => {
            const existingIndex = userItems.findIndex(ui => ui.product_id === guestItem.product_id);
            if (existingIndex > -1) {
              userItems[existingIndex].quantity += guestItem.quantity;
            } else {
              userItems.push({
                id: 'cart_' + Math.random().toString(36).substring(2, 9),
                product_id: guestItem.product_id,
                quantity: guestItem.quantity
              });
            }
          });

          localStorage.setItem(mockDbKey, JSON.stringify(userItems));
        } else {
          // Merge in Real Supabase
          // 1. Fetch user's existing database cart items
          const { data: userItems, error: fetchErr } = await supabase
            .from('cart_items')
            .select('id, product_id, quantity')
            .eq('user_id', user.id);

          if (fetchErr) throw fetchErr;

          const existingMap = new Map<string, { id: string; quantity: number }>();
          if (userItems) {
            userItems.forEach(item => {
              existingMap.set(item.product_id, { id: item.id, quantity: item.quantity });
            });
          }

          // 2. Insert/Update sequentially
          for (const guestItem of guestItems) {
            const existing = existingMap.get(guestItem.product_id);
            if (existing) {
              // Update quantity
              const { error: updateErr } = await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + guestItem.quantity })
                .eq('id', existing.id);
              if (updateErr) console.error("Error updating merged item:", updateErr);
            } else {
              // Insert new
              const { error: insertErr } = await supabase
                .from('cart_items')
                .insert({
                  user_id: user.id,
                  product_id: guestItem.product_id,
                  quantity: guestItem.quantity
                });
              if (insertErr) console.error("Error inserting merged item:", insertErr);
            }
          }
        }

        // Clear guest cart from localStorage as requested
        localStorage.removeItem(LOCAL_CART_KEY);
      } catch (err) {
        console.error("Failed to merge guest cart with user cart on login:", err);
      } finally {
        await loadRawCart();
      }
    }

    mergeCartOnLogin();
  }, [user, isMocked, loadRawCart]);

  // Initial load
  useEffect(() => {
    loadRawCart();
  }, [loadRawCart]);

  // Enrich raw items with dynamic product details loaded from database/catalogService, and clean up invalid ones
  useEffect(() => {
    async function enrichCartItems() {
      if (rawItems.length === 0) {
        setEnrichedItems([]);
        return;
      }

      try {
        // 1. Separate valid and invalid UUID product_ids to prevent DB query crashes
        const validRawItems = rawItems.filter(item => isUUID(item.product_id));
        const invalidRawItems = rawItems.filter(item => !isUUID(item.product_id));

        // Cleanup invalid UUID items from persistence automatically
        if (invalidRawItems.length > 0) {
          console.warn("Maison 2M - Suppression d'articles avec des IDs non-UUID du panier:", invalidRawItems);
          
          if (!user) {
            // Guest cart localStorage
            const guestStored = localStorage.getItem(LOCAL_CART_KEY);
            if (guestStored) {
              const parsed = JSON.parse(guestStored);
              const cleaned = parsed.filter((item: any) => isUUID(item.product_id));
              localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cleaned));
            }
          } else if (isMocked || !supabase) {
            // Mock logged-in user cart
            const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
            const mockStored = localStorage.getItem(mockDbKey);
            if (mockStored) {
              const parsed = JSON.parse(mockStored);
              const cleaned = parsed.filter((item: any) => isUUID(item.product_id));
              localStorage.setItem(mockDbKey, JSON.stringify(cleaned));
            }
          } else {
            // Real Supabase: Delete rows by their database primary keys
            const rowIdsToDelete = invalidRawItems.map(item => item.id).filter(Boolean) as string[];
            if (rowIdsToDelete.length > 0) {
              await supabase.from('cart_items').delete().in('id', rowIdsToDelete);
            }
          }
        }

        if (validRawItems.length === 0) {
          setRawItems([]);
          setEnrichedItems([]);
          return;
        }

        // 2. Fetch details only for the valid UUID product_ids
        const productIds = validRawItems.map(item => item.product_id);
        const products = await catalogService.getProductsByIds(productIds);

        // 3. Find if any of the products do not exist in our database/catalog
        const existingRawItems = validRawItems.filter(raw => products.some(p => p.id === raw.product_id));
        const missingRawItems = validRawItems.filter(raw => !products.some(p => p.id === raw.product_id));

        // Cleanup missing/deleted products from persistence automatically
        if (missingRawItems.length > 0) {
          console.warn("Maison 2M - Suppression d'articles du panier référençant des produits inexistants:", missingRawItems);
          
          if (!user) {
            // Guest cart localStorage
            const guestStored = localStorage.getItem(LOCAL_CART_KEY);
            if (guestStored) {
              const parsed = JSON.parse(guestStored);
              const cleaned = parsed.filter((item: any) => products.some(p => p.id === item.product_id));
              localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cleaned));
            }
          } else if (isMocked || !supabase) {
            // Mock logged-in user cart
            const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
            const mockStored = localStorage.getItem(mockDbKey);
            if (mockStored) {
              const parsed = JSON.parse(mockStored);
              const cleaned = parsed.filter((item: any) => products.some(p => p.id === item.product_id));
              localStorage.setItem(mockDbKey, JSON.stringify(cleaned));
            }
          } else {
            // Real Supabase: Delete rows by their database primary keys
            const rowIdsToDelete = missingRawItems.map(item => item.id).filter(Boolean) as string[];
            if (rowIdsToDelete.length > 0) {
              await supabase.from('cart_items').delete().in('id', rowIdsToDelete);
            }
          }
        }

        // 4. Update the state if any items were filtered out to reflect the clean state in the UI
        if (invalidRawItems.length > 0 || missingRawItems.length > 0) {
          setRawItems(existingRawItems);
        }

        // 5. Build enriched items with their corresponding loaded product details
        const enriched = existingRawItems.map(raw => {
          const product = products.find(p => p.id === raw.product_id)!;
          return {
            ...raw,
            product
          };
        });

        setEnrichedItems(enriched);
      } catch (err) {
        console.error("Error enriching or cleaning cart items with product details:", err);
      }
    }

    enrichCartItems();
  }, [rawItems, user, isMocked]);

  // Add item to cart
  const addToCart = async (productId: string, quantity: number) => {
    if (quantity <= 0) return;

    try {
      if (user) {
        if (isMocked || !supabase) {
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          const stored = localStorage.getItem(mockDbKey);
          const items: { id?: string; product_id: string; quantity: number }[] = stored ? JSON.parse(stored) : [];
          
          const existingIndex = items.findIndex(i => i.product_id === productId);
          if (existingIndex > -1) {
            items[existingIndex].quantity += quantity;
          } else {
            items.push({
              id: 'cart_' + Math.random().toString(36).substring(2, 9),
              product_id: productId,
              quantity
            });
          }
          localStorage.setItem(mockDbKey, JSON.stringify(items));
          setRawItems(items);
        } else {
          // Supabase add: check if exists, then update or insert
          const { data: existing, error: checkErr } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle();

          if (checkErr) throw checkErr;

          if (existing) {
            const { error: updateErr } = await supabase
              .from('cart_items')
              .update({ quantity: existing.quantity + quantity })
              .eq('id', existing.id);
            if (updateErr) throw updateErr;
          } else {
            const { error: insertErr } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: productId,
                quantity
              });
            if (insertErr) throw insertErr;
          }
          await loadRawCart();
        }
      } else {
        // Guest localStorage
        const stored = localStorage.getItem(LOCAL_CART_KEY);
        const items: { product_id: string; quantity: number }[] = stored ? JSON.parse(stored) : [];
        
        const existingIndex = items.findIndex(i => i.product_id === productId);
        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({ product_id: productId, quantity });
        }
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
        setRawItems(items);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      if (user) {
        if (isMocked || !supabase) {
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          const stored = localStorage.getItem(mockDbKey);
          if (stored) {
            const items: { id?: string; product_id: string; quantity: number }[] = JSON.parse(stored);
            const index = items.findIndex(i => i.product_id === productId);
            if (index > -1) {
              items[index].quantity = quantity;
              localStorage.setItem(mockDbKey, JSON.stringify(items));
              setRawItems(items);
            }
          }
        } else {
          // Update in Supabase
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);
          
          if (error) throw error;
          await loadRawCart();
        }
      } else {
        // Guest localStorage
        const stored = localStorage.getItem(LOCAL_CART_KEY);
        if (stored) {
          const items: { product_id: string; quantity: number }[] = JSON.parse(stored);
          const index = items.findIndex(i => i.product_id === productId);
          if (index > -1) {
            items[index].quantity = quantity;
            localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
            setRawItems(items);
          }
        }
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      if (user) {
        if (isMocked || !supabase) {
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          const stored = localStorage.getItem(mockDbKey);
          if (stored) {
            let items: { id?: string; product_id: string; quantity: number }[] = JSON.parse(stored);
            items = items.filter(i => i.product_id !== productId);
            localStorage.setItem(mockDbKey, JSON.stringify(items));
            setRawItems(items);
          }
        } else {
          // Delete from Supabase
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
          
          if (error) throw error;
          await loadRawCart();
        }
      } else {
        // Guest localStorage
        const stored = localStorage.getItem(LOCAL_CART_KEY);
        if (stored) {
          let items: { product_id: string; quantity: number }[] = JSON.parse(stored);
          items = items.filter(i => i.product_id !== productId);
          localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
          setRawItems(items);
        }
      }
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (user) {
        if (isMocked || !supabase) {
          const mockDbKey = `${MOCK_DB_CART_PREFIX}${user.id}`;
          localStorage.removeItem(mockDbKey);
          setRawItems([]);
        } else {
          // Delete all cart items of the user
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
          
          if (error) throw error;
          setRawItems([]);
        }
      } else {
        // Guest localStorage
        localStorage.removeItem(LOCAL_CART_KEY);
        setRawItems([]);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // Calculate dynamic subtotal & quantities based on latest fetched prices
  const subtotal = useMemo(() => {
    return enrichedItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  }, [enrichedItems]);

  const totalQuantity = useMemo(() => {
    return enrichedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [enrichedItems]);

  return (
    <CartContext.Provider value={{
      cartItems: enrichedItems,
      loading,
      subtotal,
      totalQuantity,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: loadRawCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
