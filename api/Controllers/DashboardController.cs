using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using VeciBar.Api.Models;
using VeciBar.Api.Services;

namespace VeciBar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly TursoDatabaseService _db;

    public DashboardController(TursoDatabaseService db)
    {
        _db = db;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetrics>> GetMetrics()
    {
        var metrics = new DashboardMetrics();

        // 1. Period Summaries: Today, Week, Month
        metrics.Today = await GetPeriodSummaryAsync("Diario (Hoy)", "date('now', 'localtime')");
        metrics.Week = await GetPeriodSummaryAsync("Semanal (Últimos 7 días)", "date('now', '-7 days', 'localtime')");
        metrics.Month = await GetPeriodSummaryAsync("Mensual (Últimos 30 días)", "date('now', '-30 days', 'localtime')");

        // 2. Stock Exits: Today, Week, Month
        metrics.ExitsToday = await GetStockExitsAsync("date('now', 'localtime')");
        metrics.ExitsWeek = await GetStockExitsAsync("date('now', '-7 days', 'localtime')");
        metrics.ExitsMonth = await GetStockExitsAsync("date('now', '-30 days', 'localtime')");

        // 3. Inventory Overview
        var invRows = await _db.QueryAsync(@"
            SELECT 
                COUNT(*) AS total_products,
                SUM(stock) AS total_units,
                SUM(purchase_price * stock) AS total_cost_invested,
                SUM(sale_price * stock) AS total_potential_sales,
                SUM((sale_price - purchase_price) * stock) AS total_potential_profit,
                SUM(CASE WHEN stock <= 3 THEN 1 ELSE 0 END) AS low_stock_count
            FROM products
        ");

        if (invRows.Count > 0)
        {
            var ir = invRows[0];
            metrics.Inventory.TotalProducts = Convert.ToInt32(ir["total_products"] ?? 0);
            metrics.Inventory.TotalStockUnits = Convert.ToInt32(ir["total_units"] ?? 0);
            metrics.Inventory.TotalInventoryCost = ParseDecimal(ir["total_cost_invested"]);
            metrics.Inventory.TotalInventorySaleValue = ParseDecimal(ir["total_potential_sales"]);
            metrics.Inventory.TotalPotentialProfit = ParseDecimal(ir["total_potential_profit"]);
            metrics.Inventory.LowStockCount = Convert.ToInt32(ir["low_stock_count"] ?? 0);
        }

        // 4. Top Selling Categories
        var catRows = await _db.QueryAsync(@"
            SELECT 
                COALESCE(c.name, 'Sin Categoría') AS category_name,
                SUM(si.quantity) AS qty_sold,
                SUM(si.subtotal) AS total_revenue,
                SUM(si.profit) AS total_profit
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            GROUP BY c.name
            ORDER BY total_revenue DESC
            LIMIT 5
        ");

        foreach (var cr in catRows)
        {
            metrics.TopCategories.Add(new CategorySalesSummary
            {
                CategoryName = cr["category_name"]?.ToString() ?? "",
                QuantitySold = Convert.ToInt32(cr["qty_sold"] ?? 0),
                TotalRevenue = ParseDecimal(cr["total_revenue"]),
                TotalProfit = ParseDecimal(cr["total_profit"])
            });
        }

        return Ok(metrics);
    }

    private async Task<PeriodSummary> GetPeriodSummaryAsync(string periodName, string dateConditionSql)
    {
        var summary = new PeriodSummary { PeriodName = periodName };

        var rows = await _db.QueryAsync($@"
            SELECT 
                COUNT(s.id) AS tx_count,
                COALESCE(SUM(s.total_amount), 0) AS total_sales,
                COALESCE(SUM(s.total_cost), 0) AS total_cost,
                COALESCE(SUM(s.total_profit), 0) AS total_profit,
                COALESCE((
                    SELECT SUM(si.quantity) 
                    FROM sale_items si 
                    JOIN sales s2 ON si.sale_id = s2.id 
                    WHERE date(s2.sale_date, 'localtime') >= {dateConditionSql}
                ), 0) AS items_sold
            FROM sales s
            WHERE date(s.sale_date, 'localtime') >= {dateConditionSql}
        ");

        if (rows.Count > 0)
        {
            var r = rows[0];
            summary.TransactionsCount = Convert.ToInt32(r["tx_count"] ?? 0);
            summary.TotalSales = ParseDecimal(r["total_sales"]);
            summary.TotalCost = ParseDecimal(r["total_cost"]);
            summary.NetProfit = ParseDecimal(r["total_profit"]);
            summary.ItemsSold = Convert.ToInt32(r["items_sold"] ?? 0);
        }

        return summary;
    }

    private async Task<List<StockExitItem>> GetStockExitsAsync(string dateConditionSql)
    {
        var list = new List<StockExitItem>();

        var rows = await _db.QueryAsync($@"
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.code,
                COALESCE(c.name, 'Sin Categoría') AS category_name,
                p.size,
                p.gender,
                p.image_url,
                p.purchase_price,
                p.sale_price,
                SUM(si.quantity) AS quantity_sold,
                SUM(si.subtotal) AS total_revenue,
                SUM(si.unit_purchase_price * si.quantity) AS total_cost,
                SUM(si.profit) AS total_profit,
                MAX(s.sale_date) AS last_exit_date
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN products p ON si.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE date(s.sale_date, 'localtime') >= {dateConditionSql}
            GROUP BY p.id
            ORDER BY quantity_sold DESC, total_revenue DESC
        ");

        foreach (var r in rows)
        {
            list.Add(new StockExitItem
            {
                ProductId = Convert.ToInt32(r["product_id"]),
                ProductName = r["product_name"]?.ToString() ?? "",
                Code = r["code"]?.ToString(),
                CategoryName = r["category_name"]?.ToString() ?? "",
                Size = r["size"]?.ToString() ?? "",
                Gender = r["gender"]?.ToString() ?? "",
                ImageUrl = r["image_url"]?.ToString(),
                UnitPurchasePrice = ParseDecimal(r["purchase_price"]),
                UnitSalePrice = ParseDecimal(r["sale_price"]),
                QuantitySold = Convert.ToInt32(r["quantity_sold"] ?? 0),
                TotalRevenue = ParseDecimal(r["total_revenue"]),
                TotalCost = ParseDecimal(r["total_cost"]),
                TotalProfit = ParseDecimal(r["total_profit"]),
                LastExitDate = DateTime.TryParse(r["last_exit_date"]?.ToString(), out var ld) ? ld : DateTime.UtcNow
            });
        }

        return list;
    }

    private static decimal ParseDecimal(object? val)
    {
        if (val == null) return 0;
        return decimal.TryParse(val.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : 0;
    }
}
