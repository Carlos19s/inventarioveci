using VeciBar.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "VeciBar API - Inventario y Ventas de Ropa de Bebé",
        Version = "v1",
        Description = "API REST conectada a Turso DB y Cloudflare R2 para la gestión de inventario y ventas."
    });
});

// Configure CORS for mobile apps and web clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register custom services
builder.Services.AddSingleton<TursoDatabaseService>();
builder.Services.AddSingleton<CloudflareStorageService>();

var app = builder.Build();

// Enable Swagger in all environments for easy testing on MonsterASP
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VeciBar API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

// Serve static files for uploaded photos fallback
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/", () => Results.Ok(new
{
    status = "online",
    system = "VeciBar Baby Clothing Inventory API",
    version = "1.0.0",
    turso = "connected",
    swagger = "/swagger"
}));

app.Run();
