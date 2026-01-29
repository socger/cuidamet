# 019-2 - Corrección de carga de perfiles en switchActiveRole

**Fecha**: 29/01/2026  
**Autor**: AI Assistant  
**Relacionado con**: 019-1 - Implementación de cambio de perfiles

## 📝 Problema Identificado

El endpoint `PATCH /users/:userId/active-role` guardaba correctamente el rol en la base de datos, pero NO cargaba el perfil correspondiente cuando el usuario cambiaba de rol.

### Síntomas
- ✅ El rol se actualizaba correctamente en la tabla `user_roles`
- ✅ Se eliminaba el rol anterior y se guardaba solo el nuevo
- ❌ El perfil NO se cargaba/renderizaba en el frontend
- ❌ La respuesta del backend no incluía los datos completos del perfil

## 🔍 Análisis del Problema

### Causa Raíz
El método `switchActiveRole` en `UsersService` tenía dos problemas principales:

1. **Where clause incorrecto**: Intentaba buscar perfiles usando `where: { user: { id: userId } }` cuando debía usar `where: { userId }`

2. **Falta de repositorios**: No tenía acceso directo a los repositorios de `ClientProfile` y `ProviderProfile`, por lo que no podía cargar los perfiles con sus relaciones correctamente

### Código Problemático Anterior
```typescript
// ❌ INCORRECTO - Usaba QueryBuilder sobre user en vez de acceso directo a profile
if (roleName === 'client' && user.clientProfile) {
  profile = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.clientProfile', 'clientProfile')
    .where('user.id = :userId', { userId })
    .getOne()
    .then((u) => u?.clientProfile || null);
}
```

## 🛠️ Solución Implementada

### 1. Actualizar `users.module.ts`

Agregamos las entidades `ClientProfile` y `ProviderProfile` al módulo para poder inyectar sus repositorios:

```typescript
import { ClientProfile } from '../entities/client-profile.entity';
import { ProviderProfile } from '../entities/provider-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Role,
    ClientProfile,        // ← NUEVO
    ProviderProfile      // ← NUEVO
  ])],
  // ...
})
export class UsersModule {}
```

### 2. Actualizar `users.service.ts`

#### a) Imports
```typescript
import { ClientProfile } from '../entities/client-profile.entity';
import { ProviderProfile } from '../entities/provider-profile.entity';
```

#### b) Inyección de repositorios en el constructor
```typescript
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>,
  @InjectRepository(ClientProfile)                        // ← NUEVO
  private readonly clientProfileRepository: Repository<ClientProfile>,
  @InjectRepository(ProviderProfile)                      // ← NUEVO
  private readonly providerProfileRepository: Repository<ProviderProfile>,
) {}
```

#### c) Método `switchActiveRole` corregido
```typescript
async switchActiveRole(
  userId: number,
  roleName: 'client' | 'provider',
): Promise<{
  activeRole: string;
  profile: any | null;
  profileType: 'client' | 'provider' | 'none';
}> {
  // 1-4. Lógica de cambio de rol (sin cambios)
  // ...

  // 5. Cargar el perfil correspondiente con TODAS sus relaciones ← CORREGIDO
  let profile = null;
  let profileType: 'client' | 'provider' | 'none' = 'none';

  if (roleName === 'client') {
    // ✅ CORRECTO - Buscar directamente en clientProfileRepository
    profile = await this.clientProfileRepository.findOne({
      where: { userId },         // ← Clave: userId directo, no nested
      relations: ['user'],       // ← Cargar relación user completa
    });

    profileType = profile ? 'client' : 'none';
    console.log(
      `📦 Perfil familiar cargado:`,
      profile ? `ID=${profile.id}` : 'NO existe',
    );
  } else if (roleName === 'provider') {
    // ✅ CORRECTO - Buscar directamente en providerProfileRepository
    // ⭐ IMPORTANTE: Carga relaciones anidadas de servicios
    profile = await this.providerProfileRepository.findOne({
      where: { userId },         // ← Clave: userId directo, no nested
      relations: [
        'user',                  // ← Cargar relación user completa
        'services',              // ← Cargar ServiceConfigs del proveedor
        'services.variations',   // ← Cargar ServiceVariations de cada servicio
        'services.certificates', // ← Cargar Certificates de cada servicio
      ],
    });

    profileType = profile ? 'provider' : 'none';
    console.log(
      `📦 Perfil profesional cargado:`,
      profile ? `ID=${profile.id}` : 'NO existe',
      profile?.services ? `con ${profile.services.length} servicios` : '',
    );
  }

  if (!profile) {
    console.log(
      `⚠️ Usuario ${userId} no tiene perfil "${roleName}" - debe crearlo`,
    );
  }

  return {
    activeRole: roleName,
    profile,
    profileType,
  };
}
```

