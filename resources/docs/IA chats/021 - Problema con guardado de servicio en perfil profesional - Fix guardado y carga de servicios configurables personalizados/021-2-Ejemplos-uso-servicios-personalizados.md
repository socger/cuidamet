# 021-2 - Ejemplos de Uso: Servicios Configurables Personalizados

## 📝 Casos de Uso Comunes

### Caso 1: Crear Servicio Personalizado Nuevo

**Escenario**: El usuario quiere ofrecer un servicio que no está en las opciones predeterminadas.

#### Pasos:
1. Ir a la categoría correspondiente (ej: "Limpieza y Mantenimiento")
2. Hacer scroll hasta "Añadir servicio personalizado"
3. Completar:
   - **Nombre**: "Limpieza de cristales"
   - **Precio**: 25
   - **Unidad**: "servicio"
4. Clic en "Añadir"
5. Guardar el perfil

#### Resultado en BD:
```sql
INSERT INTO service_variations (
  service_config_id, name, price, unit, enabled, is_custom
) VALUES (
  3, 'Limpieza de cristales', 25.00, 'servicio', 1, 1
);
```

---

### Caso 2: Actualizar Servicio Personalizado Existente

**Escenario**: El usuario quiere cambiar el precio de un servicio personalizado.

#### Pasos:
1. Cargar el perfil (GET incluye variaciones con sus IDs)
2. Modificar el precio de "Limpieza de cristales" de 25€ a 30€
3. Guardar el perfil

#### Llamada API:
```http
PATCH /api/v1/service-variations/29
Content-Type: application/json

{
  "serviceConfigId": 3,
  "name": "Limpieza de cristales",
  "price": 30.00,
  "unit": "servicio",
  "enabled": true,
  "isCustom": true
}
```

#### Resultado:
```sql
UPDATE service_variations 
SET price = 30.00, updated_at = NOW(), updated_by = 2
WHERE id = 29;
```

---

### Caso 3: Eliminar/Desactivar Servicio

**Escenario**: El usuario ya no ofrece ese servicio.

#### Pasos:
1. Cargar el perfil con el servicio existente
2. **Desactivar** el servicio en el frontend (toggle OFF o checkbox)
3. Guardar el perfil

#### Llamada API:
```http
DELETE /api/v1/service-variations/29
```

#### Flujo Detallado:
```javascript
// Frontend detecta que la variación tiene ID pero está desactivada
const variation = {
  id: 29,  // ← Tiene ID (existía en BD)
  name: "Limpieza de cristales",
  enabled: false,  // ← Está desactivada
  // ... otros campos
};

// El código ejecuta:
if (variation.id && !variation.enabled) {
  // 🗑️ ELIMINAR de la base de datos
  await fetch(`/api/v1/service-variations/${variation.id}`, {
    method: 'DELETE'
  });
}
```

#### Resultado en BD:
```sql
-- ANTES del guardado
SELECT * FROM service_variations WHERE id = 29;
-- 29 | 3 | Limpieza de cristales | 25.00 | ...

-- DESPUÉS del guardado (DELETE ejecutado)
SELECT * FROM service_variations WHERE id = 29;
-- (vacío - registro eliminado)
```

#### ✅ Verificación:
- **Al guardar**: El servicio desaparece de la interfaz inmediatamente
- **Al recargar la página**: El servicio NO vuelve a aparecer
- **Al cerrar sesión y reautenticarse**: El servicio sigue sin aparecer ✅
- **En la BD**: El registro fue eliminado completamente (no solo marcado)

---

### Caso 4: Combinar Servicios Predeterminados y Personalizados

**Escenario**: El usuario quiere algunas opciones estándar y otras personalizadas.

#### Configuración:
- ✅ Limpieza General (12€/hora) - **predeterminado**
- ✅ Limpieza a Fondo (150€/servicio) - **predeterminado**
- ✅ Limpieza de cristales (25€/servicio) - **personalizado**
- ✅ Limpieza post-obra (200€/servicio) - **personalizado**

