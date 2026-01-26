# Eliminación de creación automática de perfil básico

**Fecha**: 26 de enero de 2026  
**Objetivo**: Eliminar la creación automática del perfil básico en `client_profiles` después del registro y hacer que los perfiles se creen solo cuando el usuario complete el formulario correspondiente.

## Cambios Realizados

### 1. Backend (cuidamet-api)

#### Archivo: `src/auth/auth.service.ts`

**Cambio**: Eliminado el código que creaba automáticamente un perfil de cliente después del registro.

**Antes** (líneas 220-237):
```typescript
// Crear perfil básico automáticamente con los datos del usuario
try {
  // Por defecto, crear un perfil de cliente (familiar)
  // El usuario puede crear un perfil de proveedor más tarde si lo desea
  await this.clientProfilesService.create({
    userId: userWithRoles.id,
    location: 'Por configurar',
    profileStatus: 'draft',
  }, userWithRoles.id);

  this.logger.log(`Perfil de cliente creado automáticamente para usuario ${userWithRoles.id}`);
} catch (error) {
  this.logger.warn(`Error al crear perfil automático: ${error.message}`);
}
```

**Después**:
```typescript
// NO crear perfil automáticamente - el usuario lo creará desde el frontend
// al completar el formulario de perfil familiar o profesional
```

**Impacto**: Ahora el registro solo crea el usuario en la tabla `users`, sin crear ningún perfil automáticamente.

---

### 2. Frontend (cuidamet)

#### Archivo: `App.tsx`

##### Cambio 1: Importar `providerProfileService`
```typescript
import { clientProfileService, providerProfileService } from "./services/profileService";
```

##### Cambio 2: Modificar `handleSignupSuccess`

**Antes** (líneas 496-506):
```typescript
// Obtener el perfil de cliente creado automáticamente
const profile = await clientProfileService.getByUserId(user.id);
setClientProfile(profile);
if (profile.phone) setUserPhone(profile.phone);
```

**Después**:
```typescript
// Obtener los datos del usuario registrado (firstName, lastName) del token
try {
  const user = tokenStorage.getUser();
  if (user) {
    // Guardar firstName y lastName del usuario para pre-rellenar formularios
    setUserFirstName(user.firstName || '');
    setUserLastName(user.lastName || '');
  }
} catch (error) {
  console.error('Error al obtener datos del usuario:', error);
  // No bloquear el flujo si falla
}
```

**Impacto**: Ya no intenta cargar un perfil automático, solo guarda los datos del usuario para pre-rellenar los formularios.

##### Cambio 3: Modificar handler `onComplete` de FamiliarRegistration

**Antes**:
```typescript
onComplete={(profileData) => {
  setClientProfile(profileData);
  setActiveRole('client');
  
  // Show success alert
  setAlertModal({ 
    isOpen: true, 
    message: '¡Tu perfil familiar se ha creado exitosamente!', 
    title: 'Perfil publicado'
  });
  
  setTimeout(() => {
    setView("myProfile");
  }, 2000);
}}
```

**Después**:
```typescript
onComplete={async (profileData) => {
  try {
    const user = tokenStorage.getUser();
    if (!user || !user.id) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    // Preparar datos para la API
    const createClientDto = {
      userId: user.id,
      phone: profileData.phone,
      photoUrl: profileData.photoUrl,
      location: profileData.location,
      latitude: profileData.coordinates?.latitude,
      longitude: profileData.coordinates?.longitude,
      languages: profileData.languages,
      preferences: profileData.preferences,
      profileStatus: 'published',
    };

    // Guardar el perfil en la base de datos
    await clientProfileService.create(createClientDto);
    
    // Actualizar el estado local
    setClientProfile(profileData);
    setActiveRole('client');
    
    // Show success alert
    setAlertModal({ 
      isOpen: true, 
      message: '¡Tu perfil familiar se ha creado exitosamente!', 
      title: 'Perfil publicado'
    });
    
    setTimeout(() => {
      setView("myProfile");
    }, 2000);
  } catch (error: any) {
    console.error('Error al guardar perfil de cliente:', error);
    setAlertModal({ 
      isOpen: true, 
      message: error.message || 'Error al guardar el perfil.', 
      title: 'Error' 
    });
  }
}}
```

