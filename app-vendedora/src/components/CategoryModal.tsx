import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { createCategory } from '../services/api';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onCategoryCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa un nombre para la categoría');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cat = await createCategory(name.trim(), description.trim());
      onCategoryCreated(cat);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar en Turso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#FCE7F3', padding: 8, borderRadius: 12 }}>
              <Sparkles size={20} color="#DB2777" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Nueva Categoría</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Para organizar la ropa de bebé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#B91C1C', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
              Nombre de la categoría *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: Mamelucos, Conjuntos de Hilo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: Ropa de temporada invierno"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? 'Guardando en Turso...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