#### Resultado en BD:
```
id | name                  | price  | is_custom
---|----------------------|--------|----------
13 | Limpieza General     | 12.00  | 0
14 | Limpieza a Fondo     | 150.00 | 0
29 | Limpieza de cristales| 25.00  | 1
30 | Limpieza post-obra   | 200.00 | 1
```

---

## 🔄 Flujo Completo: De Frontend a Base de Datos

### 1. Carga Inicial del Perfil

```javascript
// Frontend: App.tsx - handleSwitchProfile()
const servicesResponse = await serviceConfigService.getByProviderId(profile.id);

// Backend responde con:
{
  "data": [
    {
      "id": 3,
      "careCategory": "Home Cleaning",
      "variations": [
        { "id": 13, "name": "Limpieza General", "price": 12, "isCustom": false },
        { "id": 14, "name": "Limpieza a Fondo", "price": 150, "isCustom": false },
        { "id": 29, "name": "Limpieza de cristales", "price": 25, "isCustom": true }
      ]
    }
  ]
}

// Frontend mapea a:
servicesData["Home Cleaning"].variations = [
  { id: 13, name: "Limpieza General", price: 12, enabled: true, isCustom: false },
  { id: 14, name: "Limpieza a Fondo", price: 150, enabled: true, isCustom: false },
  { id: 29, name: "Limpieza de cristales", price: 25, enabled: true, isCustom: true }
];
```

### 2. Usuario Modifica Servicios

```javascript
// Usuario cambia el precio de "Limpieza de cristales" de 25€ a 30€
handleVariationPriceChange("Home Cleaning", 2, 30);

// Estado actualizado:
servicesData["Home Cleaning"].variations[2] = {
  id: 29,  // ← ID existente
  name: "Limpieza de cristales",
  price: 30,  // ← Precio actualizado
  enabled: true,
  isCustom: true
};
```

### 3. Guardado del Perfil

```javascript
// Frontend: profileService.ts - saveProviderServices()
for (const variation of serviceConfig.variations) {
  if (variation.id) {
    // ✅ Tiene ID → ACTUALIZAR con PATCH
    await fetch(`/api/v1/service-variations/${variation.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: variation.name,
        price: variation.price,
        unit: variation.unit
      })
    });
  } else {
    // ✅ No tiene ID → CREAR con POST
    await fetch(`/api/v1/service-variations`, {
      method: 'POST',
      body: JSON.stringify({
        serviceConfigId: result.data.id,
        name: variation.name,
        price: variation.price,
        unit: variation.unit,
        isCustom: true
      })
    });
  }
}
```

### 4. Base de Datos Actualizada

```sql
-- Antes del guardado
SELECT * FROM service_variations WHERE id = 29;
-- 29 | 3 | Limpieza de cristales | 25.00 | servicio | 1 | NULL | 1

-- Después del guardado (PATCH ejecutado)
SELECT * FROM service_variations WHERE id = 29;
-- 29 | 3 | Limpieza de cristales | 30.00 | servicio | 1 | NULL | 1
--                                   ^^^^^ ACTUALIZADO
```

---

## 🛡️ Validaciones Implementadas

### En el Frontend

```typescript
// OfferService.tsx - handleAddCustomService()
const handleAddCustomService = (category: CareCategory) => {
  // ✅ Validar que el nombre no esté vacío
  if (!customServiceInput.name.trim()) {
    alert('El nombre del servicio es obligatorio');
    return;
  }
  
  // ✅ Validar que el precio sea válido
  if (!customServiceInput.price || parseFloat(customServiceInput.price) <= 0) {
    alert('El precio debe ser mayor que 0');
    return;
  }
  
  // ✅ Crear variación con isCustom = true
  const newVariation: ServiceVariation = {
    name: customServiceInput.name,
    price: parseFloat(customServiceInput.price),
    unit: customServiceInput.unit,
    enabled: true,
    description: "Servicio personalizado",
    isCustom: true,  // ← Marca como personalizado
  };
  
  // Añadir al array de variaciones
  const currentVariations = [...servicesData[category].variations, newVariation];
  handleServiceDataChange(category, "variations", currentVariations);
};
```

### En el Backend

```typescript
// create-service-variation.dto.ts
export class CreateServiceVariationDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsNotEmpty({ message: 'La unidad es obligatoria' })
  @IsString({ message: 'La unidad debe ser texto' })
  @MaxLength(50, { message: 'La unidad no puede exceder 50 caracteres' })
  unit: string;
  
  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;  // ← Opcional, default false
}
```

---

## 🐛 Debugging: Cómo Verificar que Funciona

### 1. Logs en el Frontend

```javascript
// Abrir DevTools Console
// Al guardar, deberías ver:
console.log('💾 Guardando servicios para proveedor:', providerId);
console.log('📝 Procesando N variaciones para Home Cleaning...');