**Impacto**: Ahora guarda el perfil de cliente en la base de datos usando el endpoint `POST /client-profiles` cuando el usuario completa el formulario.

##### Cambio 4: Modificar `handleProviderRegistrationComplete`

**Antes**:
```typescript
const handleProviderRegistrationComplete = (data: ProviderProfile) => {
  setProviderProfile(data);
  setActiveRole('provider');
  setIsAuthenticated(true);
  
  // ... código de procesamiento de servicios ...
  
  setAlertModal({ 
    isOpen: true, 
    message: '¡Tu perfil de cuidador se ha creado exitosamente!', 
    title: 'Perfil publicado' 
  });
  
  setTimeout(() => {
    setView("myProfile");
  }, 2000);
};
```

**Después**:
```typescript
const handleProviderRegistrationComplete = async (data: ProviderProfile) => {
  try {
    const user = tokenStorage.getUser();
    if (!user || !user.id) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    // Preparar datos para la API
    const createProviderDto = {
      userId: user.id,
      phone: data.phone,
      photoUrl: data.photoUrl,
      location: data.location,
      latitude: data.coordinates?.latitude,
      longitude: data.coordinates?.longitude,
      languages: data.languages,
      availability: data.availability,
      profileStatus: 'published',
    };

    // Guardar el perfil en la base de datos
    await providerProfileService.create(createProviderDto);
    
    // Actualizar el estado local
    setProviderProfile(data);
    setActiveRole('provider');
    setIsAuthenticated(true);
    
    setAlertModal({ 
      isOpen: true, 
      message: '¡Tu perfil de cuidador se ha creado exitosamente!', 
      title: 'Perfil publicado' 
    });
    
    setTimeout(() => {
      setView("myProfile");
    }, 2000);
  } catch (error: any) {
    console.error('Error al guardar perfil de proveedor:', error);
    setAlertModal({ 
      isOpen: true, 
      message: error.message || 'Error al guardar el perfil.', 
      title: 'Error' 
    });
  }
};
```

**Impacto**: Ahora guarda el perfil de proveedor en la base de datos usando el endpoint `POST /provider-profiles` cuando el usuario completa el formulario.

#### Archivo: `types.ts`

##### Cambio: Agregar campo `coordinates` opcional

**ProviderProfile**:
```typescript
export interface ProviderProfile {
    name: string;
    email: string;
    phone: string;
    photoUrl: string;
    location: string;
    coordinates?: { latitude: number; longitude: number }; // ← NUEVO
    languages: string[];
    availability: string[];
    services: Record<CareCategory, ServiceConfig>;
}
```

**ClientProfile**:
```typescript
export interface ClientProfile {
    name: string;
    email: string;
    photoUrl: string;
    phone: string;
    location: string;
    coordinates?: { latitude: number; longitude: number }; // ← NUEVO
    languages: string[];
    preferences: CareCategory[];
}
```

**Impacto**: Permite almacenar las coordenadas de geolocalización en los perfiles para enviarlas a la API.

---

## Flujo Completo Después de los Cambios

### 1. Registro de Usuario
1. Usuario completa el formulario de registro (username, email, password, firstName, lastName)
2. Se llama a `POST /auth/register`
3. Backend crea el usuario en la tabla `users` con rol 'user'
4. Backend **NO** crea ningún perfil automáticamente
5. Frontend recibe el token JWT y los datos del usuario
6. Frontend guarda firstName, lastName, email en el estado local

