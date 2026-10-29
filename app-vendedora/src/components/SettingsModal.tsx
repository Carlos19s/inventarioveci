import React, { useState } from 'react';
import { Settings, X, Globe, Save, Check } from 'lucide-react';
import { getApiUrl, setApiUrl } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [url, setUrl] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(url);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#F1F5F9', padding: 8, borderRadius: 12 }}>
              <Settings size={20} color="#334155" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Configuración de Servidor</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>URL de la API en MonsterASP / Local</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
              URL de la API (Backend)
            </label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: 38 }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5000 o https://tu-sitio.monsterasp.net"
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 6 }}>
              Ingresa la URL pública de MonsterASP donde se despliega la API o localhost para desarrollo.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              <span>{saved ? 'Guardado' : 'Guardar Servidor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
