export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  mainImage: string;
  thumbnails: string[];
  shortDescription: string;
  longDescription: string;
  specs: ProductSpec[];
  badge?: string; // e.g. "NUEVO", "OFERTA", "TOP VENTAS"
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type TabId = 'inicio' | 'catalogo' | 'detalle' | 'carrito';

export type CategoryId = 'Todos' | 'Teclados' | 'Mouse' | 'Headsets' | 'Webcams' | 'Monitores' | 'Accesorios';
