import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { Sale } from '../types';
import { getSales } from '../services/api';

export const SalesHistoryView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSales();
      setSales(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary Banner */}
      <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', padding: 14, borderRadius: 16, border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Total en Ventas Registradas</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E3A8A', marginTop: 2 }}>
            ${totalSalesAmount.toFixed(2)}
          </h3>
        </div>
        <button
          onClick={loadHistory}
          style={{ background: 'white', border: '1px solid #BFDBFE', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#1E40AF' }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 12, borderRadius: 14, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
          <RefreshCw size={24} className="spin" color="#E05D82" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.82rem' }}>Cargando ventas desde Turso...</p>
        </div>
      ) : sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <Clock size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
          <h4 style={{ fontWeight: 700, color: '#1E293B' }}>Aún no hay ventas registradas</h4>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4 }}>
            Las ventas que registres hoy aparecerán aquí en orden cronológico.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sales.map((sale) => (
            <div key={sale.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                    Venta #{sale.id}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                    {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                    ${sale.totalAmount.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>
                    {sale.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sale.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#334155' }}>
                    <span>
                      {item.quantity}x {item.productName} ({item.productSize || 'U'})
                    </span>
                    <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
