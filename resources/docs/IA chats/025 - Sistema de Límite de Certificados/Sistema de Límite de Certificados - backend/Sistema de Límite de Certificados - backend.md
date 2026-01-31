# Sistema de Límite de Certificados por Usuario

**Fecha**: 31 de enero de 2026  
**Versión**: 1.0.0  
**Tipo**: Feature - Control de Certificados

## 📋 Descripción General

Implementación de un sistema completo de límite de certificados por usuario que controla la cantidad máxima de documentos/certificados que un usuario puede subir, con validación automática, avisos al alcanzar el tope, y contador actualizado en tiempo real.

## 🎯 Problema Resuelto

### Situación Inicial
- Los usuarios podían subir certificados sin ningún límite
- No había control sobre la cantidad de documentos almacenados
- Riesgo de abuso del sistema y consumo excesivo de almacenamiento
- No había visibilidad de cuántos certificados tiene un usuario

### Solución Implementada
- Límite configurable mediante variable de entorno
- Validación automática al crear certificados
- Mensajes informativos cuando se alcanza el límite
- Contador de certificados en perfiles de usuario
- Actualización automática del contador al subir/eliminar certificados

## ⚙️ Configuración

### Variables de Entorno

**Archivo**: `.env` y `.env.example`

```env
# File Upload Configuration
# Tamaño máximo para certificados en MB
MAX_CERTIFICATE_SIZE_MB=5

# Número máximo de certificados que un usuario puede subir
# Ejemplo: 3 para permitir máximo 3 certificados por usuario
MAX_CERTIFICATES_PER_USER=3
```

**Valores por defecto**:
- `MAX_CERTIFICATES_PER_USER`: 10 certificados

## 🔧 Cambios Técnicos Implementados

### 1. Servicio de Certificados

**Archivo**: `src/certificates/certificates.service.ts`

#### Nuevos Métodos

##### `countByServiceConfig(serviceConfigId: number): Promise<number>`
Cuenta el número total de certificados de una configuración de servicio.

```typescript
async countByServiceConfig(serviceConfigId: number): Promise<number> {
  return await this.certificateRepository.count({
    where: { serviceConfigId },
  });
}
```

##### `canUploadMoreCertificates(serviceConfigId: number)`
Valida si un usuario puede subir más certificados y devuelve información detallada del límite.

**Retorna**:
```typescript
{
  canUpload: boolean;        // true si puede subir más
  currentCount: number;      // Certificados actuales
  maxLimit: number;          // Límite máximo configurado
  remaining: number;         // Certificados restantes
}
```

**Uso**:
```typescript
const limitCheck = await this.canUploadMoreCertificates(serviceConfigId);
if (!limitCheck.canUpload) {
  throw new BadRequestException('Límite alcanzado');
}
```

#### Métodos Modificados

##### `create()` - Validación de Límite
Se añadió validación antes de crear un certificado:

```typescript
// Validar límite de certificados
const limitCheck = await this.canUploadMoreCertificates(
  createCertificateDto.serviceConfigId,
);

if (!limitCheck.canUpload) {
  throw new BadRequestException(
    `Has alcanzado el límite máximo de ${limitCheck.maxLimit} certificados. ` +
    `Actualmente tienes ${limitCheck.currentCount} certificados. ` +
    `Por favor, elimina algunos certificados antes de subir uno nuevo.`,
  );
}
```

**Respuesta con metadata**:
```json
{
  "message": "Certificado creado exitosamente",
  "data": { /* certificado */ },
  "meta": {
    "certificatesCount": 4,
    "maxLimit": 10,
    "remaining": 6
  }
}
```

##### `findByServiceConfig()` - Información del Límite
Ahora incluye información del límite en la respuesta:

```typescript
const limitInfo = await this.canUploadMoreCertificates(serviceConfigId);

return {
  message: `${certificates.length} certificados encontrados`,
  data: certificates,
  meta: {
    serviceConfigId,
    total: certificates.length,
    maxLimit: limitInfo.maxLimit,
    remaining: limitInfo.remaining,
    canUploadMore: limitInfo.canUpload,
  },
};
```

##### `remove()` - Contador Actualizado
Al eliminar un certificado, se devuelve el contador actualizado:

