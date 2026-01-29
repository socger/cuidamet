import { UserRole } from '../types';

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// Tipos de datos
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileType: 'provider' | 'client'; // Tipo de perfil: provider (cuidador) o client (familiar)
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
  };
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface ProfileCreateData {
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
}

// Utilidad para obtener el User-Agent
const getUserAgent = (): string => {
  return navigator.userAgent || 'CuidametApp/1.0';
};

// Funciones auxiliares para almacenamiento
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },
  
  getUser: (): any | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUserRole: (): UserRole | null => {
    return localStorage.getItem('userRole') as UserRole | null;
  },
  
  setUserRole: (role: UserRole): void => {
    localStorage.setItem('userRole', role);
  }
};

// Servicio de autenticación
export const authService = {
  /**
   * Registrar un nuevo usuario
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/${API_VERSION}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': getUserAgent(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    const result: AuthResponse = await response.json();
    
    // Guardar tokens y usuario
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    tokenStorage.setUser(result.user);
    
    return result;
  },

  /**
   * Iniciar sesión
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': getUserAgent(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const result: AuthResponse = await response.json();
    
    // Guardar tokens y usuario
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    tokenStorage.setUser(result.user);
    
    return result;
  },

  /**
   * Renovar access token usando refresh token
   */
  refreshToken: async (): Promise<RefreshResponse> => {
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clearTokens();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }

    const result: RefreshResponse = await response.json();
    
    // Actualizar tokens
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    
    return result;
  },

  /**
   * Cerrar sesión (logout individual)
   */
  logout: async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/${API_VERSION}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Error al hacer logout en el servidor:', error);
      }
    }
    
    tokenStorage.clearTokens();
  },

  /**
   * Cerrar todas las sesiones del usuario
   */
  logoutAll: async (): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    
    if (accessToken) {
      try {
        await fetch(`${API_URL}/${API_VERSION}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error('Error al hacer logout-all en el servidor:', error);
      }
    }
    
    tokenStorage.clearTokens();
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async (): Promise<any> => {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No hay token de acceso');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/auth/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Intentar renovar token
        try {
          await authService.refreshToken();
          return authService.getProfile();
        } catch {
          throw new Error('Sesión expirada');
        }
      }
      throw new Error('Error al obtener perfil');
    }

    return response.json();
  },

  /**
   * Solicitar reseteo de contraseña
   */
  requestPasswordReset: async (email: string): Promise<any> => {
    const response = await fetch(`${API_URL}/${API_VERSION}/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al solicitar reseteo de contraseña');
    }

    return response.json();
  },

  /**
   * Resetear contraseña con token
   */
  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    const response = await fetch(`${API_URL}/${API_VERSION}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al resetear contraseña');
    }

    return response.json();
  },

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No hay token de acceso');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Intentar renovar token
        try {
          await authService.refreshToken();
          return authService.changePassword(oldPassword, newPassword);
        } catch {
          throw new Error('Sesión expirada');
        }
      }
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar contraseña');
    }

    return response.json();
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },

  /**
   * Cambiar el rol activo del usuario
   * Actualiza en la BD qué rol está activo y devuelve el perfil correspondiente
   */
  switchActiveRole: async (userId: number, roleName: 'client' | 'provider'): Promise<{
    activeRole: string;
    profile: any | null;
    profileType: 'client' | 'provider' | 'none';
  }> => {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No hay token de acceso');
    }

    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/users/${userId}/active-role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar rol activo');
    }

    const result = await response.json();
    
    // Actualizar rol en localStorage
    tokenStorage.setUserRole(roleName as UserRole);
    
    return result.data;
  },
};

// Interceptor para manejar requests con token
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = tokenStorage.getAccessToken();
  
  const headers = {
    ...options.headers,
    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
  };

  let response = await fetch(url, { ...options, headers });

  // Si obtenemos un 401, intentar renovar el token
  if (response.status === 401) {
    try {
      await authService.refreshToken();
      const newAccessToken = tokenStorage.getAccessToken();
      
      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    } catch (error) {
      // Si falla la renovación, limpiar tokens y redirigir al login
      tokenStorage.clearTokens();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }
  }

  return response;
};
