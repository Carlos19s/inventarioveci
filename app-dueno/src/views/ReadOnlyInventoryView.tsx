import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, RefreshCw, AlertCircle, Tag } from 'lucide-react';
import type { Product, Category, GenderType } from '../types';
import { getProducts, getCategories } from '../services/api';

const DEFAULT_SIZES = ['Todas', 'S', 'M', 'L', 'XL', '2', '4', '6', '8'];

export const ReadOnlyInventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderType | 'Todos'>('Todos');
  const [selectedSize, setSelectedSize] = useState('Todas');
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pData, cData] = await Promise.all([
        getProducts({
          search: search.trim() || undefined,
          categoryId: selectedCategory || undefined,
          gender: selectedGender !== 'Todos' ? selectedGender : undefined,
          size: selectedSize !== 'Todas' ? selectedSize : undefined
        }),
        getCategories()
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedGender, selectedSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Security Banner */}
      <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '10px 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert size={20} color="#0F172A" />
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
            Inventario en Modo Seguro (Solo Lectura)
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Acceso restringido para el dueño. No se permite agregar ni eliminar prendas por seguridad.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 14 }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 42, paddingRight: 40, height: 46 }}
          placeholder="Buscar prenda, código SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={loadData}
          style={{ position: 'absolute', right: 8, top: 7, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#64748B' }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Category Chips */}
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

      {/* Gender & Size filter row (No Emojis) */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1.4, display: 'flex', background: '#E2E8F0', padding: 3, borderRadius: 12 }}>
          {(['Todos', 'Niño', 'Niña', 'Unisex'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              style={{
                flex: 1,
                border: 'none',
                background: selectedGender === g ? '#0F172A' : 'transparent',
                color: selectedGender === g ? 'white' : '#64748B',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '6px 2px',
                borderRadius: 9,
                cursor: 'pointer'
              }}
            >
              {g}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <select
            className="input-field"
            style={{ padding: '6px 10px', height: 36, fontSize: '0.8rem', fontWeight: 600 }}
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {Array.from(new Set([...DEFAULT_SIZES, ...products.map(p => p.size).filter(Boolean)])).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 12, borderRadius: 14, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
          <RefreshCw size={24} className="spin" color="#0F172A" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.82rem' }}>Cargando inventario...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <Tag size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
          <h4 style={{ fontWeight: 700, color: '#1E293B' }}>Sin prendas en este filtro</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map((p) => {
            const unitProfit = p.salePrice - p.purchasePrice;
            const marginPct = p.salePrice > 0 ? ((unitProfit / p.salePrice) * 100).toFixed(1) : '0';
            const totalStockProfit = unitProfit * p.stock;

            return (
              <div key={p.id} className="card" style={{ padding: 12, display: 'flex', gap: 12 }}>
                {/* Photo */}
                <div style={{ width: 75, height: 75, borderRadius: 12, background: '#F1F5F9', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl.replace(/http:\/\/localhost(:\d+)?/, 'http://inventarioveci.runasp.net')}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).parentElement?.querySelector('.img-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="img-fallback"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: p.imageUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8'
                    }}
                  >
                    <Tag size={24} />
                  </div>
                </div>

                {/* Info (No Emojis) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#E05D82', fontWeight: 700, textTransform: 'uppercase' }}>
                        {p.categoryName} • {p.gender}
                      </span>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.25 }}>
                        {p.name}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', background: p.stock <= 3 ? '#FEE2E2' : '#DCFCE7', color: p.stock <= 3 ? '#B91C1C' : '#15803D', padding: '2px 8px', borderRadius: 12, fontWeight: 800 }}>
                      {p.stock} en stock
                    </span>
                  </div>

                  {/* Financial Metrics per Product */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: '#F8FAFC', padding: 8, borderRadius: 10, marginTop: 8, fontSize: '0.75rem', textAlign: 'center' }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.65rem' }}>Compra</span>
                      <strong style={{ color: '#334155' }}>${p.purchasePrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.65rem' }}>Venta</span>
                      <strong style={{ color: '#0F172A' }}>${p.salePrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#10B981', display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>Ganancia</span>
                      <strong style={{ color: '#10B981' }}>+${unitProfit.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Potential Profit */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.72rem', color: '#64748B' }}>
                    <span>Margen: <strong>{marginPct}%</strong></span>
                    <span>Ganancia en stock: <strong style={{ color: '#059669' }}>+${totalStockProfit.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
