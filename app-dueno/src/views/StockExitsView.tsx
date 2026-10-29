import React, { useState } from 'react';
import { TrendingDown, Tag, RefreshCw, Calendar } from 'lucide-react';
import type { DashboardMetrics, StockExitItem } from '../types';

interface StockExitsViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onRefresh: () => void;
}

export type ExitPeriod = 'today' | 'week' | 'month';

export const StockExitsView: React.FC<StockExitsViewProps> = ({
  metrics,
  loading,
  onRefresh
}) => {
  const [period, setPeriod] = useState<ExitPeriod>('today');

  const exits: StockExitItem[] = metrics
    ? period === 'today'
      ? metrics.exitsToday
      : period === 'week'
      ? metrics.exitsWeek
      : metrics.exitsMonth
    : [];

  const totalExitedUnits = exits.reduce((sum, e) => sum + e.quantitySold, 0);
  const totalExitedProfit = exits.reduce((sum, e) => sum + e.totalProfit, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Period Selector Tabs */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'today' ? 'active' : ''}`}
          onClick={() => setPeriod('today')}
        >
          <Calendar size={14} />
          <span>Hoy (Diario)</span>
        </button>
        <button
          className={`period-btn ${period === 'week' ? 'active' : ''}`}
          onClick={() => setPeriod('week')}
        >
          <span>Semana</span>
        </button>
        <button
          className={`period-btn ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          <span>Mes</span>
        </button>
      </div>

      {/* Summary of Exits */}
      <div style={{ background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)', border: '1px solid #DBEAFE', padding: 14, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
            Salidas de Stock ({period === 'today' ? 'Hoy' : period === 'week' ? 'Semanal' : 'Mensual'})
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
              {totalExitedUnits} prendas
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 800 }}>
              +${totalExitedProfit.toFixed(2)} ganancia
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#334155' }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Exits List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
          <RefreshCw size={24} className="spin" color="#0F172A" style={{ margin: '0 auto 8px auto' }} />
          <p style={{ fontSize: '0.82rem' }}>Consultando salidas de stock...</p>
        </div>
      ) : exits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', background: 'white', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <TrendingDown size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
          <h4 style={{ fontWeight: 700, color: '#1E293B' }}>Sin salidas de stock en este período</h4>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4 }}>
            Cuando se registren ventas en la app de la vendedora, verás aquí el desglose de prendas y sus ganancias.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exits.map((item) => {
            const unitProfit = item.unitSalePrice - item.unitPurchasePrice;
            return (
              <div key={item.productId} className="stock-exit-card">
                {/* Product Image */}
                <div style={{ width: 62, height: 62, borderRadius: 12, background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <Tag size={20} />
                    </div>
                  )}
                </div>

                {/* Details (No Emojis) */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.7rem', color: '#E05D82', fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.categoryName}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#F1F5F9', padding: '1px 6px', borderRadius: 6, fontWeight: 700, color: '#475569' }}>
                      {item.size}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      {item.gender}
                    </span>
                  </div>

                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0' }}>
                    {item.productName}
                  </h5>

                  {/* Pricing Comparison */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '0.75rem', marginTop: 4 }}>
                    <span style={{ color: '#64748B' }}>
                      Compra: <strong>${item.unitPurchasePrice.toFixed(2)}</strong>
                    </span>
                    <span style={{ color: '#334155' }}>
                      Venta: <strong>${item.unitSalePrice.toFixed(2)}</strong>
                    </span>
                    <span style={{ color: '#10B981', fontWeight: 800 }}>
                      Ganancia: +${unitProfit.toFixed(2)} c/u
                    </span>
                  </div>
                </div>

                {/* Exit Quantities & Total Profit */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '4px 8px', borderRadius: 8, display: 'inline-block' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803D' }}>
                      +{item.quantitySold} salieron
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 800, marginTop: 4 }}>
                    Total: ${item.totalRevenue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                    +${item.totalProfit.toFixed(2)} ganancia
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
