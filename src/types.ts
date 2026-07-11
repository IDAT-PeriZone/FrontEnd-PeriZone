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

export type TabId = 'inicio' | 'catalogo' | 'detalle' | 'carrito' | 'checkout';

export interface CheckoutUserInfo {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface ShippingAddressInfo {
  nombre: string;
  apellidos: string;
  telefono: string;
  pais: string;
  ciudad: string;
  distrito: string;
  email: string;
  direccion: string;
  referencia: string;
  dni: string;
}

export type ShippingMethod = 'delivery' | 'pickup';

export type PaymentMethod = 'digital_wallet' | 'card' | 'cash';

export interface OrderDetails {
  orderNum: string;
  date: string;
  userInfo: CheckoutUserInfo;
  shippingAddress: ShippingAddressInfo;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export type CategoryId = 'Todos' | 'Teclados' | 'Mouse' | 'Headsets' | 'Webcams' | 'Monitores' | 'Accesorios';
