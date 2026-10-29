import { DashboardMetrics, Product, Category, Sale, GenderType } from '../types';

export const getApiUrl = (): string => {
  return localStorage.getItem('VECIBAR_API_URL') || import.meta.env.VITE_API_URL || 'http://inventarioveci.runasp.net';
};

export const setApiUrl = (url: string) => {
  localStorage.setItem('VECIBAR_API_URL', url.trim().replace(/\/$/, ''));
};

// Executive Dashboard Metrics
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/dashboard/metrics`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al conectar con la API' }));
    throw new Error(err.message || 'Error al obtener métricas');
  }
  return res.json();
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

// Read-only Inventory
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
  if (!res.ok) throw new Error('Error al cargar inventario');
  return res.json();
}

// Sales transactions
export async function getSales(): Promise<Sale[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/sales?limit=100`);
  if (!res.ok) throw new Error('Error al cargar transacciones');
  return res.json();
}
