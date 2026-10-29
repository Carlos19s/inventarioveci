import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { createSale } from '../services/api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface QuickSaleViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onSaleSuccess: () => void;
  onGoToInventory: () => void;
}

export const QuickSaleView: React.FC<QuickSaleViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSaleSuccess,
  onGoToInventory
}) => {
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaleResult, setLastSaleResult] = useState<any>(null);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.product.purchasePrice * item.quantity, 0);
  const totalProfit = totalAmount - totalCost;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        paymentMethod,
        notes: notes.trim() || undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const result = await createSale(payload);
      setLastSaleResult(result);
      onClearCart();
      onSaleSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  if (lastSaleResult) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={40} color="#16A34A" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D' }}>¡Venta Completada!</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 4 }}>
            Stock actualizado automáticamente en Turso.
          </p>
        </div>

        <div className="card" style={{ width: '100%', padding: 16, background: '#F8FAFC', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
            <span style={{ color: '#64748B' }}>Total Cobrado:</span>
            <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>${lastSaleResult.totalAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
            <span>Prendas vendidas:</span>
            <span style={{ fontWeight: 700 }}>{lastSaleResult.itemsCount}</span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', padding: 14 }}
          onClick={() => {
            setLastSaleResult(null);
            onGoToInventory();
          }}
        >
          Volver al Inventario
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={32} color="#DB2777" />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>Bolsa de Venta Vacía</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: 280 }}>
          Ve al Inventario y toca el botón "+" en las prendas para agregarlas a la venta del cliente.
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 8, padding: '12px 24px' }}
          onClick={onGoToInventory}
        >
          Ver Inventario
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
          Bolsa de Cobro ({cart.length} prendas)
        </h3>
        <button
          onClick={onClearCart}
          style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
        >
          Vaciar bolsa
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 12, borderRadius: 14, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cart.map((item) => (
          <div key={item.product.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10 }}>
            {/* Image */}
            <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  👶
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.product.name}
              </h5>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                <span className="badge-size">{item.product.size}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>${item.product.salePrice.toFixed(2)} c/u</span>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.product.id, -1)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button
                type="button"
                disabled={item.quantity >= item.product.stock}
                onClick={() => onUpdateQuantity(item.product.id, 1)}
                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: item.quantity >= item.product.stock ? 0.4 : 1 }}
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => onRemoveItem(item.product.id)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', padding: 4, cursor: 'pointer', marginLeft: 4 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
          Forma de Pago
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Efectivo', 'Transferencia / QR', 'Tarjeta'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 10,
                border: paymentMethod === m ? '2px solid #E05D82' : '1px solid #E2E8F0',
                background: paymentMethod === m ? '#FDF2F4' : 'white',
                color: paymentMethod === m ? '#E05D82' : '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Checkout Summary Card */}
      <div className="card" style={{ background: '#FFF1F2', borderColor: '#FECDD3', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9F1239' }}>
          <span>Subtotal:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #FECDD3', paddingTop: 8 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#881337' }}>TOTAL A COBRAR:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#881337' }}>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Confirm Checkout Button */}
      <button
        type="button"
        className="btn-primary"
        style={{ padding: 16, fontSize: '1.05rem' }}
        disabled={loading}
        onClick={handleCheckout}
      >
        {loading ? 'Registrando en Turso...' : `Confirmar Venta ($${totalAmount.toFixed(2)})`}
      </button>
    </div>
  );
};
