import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { compressImage, uploadPhoto } from '../services/api';

interface PhotoCaptureProps {
  imageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ imageUrl, onImageUploaded, onImageRemoved }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setCompressionStatus('Optimizando foto para carga ultra-rápida...');

      // 1. Compress image on device (WebP / max 1200px)
      const compressed = await compressImage(file, 1200, 0.82);
      const originalKb = Math.round(file.size / 1024);
      const compressedKb = Math.round(compressed.size / 1024);
      setCompressionStatus(`Comprimida: ${originalKb}KB ➔ ${compressedKb}KB (Subiendo a Cloudflare)...`);

      // 2. Upload to Cloudflare R2
      const url = await uploadPhoto(compressed);
      onImageUploaded(url);
      setCompressionStatus(null);
    } catch (err: any) {
      alert('Error al subir la imagen: ' + (err.message || 'Error desconocido'));
      setCompressionStatus(null);
    } finally {
      setUploading(false);
      // Reset inputs so the same file can be selected again
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Hidden file inputs: one for native camera, one for gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {imageUrl ? (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid #E2E8F0', height: 210, background: '#F1F5F9' }}>
          <img
            src={imageUrl}
            alt="Prenda"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} color="#4ADE80" />
            <span>Optimizada en Cloudflare</span>
          </div>
          <button
            type="button"
            onClick={onImageRemoved}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          style={{
            border: '2px dashed #CBD5E1',
            borderRadius: 16,
            padding: '24px 16px',
            textAlign: 'center',
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0' }}>
              <Loader2 size={32} className="spin" color="#E05D82" />
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E05D82' }}>{compressionStatus}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px 10px', fontSize: '0.88rem' }}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={19} />
                  <span>Tomar Foto</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px 10px', fontSize: '0.88rem' }}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <ImageIcon size={19} />
                  <span>Galería</span>
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                📸 Compresión automática WebP & carga a Cloudflare R2
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
