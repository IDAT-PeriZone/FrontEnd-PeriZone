import { useState } from 'react'
import './App.css'
import type { TabId, Product, CartItem, CategoryId } from './types'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomeTab from './components/HomeTab'
import CatalogTab from './components/CatalogTab'
import ProductDetailTab from './components/ProductDetailTab'
import CartTab from './components/CartTab'
import OrderSuccessModal from './components/OrderSuccessModal'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('inicio')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryId>('Todos')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const handleNavigate = (tab: TabId, product?: Product) => {
    if (tab === 'detalle' && product) setSelectedProduct(product)
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.product.stock, item.quantity + qty) }
            : item
        )
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  const handleUpdateQty = (productId: string, qty: number) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity: qty } : item
    ))
  }

  const handleRemove = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const handleCheckout = () => {
    setShowSuccess(true)
    setCart([])
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
  }

  const orderTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  const orderTotalWithTaxAndShipping = orderTotal + (cart.length > 0 ? 15 : 0) + orderTotal * 0.18

  return (
    <div className="perizone-app">
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        cartItems={cart}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="perizone-main">
        {activeTab === 'inicio' && (
          <HomeTab
            onNavigate={handleNavigate}
            onCategoryFilter={cat => setCategoryFilter(cat)}
          />
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
          <ProductDetailTab
            product={selectedProduct}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}
        {activeTab === 'carrito' && (
          <CartTab
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onNavigate={handleNavigate}
            onCheckout={handleCheckout}
          />
        )}
      </main>

      <Footer />

      {showSuccess && (
        <OrderSuccessModal
          onClose={handleCloseSuccess}
          onNavigate={handleNavigate}
          orderTotal={orderTotalWithTaxAndShipping}
        />
      )}
    </div>
  )
}

export default App
