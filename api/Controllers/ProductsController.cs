using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using VeciBar.Api.Models;
using VeciBar.Api.Services;

namespace VeciBar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly TursoDatabaseService _db;

    public ProductsController(TursoDatabaseService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] string? gender,
        [FromQuery] string? size)
    {
        var sql = @"
            SELECT p.id, p.code, p.name, p.category_id, c.name AS category_name, 
                   p.gender, p.size, p.purchase_price, p.sale_price, p.stock, 
                   p.image_url, p.notes, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        ";

        var args = new List<(string type, object value)>();

        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (LOWER(p.name) LIKE ? OR LOWER(COALESCE(p.code, '')) LIKE ?)";
            var pattern = $"%{search.Trim().ToLower()}%";
            args.Add(("text", pattern));
            args.Add(("text", pattern));
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            sql += " AND p.category_id = ?";
            args.Add(("integer", categoryId.Value));
        }

        if (!string.IsNullOrWhiteSpace(gender) && gender.Trim().ToLower() != "todos")
        {
            sql += " AND LOWER(p.gender) = LOWER(?)";
            args.Add(("text", gender.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(size) && size.Trim().ToLower() != "todas")
        {
            sql += " AND LOWER(p.size) = LOWER(?)";
            args.Add(("text", size.Trim()));
        }

        sql += " ORDER BY p.id DESC";

        var rows = await _db.QueryAsync(sql, args.ToArray());
        var list = new List<Product>();

        foreach (var r in rows)
        {
            list.Add(MapProduct(r));
        }

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var sql = @"
            SELECT p.id, p.code, p.name, p.category_id, c.name AS category_name, 
                   p.gender, p.size, p.purchase_price, p.sale_price, p.stock, 
                   p.image_url, p.notes, p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ";

        var rows = await _db.QueryAsync(sql, ("integer", id));
        if (rows.Count == 0) return NotFound(new { message = "Producto no encontrado." });

        return Ok(MapProduct(rows[0]));
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromBody] CreateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "El nombre de la prenda es obligatorio." });
        }
        if (dto.CategoryId <= 0)
        {
            return BadRequest(new { message = "Debe seleccionar una categoría válida." });
        }
        if (dto.SalePrice < 0 || dto.PurchasePrice < 0)
        {
            return BadRequest(new { message = "Los precios deben ser mayores o iguales a cero." });
        }

        var code = string.IsNullOrWhiteSpace(dto.Code) 
            ? $"BEBE-{DateTime.UtcNow:MMdd}-{Random.Shared.Next(100, 999)}"
            : dto.Code.Trim();

        var sql = @"
            INSERT INTO products (code, name, category_id, gender, size, purchase_price, sale_price, stock, image_url, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ";

        var id = await _db.ExecuteAndGetLastInsertIdAsync(
            sql,
            ("text", code),
            ("text", dto.Name.Trim()),
            ("integer", dto.CategoryId),
            ("text", dto.Gender.Trim()),
            ("text", dto.Size.Trim()),
            ("float", dto.PurchasePrice.ToString(CultureInfo.InvariantCulture)),
            ("float", dto.SalePrice.ToString(CultureInfo.InvariantCulture)),
            ("integer", dto.Stock),
            ("text", dto.ImageUrl ?? ""),
            ("text", dto.Notes ?? ""));

        if (id.HasValue && dto.Stock > 0)
        {
            // Register initial stock movement
            await _db.ExecuteAsync(
                @"INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
                  VALUES (?, 'IN', ?, ?, 'Ingreso inicial de mercadería')",
                ("integer", (int)id.Value),
                ("integer", dto.Stock),
                ("integer", (int)id.Value));
        }

        return await GetById((int)(id ?? 0));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        var existing = await _db.QueryAsync("SELECT id, stock FROM products WHERE id = ?", ("integer", id));
        if (existing.Count == 0) return NotFound(new { message = "Producto no encontrado." });

        var oldStock = Convert.ToInt32(existing[0]["stock"]);

        var sql = @"
            UPDATE products 
            SET code = ?, name = ?, category_id = ?, gender = ?, size = ?, 
                purchase_price = ?, sale_price = ?, stock = ?, image_url = ?, 
                notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ";

        await _db.ExecuteAsync(
            sql,
            ("text", dto.Code ?? ""),
            ("text", dto.Name.Trim()),
            ("integer", dto.CategoryId),
            ("text", dto.Gender.Trim()),
            ("text", dto.Size.Trim()),
            ("float", dto.PurchasePrice.ToString(CultureInfo.InvariantCulture)),
            ("float", dto.SalePrice.ToString(CultureInfo.InvariantCulture)),
            ("integer", dto.Stock),
            ("text", dto.ImageUrl ?? ""),
            ("text", dto.Notes ?? ""),
            ("integer", id));

        // If stock changed
        if (dto.Stock != oldStock)
        {
            var diff = dto.Stock - oldStock;
            var movType = diff > 0 ? "IN" : "ADJUSTMENT";
            await _db.ExecuteAsync(
                @"INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
                  VALUES (?, ?, ?, ?, 'Ajuste manual de inventario')",
                ("integer", id),
                ("text", movType),
                ("integer", Math.Abs(diff)),
                ("integer", id));
        }

        return await GetById(id);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _db.QueryAsync("SELECT id FROM products WHERE id = ?", ("integer", id));
        if (existing.Count == 0) return NotFound(new { message = "Producto no encontrado." });

        await _db.ExecuteAsync("DELETE FROM stock_movements WHERE product_id = ?", ("integer", id));
        await _db.ExecuteAsync("DELETE FROM sale_items WHERE product_id = ?", ("integer", id));
        await _db.ExecuteAsync("DELETE FROM products WHERE id = ?", ("integer", id));

        return Ok(new { message = "Producto eliminado con éxito." });
    }

    private static Product MapProduct(Dictionary<string, object?> r)
    {
        return new Product
        {
            Id = Convert.ToInt32(r["id"]),
            Code = r["code"]?.ToString(),
            Name = r["name"]?.ToString() ?? "",
            CategoryId = Convert.ToInt32(r["category_id"]),
            CategoryName = r["category_name"]?.ToString() ?? "Sin Categoría",
            Gender = r["gender"]?.ToString() ?? "Unisex",
            Size = r["size"]?.ToString() ?? "",
            PurchasePrice = decimal.TryParse(r["purchase_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var pp) ? pp : 0,
            SalePrice = decimal.TryParse(r["sale_price"]?.ToString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var sp) ? sp : 0,
            Stock = Convert.ToInt32(r["stock"] ?? 0),
            ImageUrl = r["image_url"]?.ToString(),
            Notes = r["notes"]?.ToString(),
            CreatedAt = DateTime.TryParse(r["created_at"]?.ToString(), out var ca) ? ca : null,
            UpdatedAt = DateTime.TryParse(r["updated_at"]?.ToString(), out var ua) ? ua : null
        };
    }
}
