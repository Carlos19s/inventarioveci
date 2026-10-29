using Microsoft.AspNetCore.Mvc;
using VeciBar.Api.Models;
using VeciBar.Api.Services;

namespace VeciBar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly TursoDatabaseService _db;

    public CategoriesController(TursoDatabaseService db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        var rows = await _db.QueryAsync("SELECT id, name, description, created_at FROM categories ORDER BY name COLLATE NOCASE ASC");
        var list = new List<Category>();
        foreach (var r in rows)
        {
            list.Add(new Category
            {
                Id = Convert.ToInt32(r["id"]),
                Name = r["name"]?.ToString() ?? "",
                Description = r["description"]?.ToString(),
                CreatedAt = DateTime.TryParse(r["created_at"]?.ToString(), out var dt) ? dt : null
            });
        }
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<Category>> Create([FromBody] CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "El nombre de la categoría es obligatorio." });
        }

        var trimmedName = dto.Name.Trim();

        // Check if exists
        var existing = await _db.QueryAsync(
            "SELECT id, name, description, created_at FROM categories WHERE LOWER(name) = LOWER(?)",
            ("text", trimmedName));

        if (existing.Count > 0)
        {
            var first = existing[0];
            return Ok(new Category
            {
                Id = Convert.ToInt32(first["id"]),
                Name = first["name"]?.ToString() ?? trimmedName,
                Description = first["description"]?.ToString(),
                CreatedAt = DateTime.TryParse(first["created_at"]?.ToString(), out var dt) ? dt : null
            });
        }

        var id = await _db.ExecuteAndGetLastInsertIdAsync(
            "INSERT INTO categories (name, description) VALUES (?, ?)",
            ("text", trimmedName),
            ("text", dto.Description ?? ""));

        return Ok(new Category
        {
            Id = (int)(id ?? 0),
            Name = trimmedName,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        });
    }
}