```typescript
const limitInfo = await this.canUploadMoreCertificates(serviceConfigId);

return {
  message: 'Certificado eliminado exitosamente',
  data: certificate,
  meta: {
    certificatesCount: limitInfo.currentCount,
    maxLimit: limitInfo.maxLimit,
    remaining: limitInfo.remaining,
    canUploadMore: limitInfo.canUpload,
  },
};
```

### 2. Controlador de Certificados

**Archivo**: `src/certificates/certificates.controller.ts`

#### Nuevo Endpoint

**`GET /v1/certificates/service-config/:serviceConfigId/limit`**

Verifica el límite de certificados para una configuración de servicio.

**Parámetros**:
- `serviceConfigId` (path parameter): ID de la configuración de servicio

**Respuesta**:
```json
{
  "canUpload": true,
  "currentCount": 3,
  "maxLimit": 10,
  "remaining": 7
}
```

**Código**:
```typescript
@Get('service-config/:serviceConfigId/limit')
@ApiOperation({
  summary: 'Verificar límite de certificados',
  description: 'Obtiene información sobre el límite de certificados.',
})
async checkLimit(
  @Param('serviceConfigId', ParseIntPipe) serviceConfigId: number,
) {
  return this.certificatesService.canUploadMoreCertificates(serviceConfigId);
}
```

### 3. Servicio de Perfiles de Proveedor

**Archivo**: `src/provider-profiles/provider-profiles.service.ts`

#### Inyección de Repositorios
Se agregaron los repositorios de `ServiceConfig` y `Certificate`:

```typescript
constructor(
  @InjectRepository(ProviderProfile)
  private readonly providerProfileRepository: Repository<ProviderProfile>,
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(ServiceConfig)
  private readonly serviceConfigRepository: Repository<ServiceConfig>,
  @InjectRepository(Certificate)
  private readonly certificateRepository: Repository<Certificate>,
) {}
```

#### Nuevo Método: `getCertificatesStats()`

Método privado que calcula estadísticas de certificados para un perfil de proveedor.

**Retorna**:
```typescript
{
  totalCertificates: number;     // Total de certificados del proveedor
  maxLimit: number;              // Límite máximo configurado
  remaining: number;             // Promedio de certificados restantes
  canUploadMore: boolean;        // Si puede subir más en algún service config
  byServiceConfig: [             // Detalle por cada configuración
    {
      serviceConfigId: number,
      count: number,
      maxLimit: number,
      remaining: number,
      canUploadMore: boolean
    }
  ]
}
```

**Lógica**:
1. Obtiene todos los `ServiceConfig` del proveedor
2. Cuenta certificados agrupados por `serviceConfigId`
3. Calcula límites y restantes para cada configuración
4. Devuelve estadísticas agregadas y detalladas

#### Métodos Modificados

##### `findOne()` y `findByUserId()`
Ahora incluyen estadísticas de certificados en la respuesta:

```typescript
// Obtener estadísticas de certificados
const certificatesStats = await this.getCertificatesStats(profile.id);

return {
  message: 'Perfil de proveedor encontrado',
  data: {
    ...profile,
    certificatesStats,
  },
};
```

**Respuesta del perfil**:
```json
{
  "message": "Perfil de proveedor encontrado",
  "data": {
    "id": 1,
    "userId": 5,
    "name": "Juan Pérez",
    /* ... otros campos del perfil ... */
    "certificatesStats": {
      "totalCertificates": 3,
      "maxLimit": 10,
      "remaining": 7,
      "canUploadMore": true,
      "byServiceConfig": [
        {
          "serviceConfigId": 1,
          "count": 2,
          "maxLimit": 10,
          "remaining": 8,
          "canUploadMore": true
        },
        {
          "serviceConfigId": 2,
          "count": 1,
          "maxLimit": 10,
          "remaining": 9,
          "canUploadMore": true
        }
      ]
    }
  }
}
```

### 4. Módulo de Perfiles de Proveedor

**Archivo**: `src/provider-profiles/provider-profiles.module.ts`

