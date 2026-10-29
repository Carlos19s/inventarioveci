import React from 'react';
import { Package, PlusCircle, ShoppingBag, Clock } from 'lucide-react';

export type TabType = 'inventory' | 'register' | 'sale' | 'history';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, cartCount }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => setActiveTab('inventory')}
      >
        <Package size={22} className="nav-icon" />
        <span>Inventario</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => setActiveTab('register')}
      >
        <PlusCircle size={22} className="nav-icon" />
        <span>Registrar</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'sale' ? 'active' : ''}`}
        onClick={() => setActiveTab('sale')}
      >
        <ShoppingBag size={22} className="nav-icon" />
        <span>Vender</span>
        {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
      </button>

      <button
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <Clock size={22} className="nav-icon" />
        <span>Historial</span>
      </button>
    </nav>
  );
};
