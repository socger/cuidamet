# Cuidamet Agent Rules

This document outlines the rules and conventions to follow when developing the Cuidamet application.

## 1. Code Style and Formatting

*   **Follow existing conventions**: Before writing any code, analyze the existing codebase to understand and adopt its style.
*   **TypeScript**: Use TypeScript for all new code.
*   **ESLint and Prettier**: Use ESLint and Prettier to maintain a consistent code style. Run `npm run lint` and `npm run format` before committing your changes.
*   **Naming conventions**:
    *   Components: Use PascalCase (e.g., `MyComponent`).
    *   Variables and functions: Use camelCase (e.g., `myVariable`, `myFunction`).
    *   Types and interfaces: Use PascalCase (e.g., `MyType`, `MyInterface`).
*   **File structure**:
    *   Create a new file for each component.
    *   Group related components in a subdirectory.
    *   Keep icons in the `components/icons` directory.

## 2. Component Development

*   **Functional components**: Use functional components with hooks instead of class-based components.
*   **Props**: Use interfaces to define the props of each component.
*   **State management**: For simple component state, use the `useState` hook. For more complex global state, consider using a state management library like Redux or Zustand, but only after verifying its established usage within the project.
*   **Styling**: Use Tailwind CSS for styling. Avoid using inline styles or CSS files.

## 3. Data Management

### 3.1. Organización de Tipos (TypeScript)

**Estructura `types/` (Obligatoria desde 01/02/2026)**

Los tipos de TypeScript están organizados por dominio en archivos separados dentro de la carpeta `types/`:

```
types/
  ├── index.ts              ← Re-exporta todos los tipos (usar este import)
  ├── common.ts             ← Enums y tipos globales (CareCategory, ProviderStatus, etc.)
  ├── profiles.ts           ← Tipos de perfiles (Provider, ProviderProfile, ClientProfile, Review)
  ├── services.ts           ← Servicios y configuración (ServiceConfig, ServiceVariation, Certificate)
  ├── auth.ts               ← Autenticación y roles (UserRole, AuthMode, RegisterData, LoginData, etc.)
  ├── api.ts                ← DTOs para comunicación con API (ClientProfileCreateDto, ProviderProfileCreateDto, etc.)
  ├── booking.ts            ← Reservas (BookingDetails, Booking, BookingPermissions)
  ├── chat.ts               ← Mensajería (Message, ChatConversation)
  └── legal.ts              ← Documentos legales (LegalDocument)
```

**Reglas de uso:**

1. **Para importar tipos**: Usa SIEMPRE `import { ... } from "../types"` (desde `types/index.ts`)
   ```typescript
   // ✅ CORRECTO
   import { CareCategory, ProviderProfile, ServiceConfig } from "../types";
   
   // ❌ INCORRECTO - No importar archivos específicos directamente
   import { CareCategory } from "../types/common";
   ```

2. **Para crear nuevos tipos**:
   - Analiza el dominio del nuevo tipo (perfil, servicio, autenticación, etc.)
   - Añade el tipo en el archivo correspondiente dentro de `types/`
   - Si no existe un archivo apropiado, crea uno nuevo y añádelo a `types/index.ts`
   - Asegúrate de exportar el nuevo tipo desde `types/index.ts`

3. **Nomenclatura**:
   - Interfaces: PascalCase (e.g., `ProviderProfile`, `ServiceConfig`)
   - Types: PascalCase (e.g., `UserRole`, `AuthMode`)
   - Enums: PascalCase (e.g., `CareCategory`)

**Ejemplo de creación de nuevo tipo:**

```typescript
// types/profiles.ts - Añadir nuevo tipo
export interface ProviderStats {
  totalBookings: number;
  averageRating: number;
  responseTime: number;
}

// types/index.ts - Verificar que esté re-exportado
export * from './profiles'; // Ya está, no requiere cambios
```

### 3.2. Carpeta `services/` vs `utils/`

**`services/` - Lógica de negocio y datos**

Usa `services/` para:
- ✅ Servicios que interactúan con APIs o backend (`authService.ts`, `profileService.ts`)
- ✅ Datos mock/simulados (`mockData.ts`, `mockChatData.ts`)
- ✅ Constantes de dominio específicas del negocio (`serviceConstants.ts`)
- ✅ Configuración de servicios de terceros

**Estructura actual de `services/`:**
```
services/
  ├── authService.ts          ← Autenticación y gestión de tokens
  ├── profileService.ts       ← CRUD de perfiles (cliente y proveedor)
  ├── bookingService.ts       ← Gestión de reservas
  ├── serviceConstants.ts     ← Constantes de categorías y precios de servicios
  ├── mockData.ts             ← Datos mock de proveedores
  └── mockChatData.ts         ← Datos mock de conversaciones
```

**`utils/` - Utilidades genéricas y helpers**

Usa `utils/` para:
- ✅ Funciones de formateo (fechas, moneda, texto)
- ✅ Validadores genéricos (email, teléfono, códigos postales)
- ✅ Helpers matemáticos o de cálculo
- ✅ Funciones de transformación de datos genéricas
- ✅ Helpers de navegación o enrutamiento

**Ejemplo de clasificación:**

```typescript
// ✅ services/priceCalculator.ts
// Lógica de negocio específica de cálculo de precios de servicios
export const calculateServicePrice = (hours: number, rate: number, category: CareCategory) => {
  // Reglas de negocio específicas de Cuidamet
  const surcharge = category === CareCategory.ELDERLY ? 1.2 : 1.0;
  return hours * rate * surcharge;
};

// ✅ utils/formatters.ts
// Utilidad genérica de formateo
export const formatCurrency = (amount: number, locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(amount);
};
```

**Cuándo crear un nuevo archivo en `services/`:**
1. Necesitas interactuar con una API externa
2. Gestiona datos específicos del dominio (usuarios, perfiles, reservas)
3. Contiene constantes de configuración del negocio
4. Implementa lógica de negocio compleja

**Cuándo crear un nuevo archivo en `utils/`:**
1. Es una función helper reutilizable en múltiples contextos
2. No depende de la lógica de negocio de Cuidamet
3. Podría extraerse a una librería npm genérica
4. Funciones puras sin efectos secundarios

### 3.3. Mock Data y Desarrollo

*   **Mock data**: Use the `services/mockData.ts` and `services/mockChatData.ts` files to provide data during development.
*   **API integration**: When integrating with a real API, create a new service in the `services` directory to handle the API calls.

## 4. Version Control

*   **Git**: Use Git for version control.
*   **Commit messages**: Write clear and descriptive commit messages.
*   **Branches**: Create a new branch for each new feature or bug fix.

## 5. Testing

*   **Unit tests**: Write unit tests for all new components and functions.
*   **Testing library**: Use a testing library like Jest and React Testing Library.

By following these rules, we can ensure that the Cuidamet application is developed in a consistent, maintainable, and scalable way.

## 6. Responder en idioma español
Siempre que me respondas a alguna pregunta o me ayudes dándome información, hazlo en español