## 📊 Comparación Antes/Después

### ANTES ❌
```typescript
// Problema 1: Where clause incorrecto
where: { user: { id: userId } }  // No funciona para buscar por userId

// Problema 2: QueryBuilder complejo e innecesario
profile = await this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.clientProfile', 'clientProfile')
  .where('user.id = :userId', { userId })
  .getOne()
  .then((u) => u?.clientProfile || null);
// No carga la relación 'user' dentro del perfil
```

### DESPUÉS ✅
```typescript
// Solución 1: Where clause correcto
where: { userId }  // Busca directamente por la columna userId

// Solución 2: Acceso directo al repositorio del perfil
profile = await this.clientProfileRepository.findOne({
  where: { userId },
  relations: ['user'],  // Carga completa la relación user
});
// Devuelve el perfil con user.firstName, user.lastName, user.email, etc.
```

## 🧪 Cómo Probar

### 1. Verificar datos existentes
```sql
-- Ver usuarios con sus roles y perfiles
SELECT 
  u.id, u.username, u.email,
  r.name AS current_role,
  cp.id AS client_profile_id,
  pp.id AS provider_profile_id
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN provider_profiles pp ON u.id = pp.user_id
WHERE u.id IN (33, 34);
```

### 2. Iniciar el servidor
```bash
cd /home/socger/trabajo/socger/cuidamet-api
npm run start:dev
```

### 3. Autenticarse
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yoline@yoline.com",
    "password": "123456"
  }'
