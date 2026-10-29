namespace VeciBar.Api.Models;

public class Sale
{
    public int Id { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCost { get; set; }
    public decimal TotalProfit { get; set; }
    public string PaymentMethod { get; set; } = "Efectivo";
    public string? Notes { get; set; }
    public List<SaleItem> Items { get; set; } = new();
}

public class SaleItem
{
    public int Id { get; set; }
    public int SaleId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductSize { get; set; }
    public string? ProductGender { get; set; }
    public string? CategoryName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPurchasePrice { get; set; }
    public decimal UnitSalePrice { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Profit { get; set; }
}

public class CreateSaleDto
{
    public string PaymentMethod { get; set; } = "Efectivo";
    public string? Notes { get; set; }
    public List<CreateSaleItemDto> Items { get; set; } = new();
}

public class CreateSaleItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? Size { get; set; }
    public string? Gender { get; set; }
    public string? CategoryName { get; set; }
    public string MovementType { get; set; } = "OUT_SALE"; // IN, OUT_SALE, ADJUSTMENT
    public int Quantity { get; set; }
    public int? ReferenceId { get; set; }
    public string? Reason { get; set; }
    public decimal UnitPurchasePrice { get; set; }
    public decimal UnitSalePrice { get; set; }
    public decimal TotalProfit { get; set; }
    public DateTime CreatedAt { get; set; }
}
