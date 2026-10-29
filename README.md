# 👶 VeciBar - Sistema Móvil de Inventario y Ventas de Ropa de Bebé

Sistema integral diseñado para tiendas boutique de ropa para bebés, compuesto por **2 Aplicaciones Móviles Separadas** y una **API REST en ASP.NET Core (.NET 8)** lista para desplegar en **MonsterASP.NET**, conectada a **Turso Database** y **Cloudflare R2**.

---

## 📱 Estructura del Proyecto

```
VeciBar/
├── api/                   # Backend API (.NET 8 Web API para MonsterASP.NET)
│   ├── Controllers/       # Categorías, Productos, Ventas, Métricas y Fotos
│   ├── Services/          # Turso HTTP Pipeline & Cloudflare R2 / Storage Fallback
│   ├── Models/            # Modelos de datos y DTOs
│   ├── appsettings.json   # Configuración de Turso y Cloudflare
│   ├── web.config         # Configuración IIS para MonsterASP
│   └── VeciBar.Api.csproj # Proyecto C# .NET 8
│
├── app-vendedora/         # Aplicación Móvil 1: Personal de Ventas (PWA Móvil)
│   ├── src/views/         # Inventario dinámico, Registro de Ropa con Cámara, Venta rápida
│   ├── src/components/    # Creación de Categorías al vuelo, Captura de Fotos WebP
│   └── src/services/      # Conexión API y Compresión en el cliente (<150KB)
│
├── app-dueno/             # Aplicación Móvil 2: Dueño del Negocio (PWA Móvil)
│   ├── src/views/         # Dashboard Financiero (Ganancias), Salidas de Stock, Modo Seguro
│   └── src/components/    # Selector Diario/Semanal/Mensual, Auditoría de Tickets
│
├── VeciBar.sln            # Archivo de solución para compilación en MonsterASP
└── .github/workflows/     # CI/CD automatizado para MonsterASP
```

---

## 🌟 1. Aplicación Móvil 1: Personal de Ventas (`app-vendedora`)
Diseñada específicamente para el personal que atiende y registra la ropa de bebé:
* **Registro de Ropa de Bebé**:
  * Nombre, SKU/Código, Talla (`RN`, `0-3M`, `3-6M`, `6-9M`, `9-12M`, `12-18M`, `18-24M`, `2T`, `3T`, etc.).
  * Género: Niño (👦), Niña (👧), Unisex (🍼).
  * **Precio de Compra** (Costo al proveedor) y **Precio de Venta** (PVP al público).
  * Stock inicial ingresado.
* **Categorías Dinámicas al Vuelo**:
  * Botón **"+ Nueva Categoría"**: Si llega mercadería con una categoría nueva, se crea al instante en Turso y se actualiza inmediatamente en los filtros de búsqueda y en el formulario.
* **Toma de Fotos y Subida a Cloudflare R2**:
  * Abre directamente la cámara del celular (`capture="environment"`).
  * **Compresión automática en el navegador** (WebP / JPEG < 150KB) para que la subida sea instantánea y ahorre datos móviles.
* **Cobro Rápido (POS Móvil)**:
  * Agrega prendas a la bolsa con un toque (`+`), selecciona la forma de pago (Efectivo, QR/Transferencia, Tarjeta) y registra la venta. Descuenta el stock en Turso automáticamente.

---

## 💼 2. Aplicación Móvil 2: Dueño del Negocio (`app-dueno`)
Diseñada para el control total del negocio y análisis de rentabilidad:
* **Inventario en Modo Seguro (Solo Lectura)**:
  * El dueño tiene acceso para supervisar todo el catálogo, pero **por seguridad no puede agregar ni eliminar prendas**.
  * Ve claramente para cada prenda: **Precio de Compra**, **Precio de Venta**, **Ganancia Unitaria** y **Ganancia Potencial en Stock**.
* **Dashboard de Ganancias Financieras**:
  * Selector por período: **Hoy (Diario)**, **Esta Semana (Semanal)** y **Este Mes (Mensual)**.
  * **Ganancia Neta en Bolsillo** (Ventas - Costos) con porcentaje de margen.
  * Total de Ventas recaudadas vs Costo total pagado a proveedores.
  * Cantidad de prendas vendidas.
* **Salidas de Stock Detalladas**:
  * Muestra con exactitud qué prendas salieron de stock el día de hoy, esta semana y este mes.
  * Desglose de unidades vendidas, ingresos generados y ganancia neta obtenida de cada prenda.
* **Valorización Global de Bodega**:
  * Dinero total invertido en mercadería existente.
  * Venta proyectada y ganancia total acumulada.
  * Alertas de stock crítico (prendas con 3 o menos unidades).

---

## ☁️ 3. Backend API (`api/`) & Despliegue en MonsterASP.NET

La API está construida en **ASP.NET Core (.NET 8.0)**, el lenguaje nativo y más optimizado para la plataforma MonsterASP.NET.

### Conexión a Turso DB:
Configurada en `api/appsettings.json`:
* URL: `https://inventariobar-carlos19s.aws-us-east-1.turso.io`
* Token: JWT de Turso ya incorporado.

### Conexión a Cloudflare R2:
* Account ID: `5648f816aa47f92f7ddb9d67b7380cf4`
* S3 API: `https://5648f816aa47f92f7ddb9d67b7380cf4.r2.cloudflarestorage.com`
* Bucket: `inventariovecino`
* *Nota:* Para habilitar subida directa S3 en Cloudflare R2, genera un token en Cloudflare R2 (Access Key ID y Secret Access Key) y colócalos en `appsettings.json` o variables de entorno. Si no los tienes a mano, la API cuenta con un almacenamiento local optimizado automático con compresión que funciona inmediatamente.

### Despliegue en MonsterASP.NET (Paso a Paso):
1. Entra a tu panel de control de **MonsterASP.NET**.
2. Ve a **Websites** y selecciona tu sitio.
3. En el menú lateral, haz clic en **Git deploy**.
4. En **Repository URL**, pega:
   ```
   https://github.com/Carlos19s/inventarioveci.git
   ```
5. En **Branch**, selecciona `main` (o `master`).
6. En tipo de despliegue, selecciona **Build .NET app**.
7. Haz clic en **Enable Git deploy** y luego en **Publish**. MonsterASP compilará el proyecto `.sln` y publicará la API automáticamente en tu dominio.

---

## 🚀 4. Cómo Probar Localmente

### Ejecutar la API:
```bash
cd api
dotnet run
# Disponible en: http://localhost:5000 (Swagger en http://localhost:5000/swagger)
```

### Ejecutar la App de la Vendedora:
```bash
cd app-vendedora
npm run dev
# Abre en tu navegador o celular (por ejemplo: http://localhost:5173)
```

### Ejecutar la App del Dueño:
```bash
cd app-dueno
npm run dev
# Abre en tu navegador o celular (por ejemplo: http://localhost:5174)
```

Ambas aplicaciones cuentan con un botón de **Configuración (⚙️)** en la barra superior para cambiar la URL de la API hacia tu servidor de MonsterASP o localhost en cualquier momento.
