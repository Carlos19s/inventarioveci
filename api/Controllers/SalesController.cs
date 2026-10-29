using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using VeciBar.Api.Models;
using VeciBar.Api.Services;

namespace VeciBar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly TursoDatabaseService _db;

    public SalesController(TursoDatabaseService db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult> CreateSale([FromBody] CreateSaleDto dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
        {
            return BadRequest(new { message = "La venta debe contener al menos una prenda." });
        }

        // Fetch products to verify stock and prices
        decimal totalAmount = 0;
        decimal totalCost = 0;

        var productInfoList = new List<(int ProductId, string Name, decimal PurchasePrice, decimal SalePrice, int Qty, int CurrentStock)>();

        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
            {
                return BadRequest(new { message = $"Cantidad inválida para el producto ID {item.ProductId}." });
            }

            var rows = await _db.QueryAsync(
                "SELECT id, name, purchase_price, sale_price, stock FROM products WHERE id = ?",
                ("integer", item.ProductId));

            if (rows.Count == 0)
            {
                return NotFound(new { message = $"Prenda con ID {item.ProductId} no encontrada." });
            }

            var r = rows[0];
            var currentStock = Convert.ToInt32(r["stock"]);
            var name = r["name"]?.ToString() ?? "";
            var purchasePrice = decimal.TryParse(r["purchase_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var pp) ? pp : 0;
            var salePrice = decimal.TryParse(r["sale_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var sp) ? sp : 0;

            if (currentStock < item.Quantity)
            {
                return BadRequest(new { message = $"Stock insuficiente para '{name}'. Disponible: {currentStock}, Solicitado: {item.Quantity}." });
            }

            productInfoList.Add((item.ProductId, name, purchasePrice, salePrice, item.Quantity, currentStock));

            totalAmount += salePrice * item.Quantity;
            totalCost += purchasePrice * item.Quantity;
        }

        var totalProfit = totalAmount - totalCost;

        // Insert sale record
        var saleId = await _db.ExecuteAndGetLastInsertIdAsync(
            @"INSERT INTO sales (total_amount, total_cost, total_profit, payment_method, notes, sale_date)
              VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            ("float", totalAmount.ToString(CultureInfo.InvariantCulture)),
            ("float", totalCost.ToString(CultureInfo.InvariantCulture)),
            ("float", totalProfit.ToString(CultureInfo.InvariantCulture)),
            ("text", dto.PaymentMethod),
            ("text", dto.Notes ?? ""));

        if (!saleId.HasValue)
        {
            return StatusCode(500, new { message = "Error al registrar la venta en la base de datos." });
        }

        // Insert sale_items, update stock, insert stock_movements
        foreach (var p in productInfoList)
        {
            var itemSubtotal = p.SalePrice * p.Qty;
            var itemProfit = (p.SalePrice - p.PurchasePrice) * p.Qty;

            await _db.ExecuteAsync(
                @"INSERT INTO sale_items (sale_id, product_id, quantity, unit_purchase_price, unit_sale_price, subtotal, profit)
                  VALUES (?, ?, ?, ?, ?, ?, ?)",
                ("integer", (int)saleId.Value),
                ("integer", p.ProductId),
                ("integer", p.Qty),
                ("float", p.PurchasePrice.ToString(CultureInfo.InvariantCulture)),
                ("float", p.SalePrice.ToString(CultureInfo.InvariantCulture)),
                ("float", itemSubtotal.ToString(CultureInfo.InvariantCulture)),
                ("float", itemProfit.ToString(CultureInfo.InvariantCulture)));

            // Update product stock
            var newStock = p.CurrentStock - p.Qty;
            await _db.ExecuteAsync(
                "UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                ("integer", newStock),
                ("integer", p.ProductId));

            // Record stock movement OUT_SALE
            await _db.ExecuteAsync(
                @"INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
                  VALUES (?, 'OUT_SALE', ?, ?, 'Venta realizada')",
                ("integer", p.ProductId),
                ("integer", p.Qty),
                ("integer", (int)saleId.Value));
        }

        return Ok(new
        {
            message = "Venta registrada con éxito.",
            saleId = saleId.Value,
            totalAmount,
            totalCost,
            totalProfit,
            itemsCount = productInfoList.Count
        });
    }

    [HttpGet]
    public async Task<ActionResult<List<Sale>>> GetSales([FromQuery] int limit = 50)
    {
        var salesRows = await _db.QueryAsync(
            $"SELECT id, sale_date, total_amount, total_cost, total_profit, payment_method, notes FROM sales ORDER BY id DESC LIMIT {limit}");

        var list = new List<Sale>();
        foreach (var sr in salesRows)
        {
            var id = Convert.ToInt32(sr["id"]);
            var sale = new Sale
            {
                Id = id,
                SaleDate = DateTime.TryParse(sr["sale_date"]?.ToString(), out var dt) ? dt : DateTime.UtcNow,
                TotalAmount = decimal.TryParse(sr["total_amount"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var ta) ? ta : 0,
                TotalCost = decimal.TryParse(sr["total_cost"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var tc) ? tc : 0,
                TotalProfit = decimal.TryParse(sr["total_profit"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var tp) ? tp : 0,
                PaymentMethod = sr["payment_method"]?.ToString() ?? "Efectivo",
                Notes = sr["notes"]?.ToString()
            };

            var itemsRows = await _db.QueryAsync(
                @"SELECT si.id, si.sale_id, si.product_id, p.name AS product_name, p.size, p.gender, c.name AS category_name,
                         si.quantity, si.unit_purchase_price, si.unit_sale_price, si.subtotal, si.profit
                  FROM sale_items si
                  LEFT JOIN products p ON si.product_id = p.id
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE si.sale_id = ?",
                ("integer", id));

            foreach (var ir in itemsRows)
            {
                sale.Items.Add(new SaleItem
                {
                    Id = Convert.ToInt32(ir["id"]),
                    SaleId = id,
                    ProductId = Convert.ToInt32(ir["product_id"]),
                    ProductName = ir["product_name"]?.ToString() ?? "Prenda",
                    ProductSize = ir["size"]?.ToString(),
                    ProductGender = ir["gender"]?.ToString(),
                    CategoryName = ir["category_name"]?.ToString(),
                    Quantity = Convert.ToInt32(ir["quantity"]),
                    UnitPurchasePrice = decimal.TryParse(ir["unit_purchase_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var upp) ? upp : 0,
                    UnitSalePrice = decimal.TryParse(ir["unit_sale_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var usp) ? usp : 0,
                    Subtotal = decimal.TryParse(ir["subtotal"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var sub) ? sub : 0,
                    Profit = decimal.TryParse(ir["profit"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var prf) ? prf : 0
                });
            }

            list.Add(sale);
        }

        return Ok(list);
    }
}
