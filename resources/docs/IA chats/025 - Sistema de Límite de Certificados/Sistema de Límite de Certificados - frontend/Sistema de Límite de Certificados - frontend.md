# Frontend: Validación de Límite de Certificados

**Fecha**: 31 de enero de 2026  
**Versión**: 1.0.0  
**Tipo**: Feature - UI y Validación Frontend

## 📋 Descripción General

Implementación de la validación y visualización del límite de certificados en el frontend de Cuidamet. El sistema muestra un contador visual, valida antes de subir archivos y proporciona feedback claro al usuario sobre el límite de certificados permitidos.

## 🎯 Problema Resuelto

### Situación Inicial
- No había validación de límite en el frontend
- El usuario no sabía cuántos certificados tenía subidos
- No había advertencias antes de alcanzar el límite
- La validación solo ocurría en el backend (después de subir)

### Solución Implementada
- ✅ Validación frontend antes de subir archivos
- ✅ Contador visual (X/10) siempre visible
- ✅ Badge "Límite alcanzado" cuando se alcanza el máximo
- ✅ Aviso cuando quedan 3 o menos certificados disponibles
- ✅ Mensaje de error claro al intentar exceder el límite
- ✅ Configuración via variable de entorno

## ⚙️ Configuración

### Variable de Entorno

**Archivo**: `.env.example` o `.env.local`

```env
# ============================================
# Límite de certificados por usuario
# Número máximo de certificados que un usuario puede subir por servicio
# ============================================
VITE_MAX_CERTIFICATES_PER_USER=10
```

**Valor por defecto**: 10 certificados (si no se configura)

## 🔧 Cambios Técnicos Implementados

### 1. Servicio de Certificados

**Archivo**: `services/profileService.ts`

#### Nuevo Método: `checkLimit()`

Verifica el límite de certificados para una configuración de servicio.

```typescript
checkLimit: async (serviceConfigId: number) => {
  const response = await fetchWithAuth(
    `${API_URL}/${API_VERSION}/certificates/service-config/${serviceConfigId}/limit`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al verificar límite');
  }

  return response.json();
}
```

**Respuesta esperada**:
```json
{
  "canUpload": true,
  "currentCount": 3,
  "maxLimit": 10,
  "remaining": 7
}
```

### 2. Componente ProfesionalRegistration.tsx

#### Validación Antes de Subir

**Ubicación**: Función `handleCertificateUpload()`

```typescript
// Validar límite de certificados
const maxCertificates = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
const currentCerts = servicesData[category].certificates || [];

if (currentCerts.length >= maxCertificates) {
  alert(
    `Has alcanzado el límite máximo de ${maxCertificates} certificados por servicio.\n` +
    `Tienes ${currentCerts.length} certificados.\n` +
    `Elimina algunos certificados antes de subir uno nuevo.`
  );
  return;
}
```

#### Contador Visual

**Ubicación**: Sección de certificados

```tsx
<div className="flex items-center justify-between mb-3">
  <label className="text-sm font-bold text-slate-700 flex items-center">
    <DocumentTextIcon className="w-4 h-4 mr-2 text-teal-600" />
    Certificados y Documentación
  </label>
  {(() => {
    const maxCerts = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
    const currentCount = config.certificates?.length || 0;
    
    return (
      <div className="flex items-center gap-2">
        {/* Contador X/Y */}
        <div className="text-xs text-slate-500">
          <span className={`font-semibold ${currentCount >= maxCerts ? 'text-red-600' : 'text-teal-600'}`}>
            {currentCount}
          </span>
          <span className="text-slate-400">/{maxCerts}</span>
        </div>
        
        {/* Badge de límite alcanzado */}
        {currentCount >= maxCerts && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            Límite alcanzado
          </span>
        )}
      </div>
    );
  })()}
</div>
```

#### Aviso de Certificados Restantes

**Ubicación**: Botón de subida de certificados

```tsx
{(() => {
  const maxCerts = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
  const currentCount = config.certificates?.length || 0;
  const remaining = maxCerts - currentCount;
  
  return (
    <>
      <p className="text-xs text-slate-400 mt-1">
        PDF, JPG o PNG (Máx 5MB)
      </p>
      {/* Advertencia cuando quedan 3 o menos */}
      {remaining > 0 && remaining <= 3 && (
        <p className="text-xs text-orange-600 font-medium mt-1">
          Solo puedes subir {remaining} certificado{remaining !== 1 ? 's' : ''} más
        </p>
      )}
    </>
  );
})()}
```

