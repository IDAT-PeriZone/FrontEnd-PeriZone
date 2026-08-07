// Tipos alineados 1:1 con las respuestas del backend (BackEnd-PeriZone).

export type TabId = 'inicio' | 'catalogo' | 'detalle' | 'carrito' | 'checkout' | 'pedidos';

export type RolNombre = 'administrador' | 'finanzas' | 'almacen' | 'marketing' | 'cliente';

export interface Usuario {
  id: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  activo: number;
  fecha_creacion: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface ProductImage {
  id: number;
  id_producto: number;
  imagen_url: string;
  orden: number;
}

export interface Product {
  id: number;
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  stock_minimo: number;
  imagen_url: string | null;
  activo: boolean;
  imagenes?: ProductImage[];
}

export interface CartItem {
  id: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
}

export interface CartSummary {
  id_carrito: number;
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
}

export interface Direccion {
  id: number;
  id_usuario: number;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  referencia: string | null;
  predeterminada: number;
}

export type MetodoPago = 'tarjeta' | 'yape' | 'transferencia';
export type EstadoOrden = 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';

export interface Orden {
  id: number;
  id_usuario: number;
  id_direccion: number | null;
  direccion_entrega: string;
  estado: EstadoOrden;
  subtotal: number;
  igv: number;
  total: number;
  metodo_pago: MetodoPago;
  fecha_creacion: string;
  /** Solo presentes en las respuestas del panel admin (GET /ordenes y GET /ordenes/:id). */
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_correo?: string;
}

export interface DetalleOrden {
  id: number;
  id_orden: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre: string;
}

export interface HistorialEstadoOrden {
  id: number;
  id_orden: number;
  estado_anterior: EstadoOrden | null;
  estado_nuevo: EstadoOrden;
  fecha_creacion: string;
}

export interface Pago {
  id: number;
  id_orden: number;
  metodo_pago: MetodoPago;
  monto: number;
  estado: EstadoPago;
  referencia_pasarela: string | null;
  ultimos_digitos_tarjeta: string | null;
  fecha_pago: string | null;
}

export interface Comprobante {
  id: number;
  id_orden: number;
  tipo: 'boleta' | 'factura';
  numero: string;
  ruc_razon_social: string | null;
  monto_total: number;
  igv: number;
  fecha_creacion: string;
}

export interface OrdenDetalleCompleto {
  orden: Orden;
  detalle: DetalleOrden[];
  historial: HistorialEstadoOrden[];
  pagos: Pago[];
  comprobante: Comprobante | null;
}

export type CategoryId = number | 'Todos';

// ── Panel administrativo ──

export type TipoMovimiento = 'entrada' | 'salida';

export interface MovimientoInventario {
  id: number;
  id_producto: number;
  tipo: TipoMovimiento;
  cantidad: number;
  stock_anterior: number;
  stock_resultante: number;
  motivo: string;
  id_orden: number | null;
  id_usuario: number | null;
  fecha_creacion: string;
  producto_nombre?: string;
}

export interface ResumenDashboard {
  ordenes_hoy: number;
  ingresos_hoy: number;
  productos_stock_bajo: number;
}

export interface VentaPorDia {
  fecha: string;
  cantidad_ordenes: number;
  total_vendido: number;
}

export interface ProductoMasVendido {
  id_producto: number;
  nombre: string;
  unidades_vendidas: number;
  total_generado: number;
}
