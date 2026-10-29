import { useState, useEffect } from 'react';
import { ShieldCheck, Settings } from 'lucide-react';
import { DashboardMetrics } from './types';
import { getDashboardMetrics } from './services/api';
import { BottomNav, DuenoTab } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';
import { DashboardView } from './views/DashboardView';
import { StockExitsView } from './views/StockExitsView';
import { ReadOnlyInventoryView } from './views/ReadOnlyInventoryView';
import { SalesAuditView } from './views/SalesAuditView';

export function App() {
  const [activeTab, setActiveTab] = useState<DuenoTab>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la API de VeciBar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="brand-title">
          <ShieldCheck size={24} color="#10B981" />
          <span>VeciBar</span>
          <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#064E3B', padding: '2px 8px', borderRadius: 12, fontWeight: 800 }}>
            DUEÑO
          </span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: 8, borderRadius: 10, cursor: 'pointer', color: 'white' }}
          title="Configurar servidor API"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="content-area">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            loading={loading}
            error={error}
            onRefresh={loadMetrics}
          />
        )}

        {activeTab === 'exits' && (
          <StockExitsView
            metrics={metrics}
            loading={loading}
            onRefresh={loadMetrics}
          />
        )}

        {activeTab === 'inventory' && <ReadOnlyInventoryView />}

        {activeTab === 'sales' && <SalesAuditView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={loadMetrics}
      />
    </>
  );
}

export default App;
