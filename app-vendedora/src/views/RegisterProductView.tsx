import React, { useState } from 'react';
import { Plus, CheckCircle2, AlertCircle, Shirt } from 'lucide-react';
import type { Category, GenderType, CreateProductInput } from '../types';
import { createProduct } from '../services/api';
import { PhotoCapture } from '../components/PhotoCapture';

interface RegisterProductViewProps {
  categories: Category[];
  onOpenNewCategoryModal: () => void;
  onProductCreated: () => void;
}

const PRESET_SIZES = ['RN (0-1M)', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2T', '3T', '4T'];

export const RegisterProductView: React.FC<RegisterProductViewProps> = ({
  categories,
  onOpenNewCategoryModal,
  onProductCreated
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);
  const [gender, setGender] = useState<GenderType>('Unisex');
  const [size, setSize] = useState('0-3M');
  const [customSize, setCustomSize] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [stock, setStock] = useState<string>('1');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if ((categoryId === 0 || !categories.some(c => c.id === categoryId)) && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const pPriceNum = parseFloat(purchasePrice) || 0;
  const sPriceNum = parseFloat(salePrice) || 0;
  const unitProfit = sPriceNum - pPriceNum;
  const profitMargin = sPriceNum > 0 ? ((unitProfit / sPriceNum) * 100).toFixed(1) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Ingresa el nombre o descripción de la prenda.');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría para la prenda.');
      return;
    }
    if (sPriceNum <= 0) {
      setError('Ingresa un precio de venta válido.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalSize = customSize.trim() ? customSize.trim() : size;

      const payload: CreateProductInput = {
        name: name.trim(),
        code: code.trim() || undefined,
        categoryId,
        gender,
        size: finalSize,
        purchasePrice: pPriceNum,
        salePrice: sPriceNum,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl || undefined,
        notes: notes.trim() || undefined
      };

      await createProduct(payload);
      setSuccess(true);
      onProductCreated();

      setName('');
      setCode('');
      setPurchasePrice('');
      setSalePrice('');
      setStock('1');
      setImageUrl('');
      setNotes('');
      setCustomSize('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la prenda en Turso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner without emojis */}
      <div style={{ background: 'linear-gradient(135deg, #FFF1F2, #FDF2F8)', padding: 14, borderRadius: 16, border: '1px solid #FFE4E6' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9F1239', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shirt size={18} color="#9F1239" />
          <span>Registro de Ropa de Bebé</span>
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#881337', marginTop: 2 }}>
          Ingreso de nueva mercadería con foto para Cloudflare y base de datos Turso
        </p>
      </div>

      {success && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: 12, borderRadius: 14, color: '#065F46', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>Prenda guardada con éxito en el inventario</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 12, borderRadius: 14, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Photo Capture */}
        <div className="card" style={{ padding: 12 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#334155' }}>
            Foto de la prenda (Cámara o Galería)
          </label>
          <PhotoCapture
            imageUrl={imageUrl}
            onImageUploaded={(url) => setImageUrl(url)}
            onImageRemoved={() => setImageUrl('')}
          />
        </div>

        {/* Basic Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
              Nombre / Descripción de la prenda *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: Mameluco Oso Polar Algodón"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                Código / SKU (opcional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: MAM-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                Stock inicial *
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Categoría de la mercadería *
            </label>
            <button
              type="button"
              onClick={onOpenNewCategoryModal}
              style={{
                background: '#FDF2F4',
                color: '#E05D82',
                border: '1px solid #FECDD3',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Plus size={13} />
              <span>+ Nueva Categoría</span>
            </button>
          </div>

          <select
            className="input-field"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Gender Selection (No Emojis) */}
        <div className="card">
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#334155' }}>
            Prenda orientada a: *
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Niño', 'Niña', 'Unisex'] as const).map((g) => {
              const active = gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: 12,
                    border: active ? '2px solid transparent' : '1px solid #E2E8F0',
                    background: active
                      ? g === 'Niño' ? '#2563EB' : g === 'Niña' ? '#DB2777' : '#059669'
                      : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: active ? '0 3px 8px rgba(0,0,0,0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div className="card">
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#334155' }}>
            Talla para bebé *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {PRESET_SIZES.map((s) => {
              const active = size === s && !customSize;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setCustomSize('');
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: active ? '1.5px solid #E05D82' : '1px solid #E2E8F0',
                    background: active ? '#FDF2F4' : '#F8FAFC',
                    color: active ? '#E05D82' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="O escribe otra talla personalizada..."
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
          />
        </div>

        {/* Prices: Purchase Price & Sale Price */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                Precio de Compra *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 11, fontWeight: 700, color: '#94A3B8' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  style={{ paddingLeft: 28 }}
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                Precio de Venta *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 11, fontWeight: 700, color: '#94A3B8' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  style={{ paddingLeft: 28 }}
                  placeholder="0.00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Profit preview */}
          {sPriceNum > 0 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: 10, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: '#166534', fontWeight: 600 }}>Ganancia estimada por prenda:</span>
              <span style={{ color: '#15803D', fontWeight: 800 }}>
                ${unitProfit.toFixed(2)} ({profitMargin}%)
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '14px', fontSize: '1rem', marginTop: 6 }}
          disabled={loading}
        >
          {loading ? 'Guardando en Turso...' : 'Registrar Prenda en Inventario'}
        </button>
      </form>
    </div>
  );
};
