# Solución Errores de Geocodificación y Límite de PhotoURL

**Fecha**: 26 de enero de 2026  
**Problema**: Error 400 "La URL no puede exceder 500 caracteres" y error CORS con OpenStreetMap Nominatim

## Problemas Identificados

### 1. Error 400 - PhotoURL excede el límite

**Mensaje de Error**:
```
POST http://localhost:3000/v1/provider-profiles 400 (Bad Request)
Error al guardar perfil de proveedor: Error: La URL no puede exceder 500 caracteres
```

**Causa**: Las imágenes base64 son mucho más grandes que 500 caracteres:
- Foto de 100KB → ~133KB en base64
- Foto de 1MB → ~1.3MB en base64
- El límite de 500 caracteres era demasiado restrictivo

### 2. Error CORS - OpenStreetMap Nominatim

**Mensaje de Error**:
```
Access to fetch at 'https://nominatim.openstreetmap.org/reverse...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Causa**: 
- Nominatim puede bloquear peticiones desde localhost
- No siempre incluye los headers CORS necesarios
- Tiene rate limiting (1 request/segundo)

## Soluciones Implementadas

### Solución 1: Aumentar Límite de PhotoURL

#### Backend - DTOs Modificados

**Archivos**:
- [src/provider-profiles/dto/create-provider-profile.dto.ts](../../cuidamet-api/src/provider-profiles/dto/create-provider-profile.dto.ts)
- [src/client-profiles/dto/create-client-profile.dto.ts](../../cuidamet-api/src/client-profiles/dto/create-client-profile.dto.ts)

**Antes**:
```typescript
@ApiPropertyOptional({
  description: 'URL de la foto de perfil',
  example: 'https://example.com/photos/provider123.jpg',
  maxLength: 500,
})
@IsUrl()
@IsOptional()
@MaxLength(500)
photoUrl?: string;
```

**Después**:
```typescript
@ApiPropertyOptional({
  description: 'URL de la foto de perfil o imagen en base64',
  example: 'https://example.com/photos/provider123.jpg',
  maxLength: 10485760, // 10MB
})
@IsOptional()
@MaxLength(10485760)
photoUrl?: string;
```

**Cambios**:
- ✅ Límite aumentado de 500 caracteres a **10MB** (10,485,760 bytes)
- ✅ Removido validador `@IsUrl()` para permitir base64
- ✅ Descripción actualizada para indicar soporte de base64

### Solución 2: Servicio de Geocodificación Centralizado

#### Nuevo Archivo: `services/geocodingService.ts`

Creé un servicio centralizado que maneja la geocodificación con:

**Características**:
- ✅ Manejo robusto de errores CORS
- ✅ Fallback automático a coordenadas si falla la geocodificación
- ✅ Header `User-Agent` requerido por Nominatim
- ✅ Timeout de 10 segundos
- ✅ Código reutilizable en múltiples componentes

**Funciones principales**:

```typescript
/**
 * Convierte coordenadas a dirección legible
 * Si falla, devuelve las coordenadas como fallback
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodingResult>

/**
 * Obtiene ubicación actual y la convierte a dirección
 * Incluye manejo completo de errores
 */
export const getCurrentLocation = (): Promise<{
  coordinates: { latitude: number; longitude: number };
  address: string;
  error?: string;
}>
```

#### Componentes Actualizados

**Archivos modificados**:
- [components/profiles/createProfile/FamiliarRegistration.tsx](../../components/profiles/createProfile/FamiliarRegistration.tsx)
- [components/profiles/createProfile/ProfesionalRegistration.tsx](../../components/profiles/createProfile/ProfesionalRegistration.tsx)

**Antes** (código duplicado en cada componente):
```typescript
const handleDetectLocation = () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?...`
      );
      // ... manejo de respuesta
    },
    (error) => {
      // ... manejo de error
    }
  );
};
```

**Después** (usando servicio centralizado):
```typescript
const handleDetectLocation = async () => {
  setIsLocating(true);

  try {
    const { getCurrentLocation } = await import('../../../services/geocodingService');
    const result = await getCurrentLocation();
    
    // Guardar coordenadas
    handleProfileChange("coordinates", result.coordinates);
    // Guardar dirección (o coordenadas si falló)
    handleProfileChange("location", result.address);
    
    if (result.error) {
      console.warn('Geocodificación falló, usando coordenadas:', result.error);
    }
  } catch (error: any) {
    setAlertModal({
      isOpen: true,
      message: "No pudimos obtener tu ubicación...",
      title: "Error de ubicación",
    });
  } finally {
    setIsLocating(false);
  }
};
```

**Mejoras**:
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Mejor manejo de errores
- ✅ Fallback automático a coordenadas
- ✅ No bloquea el flujo si falla la geocodificación
- ✅ Logs informativos en consola

## Flujo Completo con las Mejoras

### 1. Usuario hace clic en "Detectar ubicación"

