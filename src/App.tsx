import { useState } from 'react'
import './App.css'
import type { TabId, Product, CategoryId } from './types'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomeTab from './components/HomeTab'
import CatalogTab from './components/CatalogTab'
import ProductDetailTab from './components/ProductDetailTab'
import CartTab from './components/CartTab'
import CheckoutTab from './components/CheckoutTab'
import MisPedidosTab from './components/MisPedidosTab'
import AuthModal from './components/AuthModal'

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('inicio')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>('Todos')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleNavigate = (tab: TabId, product?: Product) => {
    if (tab === 'detalle' && product) setSelectedProduct(product)
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCheckout = () => {
    setActiveTab('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="perizone-app">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <main className="perizone-main">
        {activeTab === 'inicio' && (
          <HomeTab onNavigate={handleNavigate} onCategoryFilter={cat => setCategoryFilter(cat)} />
        )}
        {activeTab === 'catalogo' && (
          <CatalogTab
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onCategoryFilter={cat => setCategoryFilter(cat)}
          />
        )}
        {activeTab === 'detalle' && selectedProduct && (
          <ProductDetailTab product={selectedProduct} onNavigate={handleNavigate} />
        )}
        {activeTab === 'carrito' && <CartTab onNavigate={handleNavigate} onCheckout={handleCheckout} />}
        {activeTab === 'checkout' && <CheckoutTab onNavigate={handleNavigate} />}
        {activeTab === 'pedidos' && <MisPedidosTab onNavigate={handleNavigate} />}
      </main>

      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
