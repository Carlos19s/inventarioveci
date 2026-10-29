import React, { useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, RefreshCw, AlertCircle, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { DashboardMetrics, PeriodSummary } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export type PeriodType = 'today' | 'week' | 'month';

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  loading,
  error,
  onRefresh
}) => {
  const [period, setPeriod] = useState<PeriodType>('today');

  if (loading && !metrics) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <RefreshCw size={32} className="spin" color="#0F172A" style={{ margin: '0 auto 12px auto' }} />
        <h4 style={{ fontWeight: 700, color: '#1E293B' }}>Cargando inteligencia del negocio...</h4>
        <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Conectando a Turso DB</p>
      </div>
    );
  }

  const currentSummary: PeriodSummary = metrics
    ? period === 'today'
      ? metrics.today
      : period === 'week'
      ? metrics.week
      : metrics.month
    : {
        periodName: '',
        totalSales: 0,
        totalCost: 0,
        netProfit: 0,
        profitMarginPercent: 0,
        itemsSold: 0,
        transactionsCount: 0
      };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Period Selector Tabs */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === 'today' ? 'active' : ''}`}
          onClick={() => setPeriod('today')}
        >
          <span>📅 Hoy (Diario)</span>
        </button>
        <button
          className={`period-btn ${period === 'week' ? 'active' : ''}`}
          onClick={() => setPeriod('week')}
        >
          <span>🗓️ Semana</span>
        </button>
        <button
          className={`period-btn ${period === 'month' ? 'active' : ''}`}
          onClick={() => setPeriod('month')}
        >
          <span>📊 Mes</span>
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: 12, borderRadius: 14, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main KPI: Net Profit (Ganancia Neta) */}
      <div className="kpi-profit-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ganancia Neta ({period === 'today' ? 'Hoy' : period === 'week' ? 'Esta Semana' : 'Este Mes'})
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 4, letterSpacing: '-0.5px' }}>
              ${currentSummary.netProfit.toFixed(2)}
            </h2>
          </div>
          <button
            onClick={onRefresh}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: 8, borderRadius: 10, cursor: 'pointer' }}
            title="Refrescar datos"
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
            <TrendingUp size={14} />
            <span>Margen: {currentSummary.profitMarginPercent.toFixed(1)}%</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#D1FAE5' }}>
            {currentSummary.itemsSold} prendas vendidas
          </span>
        </div>
      </div>

      {/* Mini KPIs: Ventas Brutas vs Costo de Compra */}
      <div className="kpi-grid">
        {/* Total Sales */}
        <div className="kpi-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3B82F6', marginBottom: 4 }}>
            <DollarSign size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Total Vendido</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
            ${currentSummary.totalSales.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
            {currentSummary.transactionsCount} ventas registradas
          </span>
        </div>

        {/* Cost of Goods */}
        <div className="kpi-mini-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', marginBottom: 4 }}>
            <ShoppingBag size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Costo de Compra</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#334155' }}>
            ${currentSummary.totalCost.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
            Pagado al proveedor
          </span>
        </div>
      </div>

      {/* Total Inventory Valuation (Valor de la Tienda) */}
      {metrics?.inventory && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Layers size={20} color="#F59E0B" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Valorización de Bodega</h4>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Capital actual en prendas de bebé</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: 10, borderRadius: 12 }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Dinero Invertido</span>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#F1F5F9' }}>
                ${metrics.inventory.totalInventoryCost.toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Venta Potencial</span>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#60A5FA' }}>
                ${metrics.inventory.totalInventorySaleValue.toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'block' }}>Ganancia Est.</span>
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#34D399' }}>
                ${metrics.inventory.totalPotentialProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.75rem', color: '#CBD5E1' }}>
            <span>Stock total: <strong>{metrics.inventory.totalStockUnits} prendas</strong> ({metrics.inventory.totalProducts} modelos)</span>
            {metrics.inventory.lowStockCount > 0 && (
              <span style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                <AlertTriangle size={13} />
                {metrics.inventory.lowStockCount} por agotarse
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Categories */}
      {metrics?.topCategories && metrics.topCategories.length > 0 && (
        <div className="card">
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="#E05D82" />
            <span>Categorías Más Vendidas</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {metrics.topCategories.map((c, i) => (
              <div key={c.categoryName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>
                    {i + 1}
                  </span>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1E293B', display: 'block' }}>{c.categoryName}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{c.quantitySold} unidades vendidas</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: '#0F172A', display: 'block' }}>${c.totalRevenue.toFixed(2)}</span>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>+${c.totalProfit.toFixed(2)} ganancia</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