1. Se obtienen las coordenadas GPS del navegador
2. **Intenta** geocodificar con Nominatim
3. **Si tiene éxito**: Guarda dirección legible (ej: "Calle Mayor, Madrid")
4. **Si falla (CORS/red)**: Guarda coordenadas (ej: "37.964259, -1.222445")
5. El perfil se puede guardar en cualquier caso

### 2. Usuario completa el formulario y guarda

1. Los datos incluyen `photoUrl` (puede ser base64 grande)
2. Backend valida que no exceda 10MB
3. Se guarda el perfil correctamente

## Ventajas de las Soluciones

### PhotoURL
- ✅ Soporta imágenes base64 de hasta ~7MB originales
- ✅ No requiere servidor de almacenamiento externo
- ✅ Funciona inmediatamente sin configuración adicional
- ✅ Compatible con el límite de 10MB del payload (configurado anteriormente)

### Geocodificación
- ✅ No bloquea el registro si falla
- ✅ Usuario siempre puede continuar
- ✅ Código más limpio y mantenible
- ✅ Fácil cambiar a otro proveedor de geocodificación en el futuro

## Testing

### Verificar PhotoURL

1. **Registrar usuario y seleccionar perfil profesional/familiar**
2. **Tomar una foto de alta calidad** (2-5MB)
3. **Completar el formulario**
4. **Verificar** que se guarda correctamente sin error 400

### Verificar Geocodificación

#### Caso 1: Geocodificación exitosa
1. Hacer clic en "Detectar ubicación"
2. Conceder permisos al navegador
3. Esperar que se obtenga dirección legible
4. Verificar en consola: Sin errores CORS

#### Caso 2: Geocodificación con error CORS (esperado)
1. Hacer clic en "Detectar ubicación"
2. Conceder permisos al navegador
3. Si aparece error CORS en consola: **Normal** ✅
4. Verificar que el campo muestra coordenadas (ej: "37.964259, -1.222445")
5. **El usuario puede continuar y guardar el perfil** ✅

## Limitaciones Conocidas

### OpenStreetMap Nominatim

**Limitaciones del servicio**:
- **Rate limiting**: 1 request por segundo
- **CORS**: Puede bloquear peticiones desde localhost
- **Uso**: Solo para proyectos de desarrollo/educativos

**Alternativas para producción**:

1. **Google Maps Geocoding API**
   - Muy confiable, CORS configurado correctamente
   - Requiere API key y facturación
   - Costo: $5 por 1000 requests (primera llamada gratis cada mes)

2. **Mapbox Geocoding API**
   - Excelente para aplicaciones web
   - 100,000 requests gratis/mes
   - Muy buena documentación

3. **Backend Proxy**
   - Hacer la petición desde el backend en lugar del frontend
   - Evita problemas de CORS
   - Mayor control y seguridad

## Implementación Futura Recomendada

### Opción A: Backend Proxy

**Crear endpoint en NestJS**:
```typescript
// src/geocoding/geocoding.controller.ts
@Get('reverse')
async reverseGeocode(
  @Query('lat') lat: number,
  @Query('lon') lon: number,
) {
  // Hacer petición desde el backend
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?...`
  );
  return response.json();
}
```

**Frontend usa el proxy**:
```typescript
// En lugar de llamar directamente a Nominatim
const response = await fetch(
  `${API_URL}/v1/geocoding/reverse?lat=${lat}&lon=${lon}`
);
```

### Opción B: Google Maps Geocoding

**Ventajas**:
- Sin problemas de CORS
- Muy confiable
- Resultados de mejor calidad

**Implementación**:
```typescript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}`
);
```

## Archivos Modificados

### Backend
- ✅ [src/provider-profiles/dto/create-provider-profile.dto.ts](../../cuidamet-api/src/provider-profiles/dto/create-provider-profile.dto.ts)
- ✅ [src/client-profiles/dto/create-client-profile.dto.ts](../../cuidamet-api/src/client-profiles/dto/create-client-profile.dto.ts)

### Frontend
- ✅ [services/geocodingService.ts](../../services/geocodingService.ts) - **NUEVO**
- ✅ [components/profiles/createProfile/FamiliarRegistration.tsx](../../components/profiles/createProfile/FamiliarRegistration.tsx)
- ✅ [components/profiles/createProfile/ProfesionalRegistration.tsx](../../components/profiles/createProfile/ProfesionalRegistration.tsx)

## Conclusión

Ambos problemas han sido resueltos:

1. ✅ **PhotoURL**: Límite aumentado a 10MB para soportar base64
2. ✅ **Geocodificación**: Servicio centralizado con manejo robusto de errores y fallback

Los usuarios ahora pueden:
- Subir fotos de cualquier tamaño razonable
- Usar la detección de ubicación aunque falle la geocodificación
- Completar el registro sin bloqueadores

Para producción, se recomienda implementar un proxy backend o usar Google Maps API para eliminar completamente los problemas de CORS.

---

**Cambios implementados exitosamente** ✅  
**Sin errores de compilación** ✅  
**Listo para testing** ✅
