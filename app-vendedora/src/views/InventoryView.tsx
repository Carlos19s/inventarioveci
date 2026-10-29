import React, { useState, useEffect } from 'react';
import { Search, Sparkles, RefreshCw, AlertCircle, PackageSearch, Settings } from 'lucide-react';
import type { Category, Product, GenderType } from '../types';
import { getProducts, getApiUrl } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface InventoryViewProps {
  categories: Category[];
  onRefreshCategories: () => void;
  onOpenNewCategoryModal: () => void;
  onAddToCart: (product: Product) => void;
  onOpenSettings: () => void;
}

const SIZES = ['Todas', 'RN (0-1M)', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2T', '3T', '4T'];

export const InventoryView: React.FC<InventoryViewProps> = ({
  categories,
  onRefreshCategories,
  onOpenNewCategoryModal,
  onAddToCart,
  onOpenSettings
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderType | 'Todos'>('Todos');
  const [selectedSize, setSelectedSize] = useState('Todas');
  const [error, setError] = useState<string | null>(null);

  const currentApi = getApiUrl();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        gender: selectedGender !== 'Todos' ? selectedGender : undefined,
        size: selectedSize !== 'Todas' ? selectedSize : undefined
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedGender, selectedSize]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 42, paddingRight: 40, height: 46 }}
          placeholder="Buscar mameluco, body, conjunto, código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            loadProducts();
            onRefreshCategories();
          }}
          style={{
            position: 'absolute',
            right: 8,
            top: 7,
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: '#64748B'
          }}
          title="Actualizar"
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Dynamic Category Chips - Always updated with Turso */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Categorías ({categories.length})
          </span>
          <button
            onClick={onOpenNewCategoryModal}
            style={{
              background: 'none',
              border: 'none',
              color: '#E05D82',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={13} />
            <span>+ Nueva Categoría</span>
          </button>
        </div>

        <div className="chips-container">
          <button
            className={`chip ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender & Size Filters Row (Clean, No Emojis) */}
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Gender selector */}
        <div style={{ flex: 1.4, display: 'flex', background: '#E2E8F0', padding: 3, borderRadius: 12 }}>
          {(['Todos', 'Niño', 'Niña', 'Unisex'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              style={{
                flex: 1,
                border: 'none',
                background: selectedGender === g ? 'white' : 'transparent',
                color: selectedGender === g ? '#0F172A' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '6px 2px',
                borderRadius: 9,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Size dropdown */}
        <div style={{ flex: 1 }}>
          <select
            className="input-field"
            style={{ padding: '6px 10px', height: 36, fontSize: '0.8rem', fontWeight: 600 }}
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Connection Error Banner with Quick Fix */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 14px', borderRadius: 14, color: '#B91C1C', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #FECACA', paddingTop: 6, fontSize: '0.75rem' }}>
            <span style={{ color: '#64748B' }}>Servidor: <strong>{currentApi}</strong></span>
            <button
              onClick={onOpenSettings}
              style={{ background: '#B91C1C', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Settings size={12} />
              <span>Ajustar Servidor</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
          <RefreshCw size={28} className="spin" color="#E05D82" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cargando inventario de Turso...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'white', borderRadius: 18, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <PackageSearch size={40} color="#94A3B8" />
          <h4 style={{ fontWeight: 800, color: '#1E293B' }}>No hay prendas encontradas</h4>
          <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: 260 }}>
            Prueba cambiando los filtros o registra nueva mercadería con el botón "+".
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};
