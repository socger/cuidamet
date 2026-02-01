# Configuración de Variables de Entorno - Cuidamet

**Fecha**: 1 de febrero de 2026  
**Componente**: Frontend - Sistema de Servicios  
**Archivos Modificados**: 
- `services/serviceConstants.ts`
- `.env`
- `.env.example`
- `.env.local`
- `.env.local.example`

---

## 📋 Resumen de Cambios

Se han convertido valores constantes hardcodeados en `serviceConstants.ts` a variables de entorno configurables, permitiendo mayor flexibilidad para adaptar la aplicación a diferentes regiones, mercados o requisitos de negocio sin modificar código.

---

## 🆕 Nuevas Variables de Entorno Creadas

### 1. **Valores Iniciales de Servicios**

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `VITE_DEFAULT_HOURLY_RATE` | number | 10 | Tarifa por hora inicial para nuevos proveedores |
| `VITE_DEFAULT_MAX_PETS` | number | 1 | Límite máximo de mascotas que un proveedor puede cuidar simultáneamente |

### 2. **Configuración Regional**

#### Idiomas Disponibles
```env
VITE_AVAILABLE_LANGUAGES=Español,Inglés,Francés,Alemán,Italiano,Portugués,Chino,Árabe
```
- **Tipo**: Array de strings (separados por coma)
- **Uso**: Lista de idiomas que los proveedores pueden indicar que hablan
- **Personalizable**: Sí - Agregar o quitar idiomas según la región

#### Tipos de Mascotas Aceptadas
```env
VITE_PET_TYPES=Perros,Gatos,Pequeños animales,Otros
```
- **Tipo**: Array de strings (separados por coma)
- **Uso**: Tipos de mascotas que los proveedores pueden indicar que cuidan
- **Personalizable**: Sí

#### Habilidades Médicas Especializadas
```env
VITE_MEDICAL_SKILLS=Alzheimer,Demencia Senil,Parkinson,Diabetes (Insulina),Movilidad Reducida (Grúa),Recuperación Ictus,Cuidados Paliativos,Post-operatorio,Sondaje / Curas,Diálisis,Ostomías
```
- **Tipo**: Array de strings (separados por coma)
- **Uso**: Habilidades médicas especializadas para cuidado de mayores
- **Personalizable**: Sí - Adaptar según regulaciones locales

#### Opciones de Disponibilidad
```env
VITE_STANDARD_AVAILABILITY=Mañanas,Tardes,Noches,Fines de Semana,Interno/a
```
- **Tipo**: Array de strings (separados por coma)
- **Uso**: Horarios estándar de disponibilidad
- **Personalizable**: Sí

#### Opciones de Unidades para Precios
```env
VITE_UNIT_OPTIONS=hora,servicio,noche,día,paseo,visita,mes
```
- **Tipo**: Array de strings (separados por coma)
- **Uso**: Unidades para especificar precios de servicios
- **Personalizable**: Sí

---

## 🔧 Cambios en `serviceConstants.ts`

### Nuevas Funciones Helper

#### 1. `getEnvArray()`
```typescript
const getEnvArray = (key: string, defaultValue: string[]): string[] => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  return value.split(',').map((item: string) => item.trim());
};
```
- **Propósito**: Parsear arrays desde variables de entorno
- **Formato**: Strings separados por comas
- **Fallback**: Devuelve el valor por defecto si la variable no existe

#### 2. `getEnvNumber()`
```typescript
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseFloat(value) : defaultValue;
};
```
- **Propósito**: Parsear números desde variables de entorno
- **Fallback**: Devuelve el valor por defecto si la variable no existe

### Constantes Modificadas

#### Antes:
```typescript
export const languagesList = [
  "Español", "Inglés", "Francés", "Alemán", 
  "Italiano", "Portugués", "Chino", "Árabe"
];
```

#### Después:
```typescript
export const languagesList = getEnvArray(
  'VITE_AVAILABLE_LANGUAGES',
  ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Árabe"]
);
```

Se aplicó el mismo patrón a:
- ✅ `languagesList`
- ✅ `MEDICAL_SKILLS`
- ✅ `PET_TYPES`
- ✅ `STANDARD_AVAILABILITY`
- ✅ `UNIT_OPTIONS`
- ✅ `initialServiceConfig.rates.hourly`
- ✅ `initialServiceConfig.petAttributes.maxPets`

---

## 📦 Valores Ya Existentes (No Modificados)

Las siguientes variables **YA estaban configuradas** en los archivos `.env`:

### Precios de Servicios por Categoría

#### Cuidado de Mayores
- `VITE_PRICE_ELDERLY_COMPANIONSHIP=13`
- `VITE_PRICE_ELDERLY_PERSONAL_CARE=16`
- `VITE_PRICE_ELDERLY_NIGHT_CARE=81`
- `VITE_PRICE_ELDERLY_MEDICAL_MANAGEMENT=21`
- `VITE_PRICE_ELDERLY_LIVE_IN=1201`

#### Cuidado de Niños
- `VITE_PRICE_CHILDREN_BABYSITTER=13`
- `VITE_PRICE_CHILDREN_SCHOOL_PICKUP=11`
- `VITE_PRICE_CHILDREN_HOMEWORK_HELP=16`
- `VITE_PRICE_CHILDREN_NIGHT_CARE=71`

