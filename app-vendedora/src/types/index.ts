export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export type GenderType = 'Niño' | 'Niña' | 'Unisex';

export interface Product {
  id: number;
  code?: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  gender: GenderType;
  size: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  unitProfit?: number;
  totalCostValue?: number;
  totalSaleValue?: number;
  totalPotentialProfit?: number;
}

export interface CreateProductInput {
  code?: string;
  name: string;
  categoryId: number;
  gender: GenderType;
  size: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  imageUrl?: string;
  notes?: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName?: string;
  productSize?: string;
  productGender?: string;
  categoryName?: string;
  quantity: number;
  unitPurchasePrice: number;
  unitSalePrice: number;
  subtotal: number;
  profit: number;
}

export interface Sale {
  id: number;
  saleDate: string;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod: string;
  notes?: string;
  items: SaleItem[];
}

export interface CreateSaleInput {
  paymentMethod?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}
