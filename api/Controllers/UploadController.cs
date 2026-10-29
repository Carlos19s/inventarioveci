using Microsoft.AspNetCore.Mvc;
using VeciBar.Api.Services;

namespace VeciBar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly CloudflareStorageService _storage;
    private readonly ILogger<UploadController> _logger;

    public UploadController(CloudflareStorageService storage, ILogger<UploadController> logger)
    {
        _storage = storage;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult> Upload([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No se ha proporcionado ningún archivo de imagen." });
        }

        try
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            using var stream = file.OpenReadStream();
            var url = await _storage.UploadFileAsync(stream, file.FileName, file.ContentType, baseUrl);

            return Ok(new
            {
                url,
                fileName = file.FileName,
                size = file.Length,
                contentType = file.ContentType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar la subida de imagen");
            return StatusCode(500, new { message = "Error al subir la imagen: " + ex.Message });
        }
    }

    [HttpPost("base64")]
    public async Task<ActionResult> UploadBase64([FromBody] Base64UploadDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Base64Data))
        {
            return BadRequest(new { message = "Datos de imagen base64 requeridos." });
        }

        try
        {
            var data = dto.Base64Data;
            var contentType = "image/jpeg";
            var ext = ".jpg";

            if (data.Contains(","))
            {
                var parts = data.Split(',');
                var header = parts[0];
                data = parts[1];

                if (header.Contains("image/png")) { contentType = "image/png"; ext = ".png"; }
                else if (header.Contains("image/webp")) { contentType = "image/webp"; ext = ".webp"; }
            }

            var bytes = Convert.FromBase64String(data);
            using var ms = new MemoryStream(bytes);

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var fileName = $"foto_{DateTime.UtcNow.Ticks}{ext}";
            var url = await _storage.UploadFileAsync(ms, fileName, contentType, baseUrl);

            return Ok(new
            {
                url,
                fileName,
                size = bytes.Length,
                contentType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al procesar imagen base64");
            return StatusCode(500, new { message = "Error al subir la imagen base64: " + ex.Message });
        }
    }
}

public class Base64UploadDto
{
    public string Base64Data { get; set; } = string.Empty;
}
