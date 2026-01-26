<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Cuidamet - Plataforma de Servicios de Cuidado

Aplicación frontend desarrollada en React + TypeScript + Vite para conectar familias con cuidadores profesionales.

## 🚀 Estado del Proyecto

**Fase 1 Completada:** Sistema de registro y autenticación integrado con backend ✅

Ver "resources/docs/IA chats/012 - Integrating User Registration with API Endpoints/012-1 - INTEGRATION-PHASE-1-REPORT.md" para detalles completos de la integración.

## 📋 Prerequisitos

- **Node.js** 18+ (recomendado: 22.21.1 con Volta)
- **npm** o **pnpm**
- **Backend API** corriendo (cuidamet-api) en `http://localhost:3000`

## 🔧 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd cuidamet
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o si usas pnpm
   pnpm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tu configuración:
   ```bash
   VITE_API_URL=http://localhost:3000
   VITE_API_VERSION=v1
   MAX_AUTH_ATTEMPTS=3
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 🗄️ Backend Requerido

Esta aplicación requiere que el backend (cuidamet-api) esté corriendo:

```bash
cd ../cuidamet-api
docker-compose up -d  # Iniciar base de datos
npm run start:dev     # Iniciar API
```

El backend debe estar disponible en `http://localhost:3000`

## ✨ Funcionalidades Implementadas

### ✅ Autenticación y Registro
- [x] Registro de nuevos usuarios (familiar/profesional)
- [x] Inicio de sesión con email y contraseña
- [x] Persistencia de sesión con JWT tokens
- [x] Renovación automática de tokens
- [x] Cierre de sesión individual
- [x] Solicitud de recuperación de contraseña

### ✅ Gestión de Perfiles
- [x] Creación automática de perfil según rol
- [x] Visualización de perfil de usuario
- [x] Cambio entre perfil familiar y profesional

### ⏳ En Desarrollo
- [ ] Verificación de email
- [ ] Reseteo completo de contraseña
- [ ] Listado de proveedores desde backend
- [ ] Sistema de mensajería persistente
- [ ] Sistema de reservas con backend

## 📁 Estructura del Proyecto

```
cuidamet/
├── components/          # Componentes React
│   ├── AuthPage.tsx    # Página de autenticación ✨
│   ├── profiles/       # Componentes de perfiles
│   ├── booking/        # Sistema de reservas
│   └── ...
├── services/           # Servicios de API
│   ├── authService.ts     # ✨ Nuevo: Autenticación
│   ├── profileService.ts  # ✨ Nuevo: Perfiles
│   ├── mockData.ts        # Datos de prueba
│   └── ...
├── types.ts            # Definiciones de TypeScript
├── App.tsx             # Componente principal
└── .env                # Variables de entorno
```

## 🔐 Seguridad

- **Tokens JWT**: Access tokens (15 min) y refresh tokens (7 días)
- **Renovación automática**: Los tokens se renuevan automáticamente antes de expirar
- **Almacenamiento seguro**: Tokens en localStorage (considerar httpOnly cookies para producción)
- **CORS configurado**: En el backend para permitir requests desde el frontend

## 🧪 Testing

### Probar Registro
1. Ir a `http://localhost:5173`
2. Clic en "Crear perfil"
3. Seleccionar rol (Familiar o Profesional)
4. Completar formulario de registro
5. Verificar creación exitosa

### Probar Login
1. Usar credenciales de un usuario registrado
2. Verificar que se guardan los tokens
3. Recargar la página
4. Verificar que la sesión persiste

## 📚 Documentación

- "resources/docs/IA chats/012 - Integrating User Registration with API Endpoints/012-1 - INTEGRATION-PHASE-1-REPORT.md" - Reporte detallado de la integración
- [AGENTS.md](AGENTS.md) - Reglas para desarrollo con IA
- Backend API: Ver `../cuidamet-api/README.md`

## 🐛 Problemas Conocidos

Ver sección "Problemas Conocidos y Limitaciones" en "resources/docs/IA chats/012 - Integrating User Registration with API Endpoints/012-1 - INTEGRATION-PHASE-1-REPORT.md"

## 🚀 Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
```

## 📞 Soporte

Para reportar problemas o sugerencias, consulta la documentación del proyecto o contacta al equipo de desarrollo.

---

**Última actualización:** 26 de enero de 2026  
**Versión:** 1.0.0 (Fase 1 completada)