#### Mascotas
- `VITE_PRICE_PETS_DOG_WALKING=11`
- `VITE_PRICE_PETS_ACCOMMODATION=26`
- `VITE_PRICE_PETS_HOME_VISIT=13`
- `VITE_PRICE_PETS_DAY_CARE=21`

#### Limpieza y Mantenimiento
- `VITE_PRICE_HOUSEKEEPING_GENERAL_CLEANING=13`
- `VITE_PRICE_HOUSEKEEPING_DEEP_CLEANING=51`
- `VITE_PRICE_HOUSEKEEPING_IRONING=13`
- `VITE_PRICE_HOUSEKEEPING_COOKING=16`

---

## 🚀 Cómo Usar

### 1. Desarrollo Local
```bash
# Edita .env.local con tus valores personalizados
nano .env.local

# Ejemplo: Agregar japonés a los idiomas
VITE_AVAILABLE_LANGUAGES=Español,Inglés,Francés,Alemán,Italiano,Portugués,Chino,Árabe,Japonés
```

### 2. Producción
```bash
# Configura las variables en tu plataforma de hosting
# Ejemplo: Vercel, Netlify, Docker, etc.

# O crea .env.production.local con los valores de producción
```

### 3. Testing de Cambios
```bash
# Reinicia el servidor de desarrollo para aplicar cambios
npm run dev
```

---

## ⚠️ Consideraciones Importantes

### 1. **Valores por Defecto Seguros**
- Todas las constantes tienen valores por defecto definidos en el código
- Si una variable de entorno no está configurada, se usa el valor por defecto
- La aplicación **nunca fallará** por falta de variables de entorno

### 2. **Formato de Arrays**
- Usar comas `,` como separador
- No usar comillas en los valores
- Espacios alrededor de las comas se eliminan automáticamente

**Correcto**: `valor1,valor2,valor3`  
**Incorrecto**: `"valor1", "valor2", "valor3"`

### 3. **Sincronización entre Archivos**
Al agregar nuevas variables, actualiza TODOS estos archivos:
- ✅ `.env` - Valores de desarrollo compartidos
- ✅ `.env.example` - Plantilla con valores de ejemplo
- ✅ `.env.local` - Valores locales personales (no se sube a git)
- ✅ `.env.local.example` - Plantilla para valores locales

### 4. **Prefijo VITE_**
- Todas las variables usadas en el frontend **DEBEN** empezar con `VITE_`
- Esto es un requisito de Vite para exponer variables al código del cliente
- Variables sin el prefijo `VITE_` no estarán disponibles en el navegador

---

## 🎯 Beneficios de Esta Implementación

### ✅ **Flexibilidad Regional**
- Adaptar idiomas, habilidades médicas y opciones según el país
- Ejemplo: España usa "Grúa", México podría usar "Montacargas"

### ✅ **Precios Dinámicos**
- Ajustar precios sin desplegar nuevo código
- A/B testing de diferentes estrategias de pricing

### ✅ **Multi-tenant**
- Diferentes configuraciones por cliente/marca
- Usar el mismo código base con diferentes valores

### ✅ **Mantenibilidad**
- Centralizar configuración en archivos `.env`
- Evitar hardcoding de valores de negocio

### ✅ **Testing**
- Configurar valores diferentes para testing
- Usar valores mock sin modificar código

---

## 🔄 Futuras Mejoras Sugeridas

### 1. **Panel de Administración**
Crear UI para editar estas configuraciones sin acceso a archivos `.env`:
- Dashboard admin para ajustar precios
- Configuración de idiomas y opciones por región
- Histórico de cambios de configuración

### 2. **Validación de Variables**
Agregar validaciones en tiempo de compilación:
```typescript
// Ejemplo: Validar que todos los precios sean números positivos
const validateEnvPrices = () => {
  const prices = [
    'VITE_PRICE_ELDERLY_COMPANIONSHIP',
    // ... más precios
  ];
  
  prices.forEach(key => {
    const value = getEnvNumber(key, 0);
    if (value <= 0) {
      console.warn(`⚠️ ${key} tiene un valor inválido: ${value}`);
    }
  });
};
```

### 3. **Internacionalización (i18n)**
Integrar con sistema i18n para:
- Traducciones automáticas de opciones
- Detección de idioma del navegador
- Múltiples archivos de configuración por idioma

### 4. **Base de Datos de Configuración**
Migrar configuración a base de datos para:
- Cambios en tiempo real sin restart
- Versionado de configuraciones
- Rollback de cambios

---

## 📚 Referencias

- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **TypeScript Configuration**: https://www.typescriptlang.org/docs/handbook/enums.html
- **Best Practices**: Seguir convenciones de AGENTS.md en repositorio

---

## 🤝 Contribuir

Al agregar nuevas constantes configurables:

1. **Identificar constantes hardcodeadas** en el código
2. **Crear variables en .env** con prefijo `VITE_`
3. **Actualizar TODOS los archivos** (.env, .env.example, .env.local, .env.local.example)
4. **Modificar código** para usar helpers `getEnvArray()` o `getEnvNumber()`
5. **Documentar** en este archivo
6. **Probar** que los valores por defecto funcionan correctamente

---

**Última actualización**: 1 de febrero de 2026  
**Autor**: Sistema de Configuración Cuidamet  
**Versión**: 1.0.0
