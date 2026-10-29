namespace VeciBar.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Gender { get; set; } = "Unisex"; // Niño, Niña, Unisex
    public string Size { get; set; } = string.Empty; // 0-3M, 3-6M, etc.
    public decimal PurchasePrice { get; set; } // Precio de compra
    public decimal SalePrice { get; set; }     // Precio de venta
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Computed properties for profit calculation
    public decimal UnitProfit => SalePrice - PurchasePrice;
    public decimal TotalCostValue => PurchasePrice * Stock;
    public decimal TotalSaleValue => SalePrice * Stock;
    public decimal TotalPotentialProfit => UnitProfit * Stock;
}

public class CreateProductDto
{
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Gender { get; set; } = "Unisex";
    public string Size { get; set; } = string.Empty;
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
}

public class UpdateProductDto
{
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string Gender { get; set; } = "Unisex";
    public string Size { get; set; } = string.Empty;
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public string? Notes { get; set; }
}
