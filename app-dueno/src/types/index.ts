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
  unitProfit: number;
  totalCostValue: number;
  totalSaleValue: number;
  totalPotentialProfit: number;
}

export interface PeriodSummary {
  periodName: string;
  totalSales: number;
  totalCost: number;
  netProfit: number;
  profitMarginPercent: number;
  itemsSold: number;
  transactionsCount: number;
}

export interface InventorySummary {
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryCost: number;
  totalInventorySaleValue: number;
  totalPotentialProfit: number;
  lowStockCount: number;
}

export interface StockExitItem {
  productId: number;
  productName: string;
  code?: string;
  categoryName: string;
  size: string;
  gender: string;
  quantitySold: number;
  unitPurchasePrice: number;
  unitSalePrice: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  imageUrl?: string;
  lastExitDate: string;
}

export interface CategorySalesSummary {
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface DashboardMetrics {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  inventory: InventorySummary;
  exitsToday: StockExitItem[];
  exitsWeek: StockExitItem[];
  exitsMonth: StockExitItem[];
  topCategories: CategorySalesSummary[];
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
