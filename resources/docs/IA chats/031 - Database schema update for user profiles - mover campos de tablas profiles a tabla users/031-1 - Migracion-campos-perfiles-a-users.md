# Migración de Campos de Perfiles a Users

**Fecha**: 07 de febrero de 2026

## 🎯 Objetivo

Mover los campos compartidos de las tablas `provider_profiles` y `client_profiles` a la tabla `users` para evitar duplicación de datos cuando un usuario tenga ambos perfiles.

## 📋 Campos Movidos

Los siguientes campos se han movido desde las tablas de perfiles a la tabla `users`:

- ✅ `phone` - Número de teléfono  
- ✅ `photo_url` - URL de la foto de perfil
- ✅ `location` - Ubicación (dirección o ciudad)
- ✅ `latitude` - Latitud de la ubicación
- ✅ `longitude` - Longitud de la ubicación
- ✅ `languages` - Idiomas que habla (array)
- ✅ `is_premium` - Estado de suscripción premium

## 🔧 Cambios Realizados

### Backend (cuidamet-api)

#### 1. Entidades Modificadas

**[user.entity.ts](../../cuidamet-api/src/entities/user.entity.ts)**
- ✅ Agregados 7 nuevos campos a la entidad User
- ✅ Todos los campos son opcionales excepto `is_premium` (default: false)

**[provider-profile.entity.ts](../../cuidamet-api/src/entities/provider-profile.entity.ts)**
- ✅ Eliminados 7 campos movidos a User
- ✅ Agregado comentario explicativo

**[client-profile.entity.ts](../../cuidamet-api/src/entities/client-profile.entity.ts)**
- ✅ Eliminados 7 campos movidos a User
- ✅ Agregado comentario explicativo

#### 2. DTOs Actualizados

**DTOs de Users**:
- [create-user.dto.ts](../../cuidamet-api/src/users/dto/create-user.dto.ts) - ✅ Agregados campos con validators
- [update-user.dto.ts](../../cuidamet-api/src/users/dto/update-user.dto.ts) - ✅ Agregados campos opcionales

**DTOs de Perfiles**:
- [create-provider-profile.dto.ts](../../cuidamet-api/src/provider-profiles/dto/create-provider-profile.dto.ts) - ✅ Eliminados campos movidos
- [create-client-profile.dto.ts](../../cuidamet-api/src/client-profiles/dto/create-client-profile.dto.ts) - ✅ Eliminados campos movidos
- [provider-profile-filters.dto.ts](../../cuidamet-api/src/provider-profiles/dto/provider-profile-filters.dto.ts) - ✅ Actualizada documentación
- [client-profile-filters.dto.ts](../../cuidamet-api/src/client-profiles/dto/client-profile-filters.dto.ts) - ✅ Actualizada documentación

#### 3. Servicios Modificados

**[provider-profiles.service.ts](../../cuidamet-api/src/provider-profiles/provider-profiles.service.ts)**
- ✅ Agregado `leftJoinAndSelect('provider.user', 'user')` en queries
- ✅ Cambiadas referencias de `provider.location` a `user.location`  
- ✅ Cambiadas referencias de `provider.languages` a `user.languages`
- ✅ Cambiadas referencias de `provider.isPremium` a `user.isPremium`
- ✅ Actualizado método `findNearby()` para usar coordenadas desde `user`

**[client-profiles.service.ts](../../cuidamet-api/src/client-profiles/client-profiles.service.ts)**
- ✅ Cambiadas referencias de `profile.location` a `user.location`
- ✅ Cambiadas referencias de `profile.languages` a `user.languages`
- ✅ Cambiadas referencias de `profile.isPremium` a `user.isPremium` 
- ✅ Actualizado método `findNearby()` para JOIN con users

#### 4. Migración de Base de Datos

**[02_move_profile_fields_to_users.sql](../../cuidamet-api/docker/mysql/init/02_move_profile_fields_to_users.sql)** - ✅ NUEVO
- Agrega campos a la tabla `users`
- Migra datos existentes desde `provider_profiles` a `users`
- Migra datos existentes desde `client_profiles` a `users`
- Elimina campos de las tablas de perfiles
- Crea índices para optimizar búsquedas

### Frontend (cuidamet)

#### 1. Servicios Modificados

**[profileService.ts](../../cuidamet/services/profileService.ts)**
- ✅ Expandido `userService.update()` para aceptar campos compartidos
- ✅ Modificado `clientProfileService.create()` para enviar campos a users
- ✅ Modificado `providerProfileService.create()` para enviar campos a users
- ✅ Modificado `clientProfileService.update()` para gestionar campos en users
- ✅ Modificado `providerProfileService.update()` para gestionar campos en users

#### 2. Tipos Actualizados

**[types/api.ts](../../cuidamet/types/api.ts)**
- ✅ Agregados comentarios explicativos en `ClientProfileCreateDto`
- ✅ Agregados comentarios explicativos en `ProviderProfileCreateDto`
- ℹ️ Los DTOs mantienen los campos para facilitar el desarrollo frontend
- ℹ️ El servicio se encarga de enviar cada campo al endpoint correcto

## 🗄️ Estructura de Base de Datos Resultante

### Tabla `users`
```sql
users:
  - id
  - username
  - email
  - password
  - first_name
  - last_name
  - is_active
  - email_verified
  - phone               ← NUEVO
  - photo_url           ← NUEVO
  - location            ← NUEVO
  - latitude            ← NUEVO
  - longitude           ← NUEVO
  - languages           ← NUEVO (TEXT - comma separated)
  - is_premium          ← NUEVO
  - created_at
  - updated_at
```

