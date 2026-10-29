import React from 'react';
import { LayoutDashboard, TrendingDown, ShieldCheck, ReceiptText } from 'lucide-react';

export type DuenoTab = 'dashboard' | 'exits' | 'inventory' | 'sales';

interface BottomNavProps {
  activeTab: DuenoTab;
  setActiveTab: (tab: DuenoTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={21} className="nav-icon" />
        <span>Ganancias</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'exits' ? 'active' : ''}`}
        onClick={() => setActiveTab('exits')}
      >
        <TrendingDown size={21} className="nav-icon" />
        <span>Salidas Stock</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => setActiveTab('inventory')}
      >
        <ShieldCheck size={21} className="nav-icon" />
        <span>Inventario</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
        onClick={() => setActiveTab('sales')}
      >
        <ReceiptText size={21} className="nav-icon" />
        <span>Auditoría</span>
      </button>
    </nav>
  );
};
