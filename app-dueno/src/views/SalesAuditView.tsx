import React, { useState, useEffect } from 'react';
import { ReceiptText, RefreshCw, AlertCircle } from 'lucide-react';
import { Sale } from '../types';
import { getSales } from '../services/api';

export const SalesAuditView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
            Auditoría de Ventas
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Historial de tickets emitidos por la vendedora
          </p>
        </div>
        <button
          onClick={loadData}
          style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#334155' }}
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
          <RefreshCw size={24} className="spin" color="#0F172A" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.82rem' }}>Cargando auditoría...</p>
        </div>
      ) : sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <ReceiptText size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
          <h4 style={{ fontWeight: 700, color: '#1E293B' }}>Sin registros de venta todavía</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sales.map((sale) => (
            <div key={sale.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    Ticket #{sale.id}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                    {new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.paymentMethod}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                    ${sale.totalAmount.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>
                    +${sale.totalProfit.toFixed(2)} ganancia
                  </span>
                </div>
              </div>

              {/* Items breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sale.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#334155', background: '#F8FAFC', padding: '6px 8px', borderRadius: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.quantity}x {item.productName} ({item.productSize || 'U'})</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>
                        Compra: ${item.unitPurchasePrice.toFixed(2)} ➔ Venta: ${item.unitSalePrice.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700 }}>${item.subtotal.toFixed(2)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', display: 'block', fontWeight: 700 }}>
                        +${item.profit.toFixed(2)}
                      </span>
                    </div>
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