// Para actualizaciones:
console.log('🔄 Actualizando variación "Limpieza de cristales" (ID: 29)');
console.log('✅ Variación "Limpieza de cristales" guardada');

// Para creaciones:
console.log('➕ Creando nueva variación "Servicio nuevo"');
console.log('✅ Variación "Servicio nuevo" guardada');
```

### 2. Verificación en BD

```sql
-- Ver todas las variaciones del usuario
SELECT 
  u.email,
  sc.care_category,
  sv.id,
  sv.name,
  sv.price,
  sv.unit,
  sv.is_custom,
  sv.updated_at
FROM users u
JOIN provider_profiles pp ON pp.user_id = u.id
JOIN service_configs sc ON sc.provider_id = pp.id
LEFT JOIN service_variations sv ON sv.service_config_id = sc.id
WHERE u.email = 'yoline@yoline.com'
ORDER BY sc.care_category, sv.is_custom, sv.name;
```

### 3. Verificar No Hay Duplicados

```sql
-- Esta query NO debe devolver resultados
SELECT service_config_id, name, COUNT(*) as duplicados
FROM service_variations
GROUP BY service_config_id, name
HAVING COUNT(*) > 1;
```

---

## 🎯 Casos Edge: Qué Pasa Si...

### 1. El usuario desactiva un servicio (predeterminado o personalizado)
**Comportamiento**: Si tiene `id`, la variación se **ELIMINA** de la BD con DELETE.  
**Razón**: Si el usuario la desactiva, no la quiere ofrecer → se elimina completamente.  
**Impacto**: Al recargar o reautenticarse, NO vuelve a aparecer ✅

### 2. El usuario desactiva un servicio que acababa de crear (sin guardar antes)
**Comportamiento**: La variación NO se crea en la BD (se ignora).  
**Razón**: No tiene `id` (nunca se guardó) + está desactivada → se ignora.  
**Impacto**: Es como si nunca se hubiera añadido.

### 3. Se pierde la conexión durante el guardado
**Comportamiento**: Las variaciones que se guardaron exitosamente quedan en BD.  
**Solución**: El usuario puede volver a guardar y el sistema actualizará correctamente.

### 4. Dos usuarios guardan al mismo tiempo
**Comportamiento**: Cada usuario actualiza solo sus propias variaciones (scope por `providerId`).  
**Seguridad**: No hay conflictos porque `service_config_id` es único por proveedor.

---

## 📚 Referencias de API

### Crear Variación
```http
POST /api/v1/service-variations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "serviceConfigId": 3,
  "name": "Servicio personalizado",
  "price": 35.50,
  "unit": "hora",
  "enabled": true,
  "description": "Descripción opcional",
  "isCustom": true,
  "displayOrder": 0
}
```

### Actualizar Variación
```http
PATCH /api/v1/service-variations/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "price": 40.00,
  "description": "Descripción actualizada"
}
```

### Eliminar Variación
```http
DELETE /api/v1/service-variations/{id}
Authorization: Bearer {accessToken}
```

### Listar Variaciones de un Servicio
```http
GET /api/v1/service-variations/service-config/{serviceConfigId}

Response:
{
  "message": "N variaciones encontradas",
  "data": [
    {
      "id": 29,
      "name": "Limpieza de cristales",
      "price": 25.00,
      "unit": "servicio",
      "enabled": true,
      "isCustom": true,
      "displayOrder": 0
    }
  ],
  "meta": {
    "serviceConfigId": 3,
    "total": 1
  }
}
```

---

✅ **Documentación completa** para entender cómo funcionan los servicios configurables personalizados en Cuidamet.
