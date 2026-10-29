import React from 'react';
import type { Product } from '../types';
import { Plus, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEdit }) => {
  const getGenderClass = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'niño': return 'nino';
      case 'niña': return 'nina';
      default: return 'unisex';
    }
  };

  const getStockClass = (stock: number) => {
    if (stock <= 0) return 'stock-low';
    if (stock <= 3) return 'stock-med';
    return 'stock-high';
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        position: 'relative',
        cursor: onEdit ? 'pointer' : 'default'
      }}
      onClick={() => onEdit?.(product)}
    >
      {/* Product Image */}
      <div
        style={{
          width: '100%',
          height: 130,
          borderRadius: 12,
          overflow: 'hidden',
          background: '#F1F5F9',
          position: 'relative',
          marginBottom: 10
        }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl.replace(/http:\/\/localhost(:\d+)?/, 'http://inventarioveci.runasp.net')}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLElement).style.display = 'none';
              const fallback = (e.target as HTMLElement).parentElement?.querySelector('.img-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="img-fallback"
          style={{
            width: '100%',
            height: '100%',
            display: product.imageUrl ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8'
          }}
        >
          <Tag size={32} />
        </div>

        {/* Gender Badge (No Emojis) */}
        <div style={{ position: 'absolute', top: 6, left: 6 }}>
          <span className={`badge-gender ${getGenderClass(product.gender)}`}>
            {product.gender}
          </span>
        </div>

        {/* Size Badge */}
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <span className="badge-size">{product.size}</span>
        </div>
      </div>

      {/* Product Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '0.72rem', color: '#E05D82', fontWeight: 700, textTransform: 'uppercase' }}>
          {product.categoryName || 'Prenda'}
        </p>
        <h4
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#1E293B',
            lineHeight: 1.25,
            margin: '2px 0 6px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {product.name}
        </h4>

        {/* Stock & Prices */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span className={`stock-badge ${getStockClass(product.stock)}`}>
            {product.stock <= 0 ? 'Sin Stock' : `${product.stock} disp.`}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Costo: ${product.purchasePrice.toFixed(2)}
          </span>
        </div>

        {/* Sale Price & Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Venta</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
              ${product.salePrice.toFixed(2)}
            </span>
          </div>

          {onAddToCart && product.stock > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              style={{
                background: '#E05D82',
                color: 'white',
                border: 'none',
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(224, 93, 130, 0.4)'
              }}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