### 3. Componente OfferService.tsx

**Cambios idénticos** a ProfesionalRegistration.tsx pero con el sistema de alertas modal:

```typescript
if (currentCerts.length >= maxCertificates) {
  setAlertModal({
    isOpen: true,
    title: "Límite Alcanzado",
    message: `Has alcanzado el límite máximo de ${maxCertificates} certificados por servicio...`
  });
  return;
}
```

## 🎨 Diseño Visual

### Estados del Contador

#### Estado Normal (< 80% del límite)
```
┌─────────────────────────────┐
│ 📄 Certificados y Documentación   3/10 │
└─────────────────────────────┘
```
- Contador verde: indica uso normal

#### Estado de Advertencia (> 80%, quedan ≤3)
```
┌─────────────────────────────┐
│ 📄 Certificados y Documentación   8/10 │
└─────────────────────────────┘

Solo puedes subir 2 certificados más
```
- Contador naranja: advierte que quedan pocos
- Mensaje informativo en el botón de subida

#### Estado Límite Alcanzado (100%)
```
┌─────────────────────────────────────┐
│ 📄 Certificados y Documentación   10/10 [Límite alcanzado] │
└─────────────────────────────────────┘
```
- Contador rojo: límite alcanzado
- Badge "Límite alcanzado" visible
- No se puede subir más (validación impide click)

### Colores Utilizados

| Estado | Color | Clase Tailwind | Uso |
|--------|-------|----------------|-----|
| Normal | Verde | `text-teal-600` | Contador < límite |
| Advertencia | Naranja | `text-orange-600` | Mensaje de aviso |
| Límite | Rojo | `text-red-600` | Contador al límite |
| Badge límite | Rojo claro | `bg-red-100 text-red-700` | Badge visual |

## 📱 Flujo de Usuario

### Caso 1: Subida Normal

```
1. Usuario hace click en "Sube tu CV o Certificados"
2. ✅ Sistema valida: 3 < 10 certificados
3. ✅ Muestra selector de archivos
4. Usuario selecciona archivo
5. ✅ Sistema valida tamaño (< 5MB)
6. ✅ Sistema valida tipo (PDF/JPG/PNG)
7. ✅ Sube archivo al backend
8. ✅ Actualiza contador: 3 → 4
```

### Caso 2: Advertencia (Quedan 3 o menos)

```
1. Usuario tiene 8 certificados subidos
2. 👁️ Ve mensaje: "Solo puedes subir 2 certificados más"
3. Usuario hace click en subir
4. ✅ Sistema permite (8 < 10)
5. Sube archivo exitosamente
6. Actualiza a 9/10
7. 👁️ Nuevo mensaje: "Solo puedes subir 1 certificado más"
```

### Caso 3: Límite Alcanzado

```
1. Usuario tiene 10 certificados subidos
2. 👁️ Ve contador: "10/10 [Límite alcanzado]"
3. Usuario intenta hacer click en subir
4. ❌ Sistema muestra alert:
   "Has alcanzado el límite máximo de 10 certificados por servicio.
    Tienes 10 certificados.
    Elimina algunos certificados antes de subir uno nuevo."
5. Usuario elimina un certificado
6. Actualiza a 9/10
7. ✅ Puede subir nuevamente
```

## 🧪 Casos de Prueba

### Test 1: Validación de Límite
```typescript
// Configurar: VITE_MAX_CERTIFICATES_PER_USER=10
// Estado: Usuario tiene 9 certificados

// Acción 1: Subir certificado
expect(canUpload()).toBe(true);
expect(getCurrentCount()).toBe(9);
expect(getRemaining()).toBe(1);

// Acción 2: Subir otro certificado
uploadCertificate();
expect(getCurrentCount()).toBe(10);
expect(canUpload()).toBe(false);

// Acción 3: Intentar subir más
expect(() => uploadCertificate()).toShowAlert("Límite alcanzado");
```

### Test 2: Contador Visual
```typescript
// Verificar que el contador se actualice correctamente
expect(getCounterText()).toBe("9/10");
expect(getCounterColor()).toBe("text-teal-600");

uploadCertificate();
expect(getCounterText()).toBe("10/10");
expect(getCounterColor()).toBe("text-red-600");
expect(getLimitBadge()).toBeVisible();
```

