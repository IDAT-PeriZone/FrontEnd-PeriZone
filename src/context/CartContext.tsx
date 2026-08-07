import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as carritoApi from '../api/carrito';
import type { CartSummary } from '../types';

interface CartContextValue {
  cart: CartSummary | null;
  loading: boolean;
  addItem: (idProducto: number, cantidad: number) => Promise<void>;
  updateItem: (idProducto: number, cantidad: number) => Promise<void>;
  removeItem: (idProducto: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCart(await carritoApi.ver());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load/clear the cart when auth state changes
    if (usuario) refresh();
    else setCart(null);
  }, [usuario, refresh]);

  const addItem = useCallback(async (idProducto: number, cantidad: number) => {
    setCart(await carritoApi.agregarItem(idProducto, cantidad));
  }, []);

  const updateItem = useCallback(async (idProducto: number, cantidad: number) => {
    setCart(await carritoApi.actualizarItem(idProducto, cantidad));
  }, []);

  const removeItem = useCallback(async (idProducto: number) => {
    setCart(await carritoApi.quitarItem(idProducto));
  }, []);

  const clear = useCallback(async () => {
    await carritoApi.vaciar();
    await refresh();
  }, [refresh]);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives alongside its provider
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
