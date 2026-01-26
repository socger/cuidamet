# Solución Error 413 - Payload Too Large

**Fecha**: 26 de enero de 2026  
**Problema**: Error 413 al guardar perfiles con fotos en base64

## Descripción del Error

Al intentar guardar un perfil profesional (provider profile) con una foto, la aplicación mostraba el siguiente error:

```
Failed to load resource: the server responded with a status of 413 (Payload Too Large)
Error al guardar perfil de proveedor: Error: request entity too large
```

### Causa del Error

El servidor NestJS tiene por defecto un límite de **100KB** para el tamaño del payload de las peticiones HTTP. Cuando se envía una foto convertida a base64, el tamaño del `photoUrl` puede superar fácilmente este límite:

- Una foto de 1MB en formato binario → ~1.3MB en base64
- Una foto de 2MB en formato binario → ~2.6MB en base64
- El base64 aumenta el tamaño en aproximadamente un 33%

## Solución Implementada

### Archivo Modificado: `src/main.ts`

**Cambio**: Aumentar el límite de payload a **10MB** para permitir imágenes grandes.

**Antes**:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===================================
  // Configuración de CORS
  // ===================================
```

**Después**:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // ===================================
  // Configuración de límite de tamaño de payload
  // ===================================
  // Aumentar el límite para permitir imágenes base64 grandes (10MB)
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // ===================================
  // Configuración de CORS
  // ===================================
```

### Explicación del Código

1. **`express.json({ limit: '10mb' })`**: Configura el límite para peticiones con `Content-Type: application/json`
2. **`express.urlencoded({ limit: '10mb', extended: true })`**: Configura el límite para peticiones con datos codificados en URL

Estos middlewares se aplican **antes** de cualquier ruta, garantizando que todas las peticiones puedan manejar payloads de hasta 10MB.

## Impacto de los Cambios

### ✅ Beneficios
- Los usuarios pueden subir fotos de perfil de alta calidad (hasta ~7MB en formato original)
- Soporte para imágenes base64 sin errores 413
- Experiencia de usuario mejorada sin compresión forzada

### ⚠️ Consideraciones

1. **Consumo de Memoria**: Peticiones más grandes consumen más memoria del servidor
2. **Rendimiento**: Peticiones más grandes tardan más en procesarse
3. **Seguridad**: Mayor riesgo de ataques DoS con payloads grandes

### 💡 Recomendaciones Futuras

Para optimizar el manejo de imágenes en producción, considera:

#### 1. Comprimir imágenes en el frontend antes de enviarlas
```typescript
// Usar una librería como browser-image-compression
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,          // Máximo 1MB
  maxWidthOrHeight: 1920, // Máximo 1920px de ancho/alto
  useWebWorker: true
};

const compressedFile = await imageCompression(file, options);
```

#### 2. Usar un servicio de almacenamiento externo
- **AWS S3**: Almacenar imágenes en buckets de S3
- **Cloudinary**: Servicio especializado en gestión de imágenes
- **Google Cloud Storage**: Alternativa escalable

Flujo recomendado:
1. Frontend sube la imagen directamente al servicio de storage
2. El servicio devuelve una URL pública
3. Frontend envía solo la URL (no el base64) al backend
4. Backend guarda solo la URL en la base de datos

#### 3. Implementar validación de tamaño en el frontend
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_FILE_SIZE) {
  alert('La imagen es demasiado grande. Máximo 5MB.');
  return;
}
```

#### 4. Configurar límites específicos por endpoint
En lugar de un límite global, usar límites específicos:

```typescript
// En el controller
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB solo para este endpoint
  })
)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Procesar archivo
}
```

## Testing

### Verificar que el problema está resuelto

1. **Iniciar el backend**:
   ```bash
   cd /home/socger/trabajo/socger/cuidamet-api
   npm run start:dev
   ```

2. **Iniciar el frontend**:
   ```bash
   cd /home/socger/trabajo/socger/cuidamet
   npm run dev
   ```

3. **Probar el flujo completo**:
   - Registrar un nuevo usuario
   - Seleccionar perfil profesional
   - Tomar o subir una foto de alta calidad (2-5MB)
   - Completar el formulario
   - Verificar que el perfil se guarda correctamente sin error 413

### Casos de Prueba

| Caso | Tamaño de Foto | Resultado Esperado |
|------|----------------|-------------------|
| Foto pequeña | < 100KB | ✅ Se guarda correctamente |
| Foto mediana | 100KB - 1MB | ✅ Se guarda correctamente |
| Foto grande | 1MB - 5MB | ✅ Se guarda correctamente (antes fallaba) |
| Foto muy grande | > 10MB | ❌ Error 413 (límite configurado) |

## Variables de Entorno (Opcional)

Para mayor flexibilidad, se puede configurar el límite mediante variables de entorno:

```typescript
// En src/main.ts
const PAYLOAD_LIMIT = process.env.MAX_PAYLOAD_SIZE || '10mb';

app.use(require('express').json({ limit: PAYLOAD_LIMIT }));
app.use(require('express').urlencoded({ limit: PAYLOAD_LIMIT, extended: true }));
```

Y en el archivo `.env`:
```env
MAX_PAYLOAD_SIZE=10mb
```

## Conclusión

El error 413 "Payload Too Large" se ha resuelto aumentando el límite de tamaño de payload del servidor NestJS de 100KB a 10MB. Esto permite a los usuarios subir fotos de perfil de alta calidad sin errores.

Para aplicaciones en producción con alto tráfico, se recomienda implementar un servicio de almacenamiento externo (S3, Cloudinary) para manejar las imágenes de forma más eficiente y escalable.

---

**Cambios implementados exitosamente** ✅
**Servidor reiniciado y funcionando correctamente** ✅
