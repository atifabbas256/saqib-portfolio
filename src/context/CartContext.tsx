import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart } from '../types';
import {
  addCartLine,
  createCart,
  fetchCart,
  removeCartLine,
  updateCartLineQuantity,
} from '../api/cart';

const CART_ID_STORAGE_KEY = 'shopify_cart_id';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On launch, try to rehydrate a previously created cart so items persist
  // across app restarts (Shopify carts are valid for a limited time window).
  useEffect(() => {
    (async () => {
      try {
        const savedId = await AsyncStorage.getItem(CART_ID_STORAGE_KEY);
        if (savedId) {
          const existing = await fetchCart(savedId);
          if (existing) {
            setCart(existing);
            return;
          }
        }
      } catch (e) {
        // Non-fatal — a fresh cart will be created on first add-to-cart.
        console.warn('Failed to rehydrate cart', e);
      }
    })();
  }, []);

  const persistCartId = async (id: string) => {
    await AsyncStorage.setItem(CART_ID_STORAGE_KEY, id);
  };

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true);
      setError(null);
      try {
        if (!cart) {
          const newCart = await createCart(variantId, quantity);
          setCart(newCart);
          await persistCartId(newCart.id);
        } else {
          const updated = await addCartLine(cart.id, variantId, quantity);
          setCart(updated);
        }
      } catch (e: any) {
        setError(e.message ?? 'Could not add item to cart');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setLoading(true);
      setError(null);
      try {
        if (quantity <= 0) {
          const updated = await removeCartLine(cart.id, lineId);
          setCart(updated);
        } else {
          const updated = await updateCartLineQuantity(cart.id, lineId, quantity);
          setCart(updated);
        }
      } catch (e: any) {
        setError(e.message ?? 'Could not update quantity');
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setLoading(true);
      setError(null);
      try {
        const updated = await removeCartLine(cart.id, lineId);
        setCart(updated);
      } catch (e: any) {
        setError(e.message ?? 'Could not remove item');
      } finally {
        setLoading(false);
      }
    },
    [cart]
  );

  const refreshCart = useCallback(async () => {
    if (!cart) return;
    const latest = await fetchCart(cart.id);
    if (latest) setCart(latest);
  }, [cart]);

  const itemCount = useMemo(() => cart?.totalQuantity ?? 0, [cart]);

  const value: CartContextValue = {
    cart,
    loading,
    error,
    itemCount,
    addToCart,
    updateQuantity,
    removeLine,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
