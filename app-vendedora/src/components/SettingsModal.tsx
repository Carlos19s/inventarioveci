import React, { useState } from 'react';
import { Settings, X, Globe, Save, Check, Cloud, Laptop } from 'lucide-react';
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
    }, 500);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setApiUrl(presetUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
      onClose();
    }, 500);
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
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Conexión con la base de datos de ropa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, color: '#475569' }}>
            Servidores rápidos (Toca uno para conectar):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleSelectPreset('http://inventarioveci.runasp.net')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 10,
                border: url === 'http://inventarioveci.runasp.net' ? '2px solid #E05D82' : '1px solid #CBD5E1',
                background: url === 'http://inventarioveci.runasp.net' ? '#FDF2F4' : '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cloud size={18} color="#E05D82" />
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>MonsterASP (Nube)</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>http://inventarioveci.runasp.net</span>
                </div>
              </div>
              {url === 'http://inventarioveci.runasp.net' && <Check size={16} color="#E05D82" />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('http://10.244.46.107:5000')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 10,
                border: url === 'http://10.244.46.107:5000' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                background: url === 'http://10.244.46.107:5000' ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Laptop size={18} color="#2563EB" />
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>PC Local (Mismo Wi-Fi)</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>http://10.244.46.107:5000</span>
                </div>
              </div>
              {url === 'http://10.244.46.107:5000' && <Check size={16} color="#2563EB" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
              O escribe una URL personalizada:
            </label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: 38 }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://inventarioveci.runasp.net"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              <span>{saved ? 'Guardado' : 'Guardar y Conectar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
