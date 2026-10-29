import { useState, useEffect } from 'react';
import { Store, Settings } from 'lucide-react';
import type { Category, Product } from './types';
import { getCategories } from './services/api';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { CategoryModal } from './components/CategoryModal';
import { SettingsModal } from './components/SettingsModal';
import { InventoryView } from './views/InventoryView';
import { RegisterProductView } from './views/RegisterProductView';
import { QuickSaleView } from './views/QuickSaleView';
import type { CartItem } from './views/QuickSaleView';
import { SalesHistoryView } from './views/SalesHistoryView';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCategory.id)) return prev;
      return [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCart([]);

  return (
    <>
      {/* Header with notch padding and zero emojis */}
      <header className="app-header">
        <div className="brand-title">
          <Store size={22} color="#E05D82" />
          <span>VeciBar Bebé</span>
          <span style={{ fontSize: '0.65rem', background: '#FCE7F3', color: '#DB2777', padding: '2px 8px', borderRadius: 12, fontWeight: 700, letterSpacing: '0.5px' }}>
            VENDEDORA
          </span>
        </div>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          style={{ background: '#F1F5F9', border: 'none', padding: 8, borderRadius: 10, cursor: 'pointer', color: '#64748B' }}
          title="Configurar servidor API"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="content-area">
        {activeTab === 'inventory' && (
          <InventoryView
            categories={categories}
            onRefreshCategories={loadCategories}
            onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
            onAddToCart={handleAddToCart}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {activeTab === 'register' && (
          <RegisterProductView
            categories={categories}
            onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
            onProductCreated={loadCategories}
          />
        )}

        {activeTab === 'sale' && (
          <QuickSaleView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onSaleSuccess={loadCategories}
            onGoToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'history' && <SalesHistoryView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
      />

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* API Server Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaved={loadCategories}
      />
    </>
  );
}

export default App;