### Tabla `provider_profiles`
```sql
provider_profiles:
  - id
  - user_id
  - availability         (solo del perfil)
  - profile_status
  - provider_status
  - rating
  - reviews_count
  - completed_bookings
  - verifications
  - badges
  - created_at / updated_at / created_by / updated_by
```

### Tabla `client_profiles`
```sql
client_profiles:
  - id
  - user_id
  - preferences         (solo del perfil)
  - profile_status
  - created_at / updated_at / created_by / updated_by
```

## 🔄 Flujo de Datos Actualizado

### Creación/Actualización de Perfil

1. Frontend envía todos los datos al servicio `profileService`
2. `profileService` separa:
   - **Campos de user**: phone, photoUrl, location, latitude, longitude, languages, isPremium
   - **Campos de perfil**: preferences/availability, profileStatus, etc.
3. Actualiza primero `users` con campos compartidos
4. Crea/actualiza el perfil con campos específicos

### Lectura de Perfil

1. Backend hace JOIN entre profile y user
2. Devuelve entidad completa con relación `user` poblada
3. Frontend accede a campos desde `profile.user.phone`, `profile.user.location`, etc.

## ⚠️ Consideraciones Importantes

### Para el Equipo Backend

1. **Queries existentes**: Todas las queries que filtraban por location, languages, isPremium, latitude, longitude ahora deben hacer JOIN con la tabla users
2. **Validaciones**: Las validaciones de estos campos ahora están en los DTOs de users, no de perfiles
3. **Responses**: Al devolver perfiles, siempre incluir la relación `user` populada

### Para el Equipo Frontend

1. **Acceso a datos**: Los campos compartidos ahora vienen desde `profile.user.*`
2. **Componentes**: Los componentes que muestran estos datos deben acceder a la relación user
3. **Servicios**: `profileService.ts` se encarga automáticamente de enviar datos al endpoint correcto
4. **No se requieren cambios en componentes**: Los DTOs mantienen la misma estructura

## 🚀 Aplicar la Migración

### Paso 1: Backend

```bash
cd cuidamet-api

# Detener contenedores si están corriendo
docker-compose down

# Eliminar volúmenes de base de datos para aplicar migración
docker-compose down -v

# Levantar servicios (aplicará migration scripts)
docker-compose up -d

# Verificar logs
docker-compose logs -f mysql
```

### Paso 2: Verificar Cambios

```bash
# Verificar que la migración se aplicó
docker exec -it cuidamet-api-mysql-1 mysql -u root -p socgerfleet -e "
  DESCRIBE users;
  DESCRIBE provider_profiles;
  DESCRIBE client_profiles;
"
```

### Paso 3: Probar Endpoints

```bash
# Crear usuario con datos completos
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "test123",
    "phone": "+34612345678",
    "location": "Madrid",
    "languages": ["Español", "Inglés"]
  }'

# Crear perfil de proveedor (sin campos compartidos)
curl -X POST http://localhost:3000/v1/provider-profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": 1,
    "availability": ["Mañanas", "Tardes"],
    "profileStatus": "published"
  }'
```

## 📊 Beneficios de este Cambio

1. ✅ **Eliminación de duplicación**: Un usuario solo tiene una foto, un teléfono, una ubicación
2. ✅ **Consistencia de datos**: Los cambios en datos personales se reflejan en ambos perfiles
3. ✅ **Simplificación**: Menos campos para gestionar en los perfiles
4. ✅ **Escalabilidad**: Fácil agregar más perfiles sin duplicar campos comunes
5. ✅ **Mejor rendimiento**: Queries más eficientes con JOIN optimizado

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Datos no aparecen en perfiles

**Causa**: La relación `user` no está siendo incluida en la query

**Solución**: Verificar que se está usando `.leftJoinAndSelect('profile.user', 'user')`

### Problema 2: Error al crear perfil

**Causa**: Se están enviando campos que ya no existen en la tabla de perfiles

**Solución**: Verificar que el frontend está actualizado con la nueva versión de `profileService.ts`

### Problema 3: Filtros no funcionan

**Causa**: La query sigue buscando en `profile.location` en lugar de `user.location`

**Solución**: Revisar servicios del backend y cambiar referencias a `user.*`

## ✅ Checklist de Verificación

### Backend
- [ ] Migración SQL ejecutada correctamente
- [ ] Tablas tienen estructura correcta
- [ ] Endpoints de creación de usuarios aceptan nuevos campos
- [ ] Endpoints de perfiles NO aceptan campos movidos
- [ ] Queries incluyen JOIN con users
- [ ] Filtros funcionan correctamente

### Frontend
- [ ] `profileService.ts` actualizado
- [ ] Componentes acceden a `profile.user.*` para campos compartidos
- [ ] Creación de perfiles funciona correctamente
- [ ] Actualización de perfiles funciona correctamente
- [ ] Búsquedas y filtros funcionan correctamente

## 📝 Notas Finales

Este cambio es **breaking** para la base de datos existente. Los datos se migran automáticamente mediante el script SQL, pero es importante:

1. **Hacer backup** de la base de datos antes de aplicar
2. **Probar en entorno de desarrollo** antes de producción
3. **Verificar** que todos los endpoints funcionan después de la migración
4. **Actualizar documentación** si existe API docs externas

¿Necesitas ayuda con alguno de estos pasos? Déjame saber para darte más detalles.
