namespace VeciBar.Api.Models;

public class DashboardMetrics
{
    public PeriodSummary Today { get; set; } = new();
    public PeriodSummary Week { get; set; } = new();
    public PeriodSummary Month { get; set; } = new();
    public InventorySummary Inventory { get; set; } = new();
    public List<StockExitItem> ExitsToday { get; set; } = new();
    public List<StockExitItem> ExitsWeek { get; set; } = new();
    public List<StockExitItem> ExitsMonth { get; set; } = new();
    public List<CategorySalesSummary> TopCategories { get; set; } = new();
}

public class PeriodSummary
{
    public string PeriodName { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }       // Total vendido
    public decimal TotalCost { get; set; }        // Costo de compra total
    public decimal NetProfit { get; set; }        // Ganancia neta (Ventas - Costo)
    public double ProfitMarginPercent => TotalSales > 0 ? (double)((NetProfit / TotalSales) * 100) : 0;
    public int ItemsSold { get; set; }            // Cantidad de prendas vendidas
    public int TransactionsCount { get; set; }     // Número de ventas
}

public class InventorySummary
{
    public int TotalProducts { get; set; }
    public int TotalStockUnits { get; set; }
    public decimal TotalInventoryCost { get; set; }      // Dinero invertido
    public decimal TotalInventorySaleValue { get; set; } // Valor proyectado
    public decimal TotalPotentialProfit { get; set; }    // Ganancia potencial al vender todo
    public int LowStockCount { get; set; }               // Menos de 3 unidades
}

public class StockExitItem
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal UnitPurchasePrice { get; set; }
    public decimal UnitSalePrice { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal TotalProfit { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime LastExitDate { get; set; }
}

public class CategorySalesSummary
{
    public string CategoryName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalProfit { get; set; }
}