# Guardar el accessToken de la respuesta
```

### 4. Cambiar a perfil familiar
```bash
curl -X PATCH http://localhost:3000/api/v1/users/34/active-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d '{"roleName": "client"}'
```

**Respuesta esperada para perfil profesional:**
```json
{
  "message": "Rol activo actualizado exitosamente",
  "data": {
    "activeRole": "provider",
    "profileType": "provider",
    "profile": {
      "id": 6,
      "userId": 34,
      "phone": "666777888",
      "photoUrl": "https://example.com/photo.jpg",
      "location": "Madrid, España",
      "latitude": "40.4168",
      "longitude": "-3.7038",
      "languages": ["Spanish", "English"],
      "availability": ["Mañanas", "Tardes"],
      "profileStatus": "published",
      "isPremium": false,
      "rating": 4.5,
      "reviewsCount": 10,
      "user": {
        "id": 34,
        "username": "yoline",
        "email": "yoline@yoline.com",
        "firstName": "Yoline",
        "lastName": "García"
      },
      "services": [                  // ← NUEVO: Array de ServiceConfigs
        {
          "id": 1,
          "category": "elderly_care",
          "hourlyRate": 15.00,
          "dailyRate": 100.00,
          "experience": "5 años de experiencia",
          "completed": true,
          "tasks": ["Compañía", "Asistencia médica"],
          "variations": [            // ← NUEVO: Array de ServiceVariations
            {
              "id": 1,
              "name": "Cuidado nocturno",
              "description": "Servicio durante la noche",
              "additionalRate": 5.00
            }
          ],
          "certificates": [          // ← NUEVO: Array de Certificates
            {
              "id": 1,
              "name": "Primeros Auxilios",
              "issuedBy": "Cruz Roja",
              "issuedDate": "2023-01-15",
              "expirationDate": "2026-01-15",
              "isVerified": true
            }
          ]
        }
      ]
    }
  }
}
```

**Respuesta esperada para perfil familiar:**
```json
{
  "message": "Rol activo actualizado exitosamente",
  "data": {
    "activeRole": "client",
    "profileType": "client",
    "profile": {
      "id": 14,
      "userId": 34,
      "phone": "666777888",
      "photoUrl": "https://example.com/photo.jpg",
      "location": "Madrid, España",
      "latitude": "40.4168",
      "longitude": "-3.7038",
      "languages": ["Spanish", "English"],
      "preferences": ["elderly_care"],
      "createdAt": "2026-01-28T...",
      "updatedAt": "2026-01-28T...",
      "user": {                           // ← IMPORTANTE: Objeto user completo
        "id": 34,
        "username": "yoline",
        "email": "yoline@yoline.com",
        "firstName": "Yoline",
        "lastName": "García"
      }
    }
  }
}
```

### 5. Cambiar a perfil profesional
```bash
curl -X PATCH http://localhost:3000/api/v1/users/34/active-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -d '{"roleName": "provider"}'
```

### 6. Verificar logs del servidor
Deberías ver logs como:
```
🗑️ Roles eliminados para usuario 34. Asignando nuevo rol: "provider"
✅ Usuario 34 ahora tiene SOLO el rol "provider"
📦 Perfil profesional cargado: ID=6
```

## ✅ Resultado Final

### Verificación en Base de Datos
```sql
-- Solo debe haber UN rol por usuario
SELECT user_id, role_id, r.name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE user_id = 34;
-- Resultado: 1 fila con el último rol asignado
```

### Verificación en Frontend
1. El usuario cambia de perfil profesional a familiar
2. El backend devuelve el `ClientProfile` completo con el objeto `user`
3. El frontend mapea los datos correctamente:
   - `firstName`, `lastName`, `email` desde `profile.user`
   - `phone`, `location`, `languages` desde `profile`
4. La UI renderiza el perfil familiar completo

## 📚 Archivos Modificados

1. ✅ [`users.module.ts`](../../src/users/users.module.ts) - Agregados ClientProfile y ProviderProfile
2. ✅ [`users.service.ts`](../../src/users/users.service.ts) - Imports, constructor y método switchActiveRole
3. ✅ Frontend ya estaba preparado (no requiere cambios)

## 🎯 Próximos Pasos

1. **Probar en desarrollo** con usuarios reales
2. **Verificar en frontend** que los perfiles se renderizan correctamente
3. **Documentar en Swagger** las respuestas del endpoint
4. **Agregar tests unitarios** para el método switchActiveRole

## � Actualización: Carga de Servicios y Variaciones

**Problema adicional detectado**: Cuando el usuario cambiaba a perfil profesional, el perfil se cargaba pero **NO incluía los servicios (ServiceConfig) ni sus variaciones (ServiceVariation)**.

**Solución implementada**: Agregadas relaciones anidadas en la carga del `ProviderProfile`:

```typescript
relations: [
  'user',                  // Usuario base
  'services',              // ✅ ServiceConfigs del proveedor
  'services.variations',   // ✅ Variaciones de cada servicio
  'services.certificates', // ✅ Certificados de cada servicio
]
```

**Beneficio**: Ahora el frontend recibe TODO el perfil profesional de una sola vez, sin necesidad de hacer llamadas adicionales a `/service-configs/provider/:providerId`.

**Nota**: Para el `ClientProfile` no es necesario cargar relaciones adicionales ya que solo tiene la relación `user`.

## 🔗 Referencias

- [019-1 - Implementación inicial](./019-1%20-%20Implementaci%C3%B3n%20de%20cambio%20de%20perfiles.md)
- [TypeORM FindOptions](https://typeorm.io/find-options)
- [TypeORM Relations](https://typeorm.io/relations)
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