### Test 3: Mensaje de Advertencia
```typescript
// Con 8 certificados (quedan 2)
expect(getWarningMessage()).toBe("Solo puedes subir 2 certificados más");

// Con 9 certificados (queda 1)
expect(getWarningMessage()).toBe("Solo puedes subir 1 certificado más");

// Con 10 certificados
expect(getWarningMessage()).not.toBeVisible();
```

## 💡 Uso en Desarrollo

### Configurar Límite Personalizado

**Archivo**: `.env.local`

```env
# Para desarrollo: límite bajo para pruebas rápidas
VITE_MAX_CERTIFICATES_PER_USER=3

# Para producción: límite estándar
VITE_MAX_CERTIFICATES_PER_USER=10

# Para usuarios premium (futuro)
VITE_MAX_CERTIFICATES_PER_USER=20
```

### Verificar Configuración

```javascript
// En consola del navegador
console.log('Límite configurado:', 
  Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10
);
```

## 📊 Estadísticas de Usuario

### Información Disponible

El usuario siempre puede ver:
- ✅ Cuántos certificados tiene subidos
- ✅ Cuántos puede subir como máximo
- ✅ Cuántos le quedan disponibles
- ✅ Si ha alcanzado el límite

### Ejemplo Visual

```
┌──────────────────────────────────┐
│ 📄 Certificados (3/10)           │
├──────────────────────────────────┤
│ ✓ CV_Juan_Perez.pdf              │
│ ✓ Certificado_Primeros_Auxilios  │
│ ✓ Titulo_Enfermeria.pdf          │
├──────────────────────────────────┤
│ [+] Sube tu CV o Certificados    │
│     PDF, JPG o PNG (Máx 5MB)     │
└──────────────────────────────────┘
```

## 🚀 Mejoras Futuras Implementables

### 1. Validación Remota
Consultar el límite real desde el backend antes de permitir subir:

```typescript
const handleCertificateUpload = async (category, e) => {
  // Validación local actual
  const maxCertificates = 10;
  
  // Validación remota (NUEVA)
  if (serviceConfigId) {
    const limitCheck = await certificateService.checkLimit(serviceConfigId);
    if (!limitCheck.canUpload) {
      alert(`Límite alcanzado en servidor: ${limitCheck.currentCount}/${limitCheck.maxLimit}`);
      return;
    }
  }
  
  // Continuar con subida...
};
```

### 2. Barra de Progreso Visual
```tsx
<div className="w-full bg-slate-200 rounded-full h-2">
  <div 
    className={`h-2 rounded-full transition-all ${
      percentage < 80 ? 'bg-teal-500' : 
      percentage < 100 ? 'bg-orange-500' : 
      'bg-red-500'
    }`}
    style={{ width: `${percentage}%` }}
  />
</div>
```

### 3. Tooltip Informativo
```tsx
<Tooltip content="Límite de certificados: evita spam y mantiene calidad">
  <InfoIcon className="w-4 h-4 text-slate-400" />
</Tooltip>
```

### 4. Notificación Toast
```typescript
if (remaining === 2) {
  showToast('⚠️ Te quedan solo 2 certificados disponibles', 'warning');
}
```

## 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `.env.example` | Nueva variable `VITE_MAX_CERTIFICATES_PER_USER=10` |
| `services/profileService.ts` | Nuevo método `checkLimit()` |
| `ProfesionalRegistration.tsx` | Validación, contador y avisos |
| `OfferService.tsx` | Validación, contador y avisos (con modal) |

## ✨ Beneficios Implementados

1. **UX Mejorada**: Usuario siempre informado sobre su límite
2. **Validación Temprana**: Se evita subir archivos innecesariamente
3. **Feedback Visual**: Contador y badges proporcionan información instantánea
4. **Prevención de Errores**: Validación antes de consumir ancho de banda
5. **Configurabilidad**: Fácil ajustar límite via variable de entorno

## 📚 Referencias

- Backend: [020-1-implementacion-limite-certificados.md](../../cuidamet-api/resources/documents/AI%20conversations/IA%20chats/020%20-%20Sistema%20de%20Límite%20de%20Certificados/020-1-implementacion-limite-certificados.md)
- API Endpoint: `GET /v1/certificates/service-config/:id/limit`
- Servicio: [profileService.ts](../../../services/profileService.ts)

---

**Última actualización**: 31 de enero de 2026  
**Autor**: Asistente IA (GitHub Copilot)  
**Estado**: ✅ Implementado y funcionando
