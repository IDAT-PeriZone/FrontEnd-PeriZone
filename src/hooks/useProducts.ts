import { useEffect, useState } from 'react';
import * as productosApi from '../api/productos';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productosApi
      .listar()
      .then(setProducts)
      .catch(() => setError('No se pudieron cargar los productos. Verifica que el backend esté corriendo.'))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