Se agregaron las entidades necesarias para el cálculo de estadísticas:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderProfile, 
      User, 
      ServiceConfig,   // ← Nuevo
      Certificate      // ← Nuevo
    ])
  ],
  // ...
})
```

## 📡 Endpoints Afectados

### Endpoints de Certificados

#### `POST /v1/certificates`
**Cambios**:
- ✅ Valida límite antes de crear
- ✅ Devuelve contador en metadata
- ✅ Error 400 si se alcanza el límite

**Ejemplo de error**:
```json
{
  "statusCode": 400,
  "message": "Has alcanzado el límite máximo de 10 certificados. Actualmente tienes 10 certificados. Por favor, elimina algunos certificados antes de subir uno nuevo.",
  "error": "Bad Request"
}
```

#### `GET /v1/certificates/service-config/:serviceConfigId`
**Cambios**:
- ✅ Incluye información del límite en metadata

**Respuesta mejorada**:
```json
{
  "message": "3 certificados encontrados",
  "data": [ /* certificados */ ],
  "meta": {
    "serviceConfigId": 1,
    "total": 3,
    "maxLimit": 10,
    "remaining": 7,
    "canUploadMore": true
  }
}
```

#### `DELETE /v1/certificates/:id` (NUEVO COMPORTAMIENTO)
**Cambios**:
- ✅ Devuelve contador actualizado tras eliminar

**Respuesta mejorada**:
```json
{
  "message": "Certificado eliminado exitosamente",
  "data": { /* certificado eliminado */ },
  "meta": {
    "certificatesCount": 2,
    "maxLimit": 10,
    "remaining": 8,
    "canUploadMore": true
  }
}
```

#### `GET /v1/certificates/service-config/:serviceConfigId/limit` (NUEVO)
**Propósito**: Consultar límite sin cargar todos los certificados

**Respuesta**:
```json
{
  "canUpload": true,
  "currentCount": 3,
  "maxLimit": 10,
  "remaining": 7
}
```

### Endpoints de Perfiles de Proveedor

#### `GET /v1/provider-profiles/:id`
#### `GET /v1/provider-profiles/user/:userId`

**Cambios**:
- ✅ Incluye `certificatesStats` en la respuesta

**Respuesta mejorada**:
```json
{
  "message": "Perfil de proveedor encontrado",
  "data": {
    "id": 1,
    "userId": 5,
    /* ... campos del perfil ... */
    "certificatesStats": {
      "totalCertificates": 3,
      "maxLimit": 10,
      "remaining": 7,
      "canUploadMore": true,
      "byServiceConfig": [
        {
          "serviceConfigId": 1,
          "count": 2,
          "maxLimit": 10,
          "remaining": 8,
          "canUploadMore": true
        }
      ]
    }
  }
}
```

## 🧪 Casos de Prueba

### 1. Crear Certificado con Límite OK
```http
POST /v1/certificates
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceConfigId": 1,
  "name": "Certificado de Primeros Auxilios",
  "certificateType": "education",
  "description": "Certificado válido hasta 2026"
}
```

**Respuesta esperada** (201):
```json
{
  "message": "Certificado creado exitosamente",
  "data": { /* certificado */ },
  "meta": {
    "certificatesCount": 4,
    "maxLimit": 10,
    "remaining": 6
  }
}
```

### 2. Crear Certificado con Límite Alcanzado
```http
POST /v1/certificates
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceConfigId": 1,
  "name": "Certificado Extra",
  "certificateType": "education",
  "description": "Intento de exceder límite"
}
```

**Respuesta esperada** (400):
```json
{
  "statusCode": 400,
  "message": "Has alcanzado el límite máximo de 10 certificados. Actualmente tienes 10 certificados. Por favor, elimina algunos certificados antes de subir uno nuevo.",
  "error": "Bad Request"
}
```

### 3. Consultar Límite
```http
GET /v1/certificates/service-config/1/limit
```

**Respuesta esperada** (200):
```json
{
  "canUpload": true,
  "currentCount": 3,
  "maxLimit": 10,
  "remaining": 7
}
```

### 4. Eliminar Certificado
```http
DELETE /v1/certificates/5
Authorization: Bearer {token}
```

**Respuesta esperada** (200):
```json
{
  "message": "Certificado eliminado exitosamente",
  "data": { /* certificado eliminado */ },
  "meta": {
    "certificatesCount": 2,
    "maxLimit": 10,
    "remaining": 8,
    "canUploadMore": true
  }
}
```

### 5. Cargar Perfil de Proveedor
```http
GET /v1/provider-profiles/user/5
Authorization: Bearer {token}
```

**Respuesta esperada** (200):
```json
{
  "message": "Perfil de proveedor encontrado",
  "data": {
    "id": 1,
    "userId": 5,
    "certificatesStats": {
      "totalCertificates": 3,
      "maxLimit": 10,
      "remaining": 7,
      "canUploadMore": true,
      "byServiceConfig": [...]
    }
  }
}
```

## 💡 Uso en el Frontend

### Mostrar Contador de Certificados
```typescript
// Al cargar el perfil del usuario
const response = await fetch('/v1/provider-profiles/user/5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

const stats = data.data.certificatesStats;

// Mostrar al usuario
console.log(`Certificados: ${stats.totalCertificates}/${stats.maxLimit}`);
console.log(`Restantes: ${stats.remaining}`);

// Deshabilitar botón si llegó al límite
if (!stats.canUploadMore) {
  disableUploadButton();
  showWarning('Has alcanzado el límite de certificados');
}
```

### Validar Antes de Subir
```typescript
// Antes de mostrar el formulario de subida
const limitCheck = await fetch('/v1/certificates/service-config/1/limit');
const limit = await limitCheck.json();

if (!limit.canUpload) {
  alert(`Límite alcanzado (${limit.currentCount}/${limit.maxLimit})`);
  return;
}

// Mostrar formulario con información
showUploadForm(`Puedes subir ${limit.remaining} certificados más`);
```

### Actualizar Contador tras Eliminar
```typescript
// Después de eliminar un certificado
const response = await fetch('/v1/certificates/5', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
const result = await response.json();

// Actualizar UI con contador actualizado
updateCounter(result.meta);
```

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas
- ✅ Límite se valida en el backend (no confiamos en el frontend)
- ✅ Mensajes de error descriptivos pero no exponen información sensible
- ✅ Autenticación requerida para todos los endpoints de certificados
- ✅ Validación de existencia de `serviceConfig` antes de crear certificado

### Consideraciones
- El límite se aplica por `serviceConfigId` (cada configuración de servicio tiene su propio límite)
- Los certificados eliminados (soft delete) NO cuentan para el límite
- El límite es configurable sin necesidad de cambiar código

## 📈 Beneficios Implementados

1. **Control Centralizado**: Fácil ajustar límite mediante variable de entorno
2. **Experiencia de Usuario**: Información clara sobre límites antes de actuar
3. **Prevención de Abuso**: Sistema protegido contra spam de certificados
4. **Visibilidad**: El usuario siempre sabe cuántos certificados tiene
5. **Actualización en Tiempo Real**: Contador se actualiza automáticamente
6. **Escalabilidad**: Preparado para límites diferentes por tipo de usuario (premium, etc.)

## 🚀 Mejoras Futuras Sugeridas

1. **Límites por Tipo de Usuario**:
   - Usuario gratuito: 5 certificados
   - Usuario premium: 20 certificados
   - Usuario enterprise: ilimitado

2. **Notificaciones Proactivas**:
   - Email cuando se acerca al límite (80%)
   - Notificación in-app al alcanzar 90%

3. **Dashboard de Certificados**:
   - Gráfico de uso de certificados
   - Histórico de subidas/eliminaciones

4. **Límites por Tamaño Total**:
   - Además del límite de cantidad, controlar tamaño total en MB

## 📚 Referencias

- Variables de entorno: [`.env.example`](../../.env.example)
- CHANGELOG: [CHANGELOG.md](../../CHANGELOG.md)
- README: [README.md](../../README.md)
- Servicio de certificados: [`src/certificates/certificates.service.ts`](../../src/certificates/certificates.service.ts)
- Servicio de perfiles: [`src/provider-profiles/provider-profiles.service.ts`](../../src/provider-profiles/provider-profiles.service.ts)

---

**Última actualización**: 31 de enero de 2026  
**Autor**: Asistente IA (GitHub Copilot)  
**Estado**: ✅ Implementado y documentado
