using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace VeciBar.Api.Services;

public class CloudflareStorageService
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CloudflareStorageService> _logger;
    private readonly IAmazonS3? _s3Client;
    private readonly string _bucketName;
    private readonly string? _publicUrl;

    public CloudflareStorageService(IConfiguration config, IWebHostEnvironment env, ILogger<CloudflareStorageService> logger)
    {
        _config = config;
        _env = env;
        _logger = logger;

        _bucketName = config["CloudflareR2:BucketName"] ?? "inventariovecino";
        _publicUrl = config["CloudflareR2:PublicUrl"]?.TrimEnd('/');

        var accessKey = config["CloudflareR2:AccessKeyId"];
        var secretKey = config["CloudflareR2:SecretAccessKey"];
        var serviceUrl = config["CloudflareR2:ServiceUrl"] ?? "https://5648f816aa47f92f7ddb9d67b7380cf4.r2.cloudflarestorage.com";

        if (!string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey))
        {
            var credentials = new BasicAWSCredentials(accessKey, secretKey);
            var s3Config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true
            };
            _s3Client = new AmazonS3Client(credentials, s3Config);
            _logger.LogInformation("Cloudflare R2 client initialized for bucket {Bucket}", _bucketName);
        }
        else
        {
            _logger.LogWarning("Cloudflare R2 AccessKeyId/SecretAccessKey not provided. Using local file storage fallback with web serving.");
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, string requestBaseUrl)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext)) ext = ".jpg";
        var uniqueName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}{ext}";

        // If Cloudflare R2 is configured
        if (_s3Client != null)
        {
            try
            {
                var putRequest = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = $"productos/{uniqueName}",
                    InputStream = fileStream,
                    ContentType = contentType,
                    DisablePayloadSigning = true
                };

                await _s3Client.PutObjectAsync(putRequest);

                if (!string.IsNullOrEmpty(_publicUrl))
                {
                    return $"{_publicUrl}/productos/{uniqueName}";
                }
                return $"https://{_bucketName}.r2.cloudflarestorage.com/productos/{uniqueName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading to Cloudflare R2. Falling back to local storage.");
                fileStream.Position = 0;
            }
        }

        // Local storage fallback
        var webRoot = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads");
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        var filePath = Path.Combine(uploadsDir, uniqueName);
        using (var fs = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        return $"{requestBaseUrl.TrimEnd('/')}/uploads/{uniqueName}";
    }
}
