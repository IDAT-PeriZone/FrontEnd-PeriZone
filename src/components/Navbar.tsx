import type { TabId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuth: () => void;
}

export default function Navbar({ activeTab, onNavigate, searchQuery, onSearchChange, onOpenAuth }: NavbarProps) {
  const { usuario, logout } = useAuth();
  const { cart } = useCart();
  const totalQty = cart?.items.reduce((acc, item) => acc + item.cantidad, 0) ?? 0;

  const handleMisPedidos = () => {
    if (!usuario) { onOpenAuth(); return; }
    onNavigate('pedidos');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <button className="brand" onClick={() => onNavigate('inicio')}>
          <span className="brand-peri">PERI</span><span className="brand-zone">ZONE</span>
        </button>

        {/* Nav Links */}
        <nav className="nav-links">
          <button className={`nav-link ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => onNavigate('inicio')}>
            Inicio
          </button>
          <button className={`nav-link ${activeTab === 'catalogo' ? 'active' : ''}`} onClick={() => onNavigate('catalogo')}>
            Productos
          </button>
          <button className={`nav-link ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={handleMisPedidos}>
            Mis pedidos
          </button>
        </nav>

        {/* Search */}
        <div className="navbar-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => { onSearchChange(e.target.value); onNavigate('catalogo'); }}
          />
        </div>

        {/* Cart */}
        <button className="cart-btn" onClick={() => onNavigate('carrito')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>Carrito</span>
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </button>

        {/* Auth */}
        {usuario ? (
          <button className="nav-link" onClick={logout} title={usuario.correo}>
            Hola, {usuario.nombre} · Salir
          </button>
        ) : (
          <button className="btn-outline" onClick={onOpenAuth}>
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
}