### 2. Creación de Perfil Familiar
1. Usuario es redirigido a `FamiliarRegistration`
2. El formulario se pre-rellena con firstName, lastName, email del registro
3. Usuario completa los campos adicionales (teléfono, ubicación, idiomas, preferencias)
4. Al hacer clic en "Finalizar":
   - Se llama a `POST /client-profiles` con todos los datos
   - Backend crea el registro en la tabla `client_profiles`
   - Frontend muestra mensaje de éxito y redirige a "Mi Perfil"

### 3. Creación de Perfil Profesional
1. Usuario es redirigido a `ProfesionalRegistration`
2. El formulario se pre-rellena con firstName, lastName, email del registro
3. Usuario completa los campos adicionales (teléfono, ubicación, idiomas, servicios, etc.)
4. Al hacer clic en "Finalizar":
   - Se llama a `POST /provider-profiles` con todos los datos
   - Backend crea el registro en la tabla `provider_profiles`
   - Frontend muestra mensaje de éxito y redirige a "Mi Perfil"

---

## Ventajas del Nuevo Flujo

1. **✅ Sin perfiles huérfanos**: Ya no se crean perfiles básicos que el usuario nunca completa
2. **✅ Datos completos**: Los perfiles solo se crean cuando el usuario proporciona toda la información necesaria
3. **✅ Mejor UX**: Los datos del registro se pre-rellenan automáticamente en los formularios
4. **✅ Estado consistente**: El perfil en BD siempre coincide con el perfil completado por el usuario
5. **✅ Manejo de errores**: Si falla la creación del perfil, se muestra un error claro al usuario

---

## Puntos de Atención

### ⚠️ Coordinación Backend-Frontend
- Los campos `firstName` y `lastName` se guardan en la tabla `users`, **NO** en `client_profiles` o `provider_profiles`
- La API espera `userId`, `location`, `phone`, etc. en los DTOs de creación
- El campo `name` que usa el frontend se construye como `${firstName} ${lastName}` pero **NO** se envía a la API

### ⚠️ Servicios y Configuraciones
- El perfil de proveedor básico se crea con los campos principales
- Los servicios detallados (service-configs, service-variations) se pueden agregar en una implementación futura usando sus propios endpoints

### ⚠️ Estados del Perfil
- Los perfiles se crean con `profileStatus: 'published'` para que sean visibles inmediatamente
- Esto se puede cambiar a `'draft'` si se prefiere que el administrador los apruebe primero

---

## Archivos Modificados

### Backend
- ✅ [src/auth/auth.service.ts](../../cuidamet-api/src/auth/auth.service.ts)

### Frontend
- ✅ [App.tsx](../../App.tsx)
- ✅ [types.ts](../../types.ts)

---

## Testing Recomendado

1. **Registro de nuevo usuario**:
   - Verificar que se crea el usuario en `users`
   - Verificar que **NO** se crea ningún perfil en `client_profiles`

2. **Creación de perfil familiar**:
   - Verificar que los campos firstName, lastName, email se pre-rellenan
   - Completar el formulario y verificar que se crea el registro en `client_profiles`
   - Verificar que el perfil incluye todos los campos (phone, location, languages, preferences)

3. **Creación de perfil profesional**:
   - Verificar que los campos firstName, lastName, email se pre-rellenan
   - Completar el formulario y verificar que se crea el registro en `provider_profiles`
   - Verificar que el perfil incluye todos los campos (phone, location, languages, availability)

4. **Manejo de errores**:
   - Intentar crear un perfil sin conexión a internet
   - Verificar que se muestra un mensaje de error claro
   - Verificar que el usuario puede reintentar la creación

---

## Próximos Pasos Sugeridos

1. **Eliminar el campo `name`** de las tablas `client_profiles` y `provider_profiles` en la base de datos
2. **Actualizar los DTOs** de la API para remover el campo `name` si ya no se usa
3. **Implementar guardado de servicios detallados** para el perfil de proveedor (service-configs, service-variations)
4. **Agregar validación de perfiles duplicados** para evitar que un usuario cree múltiples perfiles del mismo tipo
5. **Implementar edición de perfiles** usando los endpoints PATCH correspondientes

---

**Cambios implementados exitosamente** ✅
