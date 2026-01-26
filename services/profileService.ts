import { fetchWithAuth, tokenStorage } from './authService';

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// Tipos para Client Profile
export interface ClientProfileCreateDto {
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
}

export interface ClientProfile {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

// Tipos para Provider Profile
export interface ProviderProfileCreateDto {
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  serviceTypeId?: number;
  hourlyRate?: number;
  yearsOfExperience?: number;
}

export interface ProviderProfile {
  id: number;
  userId: number;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  serviceTypeId?: number;
  hourlyRate?: number;
  yearsOfExperience?: number;
  rating?: number;
  totalReviews?: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

// Servicio para Client Profiles
export const clientProfileService = {
  /**
   * Crear perfil de cliente
   */
  create: async (data: ClientProfileCreateDto): Promise<ClientProfile> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/client-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear perfil de cliente');
    }

    return response.json();
  },

  /**
   * Obtener perfil de cliente por userId
   */
  getByUserId: async (userId: number): Promise<ClientProfile> => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/client-profiles/user/${userId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener perfil de cliente');
    }

    return response.json();
  },

  /**
   * Actualizar perfil de cliente
   */
  update: async (id: number, data: Partial<ClientProfileCreateDto>): Promise<ClientProfile> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/client-profiles/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar perfil de cliente');
    }

    return response.json();
  },

  /**
   * Obtener todos los perfiles de cliente
   */
  getAll: async (): Promise<ClientProfile[]> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/client-profiles`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener perfiles de clientes');
    }

    return response.json();
  },
};

// Servicio para Provider Profiles
export const providerProfileService = {
  /**
   * Crear perfil de proveedor
   */
  create: async (data: ProviderProfileCreateDto): Promise<ProviderProfile> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/provider-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear perfil de proveedor');
    }

    return response.json();
  },

  /**
   * Obtener perfil de proveedor por userId
   */
  getByUserId: async (userId: number): Promise<ProviderProfile> => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/provider-profiles/user/${userId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener perfil de proveedor');
    }

    return response.json();
  },

  /**
   * Actualizar perfil de proveedor
   */
  update: async (id: number, data: Partial<ProviderProfileCreateDto>): Promise<ProviderProfile> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/provider-profiles/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar perfil de proveedor');
    }

    return response.json();
  },

  /**
   * Obtener todos los perfiles de proveedor
   */
  getAll: async (): Promise<ProviderProfile[]> => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/provider-profiles`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener perfiles de proveedores');
    }

    return response.json();
  },

  /**
   * Buscar proveedores con filtros
   */
  search: async (filters?: {
    city?: string;
    serviceTypeId?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
  }): Promise<ProviderProfile[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/${API_VERSION}/provider-profiles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al buscar proveedores');
    }

    return response.json();
  },
};

// Función auxiliar para determinar qué tipo de perfil crear
export const createProfileBasedOnRole = async (
  userId: number,
  role: 'client' | 'provider',
  additionalData?: any
): Promise<ClientProfile | ProviderProfile> => {
  if (role === 'client') {
    return clientProfileService.create({
      userId,
      ...additionalData,
    });
  } else {
    return providerProfileService.create({
      userId,
      ...additionalData,
    });
  }
};

// Función auxiliar para obtener perfil basado en rol
export const getProfileByRole = async (
  userId: number,
  role: 'client' | 'provider'
): Promise<ClientProfile | ProviderProfile | null> => {
  try {
    if (role === 'client') {
      return await clientProfileService.getByUserId(userId);
    } else {
      return await providerProfileService.getByUserId(userId);
    }
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
};
