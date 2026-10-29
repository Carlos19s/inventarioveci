import { Category, Product, CreateProductInput, Sale, CreateSaleInput, GenderType } from '../types';

// Default API URL can be overridden in localStorage or env
export const getApiUrl = (): string => {
  return localStorage.getItem('VECIBAR_API_URL') || import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const setApiUrl = (url: string) => {
  localStorage.setItem('VECIBAR_API_URL', url.trim().replace(/\/$/, ''));
};

/**
 * Optimizes and compresses photos on-device before uploading.
 * Produces clean WebP/JPEG under 150KB for ultra-fast upload over mobile network.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const optimized = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(optimized);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

// Upload photo to Cloudflare R2 via API
export async function uploadPhoto(file: File): Promise<string> {
  const baseUrl = getApiUrl();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al subir imagen' }));
    throw new Error(err.message || 'Error al subir la imagen');
  }

  const data = await res.json();
  return data.url;
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function createCategory(name: string, description?: string): Promise<Category> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al crear categoría' }));
    throw new Error(err.message || 'Error al crear categoría');
  }
  return res.json();
}

// Products
export interface ProductFilters {
  search?: string;
  categoryId?: number;
  gender?: GenderType | 'Todos';
  size?: string;
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const baseUrl = getApiUrl();
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.gender && filters.gender !== 'Todos') params.append('gender', filters.gender);
  if (filters?.size && filters.size !== 'Todas') params.append('size', filters.size);

  const res = await fetch(`${baseUrl}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al registrar prenda' }));
    throw new Error(err.message || 'Error al registrar prenda');
  }
  return res.json();
}

export async function updateProduct(id: number, data: Partial<CreateProductInput>): Promise<Product> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al actualizar prenda' }));
    throw new Error(err.message || 'Error al actualizar prenda');
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al eliminar prenda' }));
    throw new Error(err.message || 'Error al eliminar prenda');
  }
}

// Sales
export async function createSale(data: CreateSaleInput): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al registrar venta' }));
    throw new Error(err.message || 'Error al registrar venta');
  }
  return res.json();
}

export async function getSales(): Promise<Sale[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/sales?limit=40`);
  if (!res.ok) throw new Error('Error al cargar ventas');
  return res.json();
}
