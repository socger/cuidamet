import { fetchWithAuth, tokenStorage } from './authService';

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// Servicio para actualizar datos del usuario
export const userService = {
  /**
   * Actualizar datos del usuario (firstName, lastName, email)
   */
  update: async (userId: number, data: { firstName?: string; lastName?: string; email?: string }) => {
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar datos del usuario');
    }

    return response.json();
  },
};

// Tipos para Client Profile
export interface ClientProfileCreateDto {
  userId: number;
  phone?: string;
  photoUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  preferences?: string[];
  profileStatus?: string;
  isPremium?: boolean;
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
  phone?: string;
  photoUrl?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  availability?: string[];
  profileStatus?: string;
  isPremium?: boolean;
  providerStatus?: string;
  rating?: number;
  reviewsCount?: number;
  completedBookings?: number;
  verifications?: string[];
  badges?: string[];
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
  create: async (data: ClientProfileCreateDto, userData?: { firstName?: string; lastName?: string; email?: string }): Promise<ClientProfile> => {
    // Si se proporcionan datos del usuario, actualizarlos primero
    if (userData && (userData.firstName || userData.lastName || userData.email)) {
      try {
        await userService.update(data.userId, userData);
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        // No bloqueamos la creación del perfil si falla la actualización del usuario
      }
    }

    // Solo enviar los campos que espera el backend
    const payload: any = {
      userId: data.userId,
      phone: data.phone,
      photoUrl: data.photoUrl,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      languages: data.languages,
      preferences: data.preferences,
      profileStatus: data.profileStatus,
      isPremium: data.isPremium,
    };
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/client-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
  update: async (id: number, data: Partial<ClientProfileCreateDto>, userData?: { firstName?: string; lastName?: string; email?: string }): Promise<ClientProfile> => {
    // Si se proporcionan datos del usuario, actualizarlos primero
    if (userData && data.userId && (userData.firstName || userData.lastName || userData.email)) {
      try {
        await userService.update(data.userId, userData);
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        // No bloqueamos la actualización del perfil si falla la actualización del usuario
      }
    }

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
  create: async (data: ProviderProfileCreateDto, userData?: { firstName?: string; lastName?: string; email?: string }): Promise<ProviderProfile> => {
    // Si se proporcionan datos del usuario, actualizarlos primero
    if (userData && (userData.firstName || userData.lastName || userData.email)) {
      try {
        await userService.update(data.userId, userData);
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        // No bloqueamos la creación del perfil si falla la actualización del usuario
      }
    }

    // Solo enviar los campos que espera el backend
    const payload: any = {
      userId: data.userId,
      phone: data.phone,
      photoUrl: data.photoUrl,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      languages: data.languages,
      availability: data.availability,
      profileStatus: data.profileStatus,
      isPremium: data.isPremium,
      providerStatus: data.providerStatus,
      rating: data.rating,
      reviewsCount: data.reviewsCount,
      completedBookings: data.completedBookings,
      verifications: data.verifications,
      badges: data.badges,
    };
    const response = await fetchWithAuth(`${API_URL}/${API_VERSION}/provider-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
  update: async (id: number, data: Partial<ProviderProfileCreateDto>, userData?: { firstName?: string; lastName?: string; email?: string }): Promise<ProviderProfile> => {
    // Si se proporcionan datos del usuario, actualizarlos primero
    if (userData && data.userId && (userData.firstName || userData.lastName || userData.email)) {
      try {
        await userService.update(data.userId, userData);
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        // No bloqueamos la actualización del perfil si falla la actualización del usuario
      }
    }

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

// Servicio para Service Configs (Configuraciones de Servicios)
export const serviceConfigService = {
  /**
   * Guardar o actualizar servicios de un proveedor
   * Este método maneja la creación/actualización de múltiples servicios a la vez
   */
  saveProviderServices: async (providerId: number, services: Record<string, any>) => {
    console.log('💾 Guardando servicios para proveedor:', providerId, services);
    
    const results = [];
    
    // Iterar sobre cada categoría de servicio
    for (const [categoryKey, serviceConfig] of Object.entries(services)) {
      if (!serviceConfig.completed) {
        console.log(`⏭️ Saltando categoría ${categoryKey} porque no está completada`);
        continue; // Solo guardar servicios completados
      }
      
      try {
        // Preparar datos del servicio - SOLO propiedades del ServiceConfig DTO
        const serviceData = {
          providerId: providerId,
          careCategory: categoryKey,
          completed: serviceConfig.completed,
          tasks: serviceConfig.tasks || [],
          availability: serviceConfig.availability || [],
          hourlyRate: serviceConfig.rates?.hourly || 0,
          description: serviceConfig.description || '',
          // NOTA: experienceYears, skills y certificates pertenecen a ProviderProfile, no a ServiceConfig
        };
        
        console.log(`📝 Guardando servicio ${categoryKey}:`, serviceData);
        
        // Si el servicio tiene ID, actualizarlo; si no, crearlo
        let response;
        if (serviceConfig.id) {
          response = await fetchWithAuth(
            `${API_URL}/${API_VERSION}/service-configs/${serviceConfig.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(serviceData),
            }
          );
        } else {
          response = await fetchWithAuth(
            `${API_URL}/${API_VERSION}/service-configs`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(serviceData),
            }
          );
        }
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Error al guardar servicio ${categoryKey}`);
        }
        
        const result = await response.json();
        console.log(`✅ Servicio ${categoryKey} guardado:`, result);
        
        // Guardar/actualizar las variaciones (tareas con precios individuales)
        if (serviceConfig.variations && serviceConfig.variations.length > 0) {
          console.log(`📝 Procesando ${serviceConfig.variations.length} variaciones para ${categoryKey}...`);
          
          // Primero, obtener las variaciones existentes para eliminar las que ya no están
          try {
            const existingVariationsResponse = await fetchWithAuth(
              `${API_URL}/${API_VERSION}/service-variations/service-config/${result.data.id}`
            );
            
            if (existingVariationsResponse.ok) {
              const existingResult = await existingVariationsResponse.json();
              const existingVariations = existingResult.data || [];
              
              // IDs de variaciones que vienen del frontend
              const frontendVariationIds = serviceConfig.variations
                .filter(v => v.id)
                .map(v => v.id);
              
              // Eliminar variaciones que ya no existen en el frontend
              for (const existingVar of existingVariations) {
                if (!frontendVariationIds.includes(existingVar.id)) {
                  console.log(`🗑️ Eliminando variación antigua: "${existingVar.name}"`);
                  try {
                    await fetchWithAuth(
                      `${API_URL}/${API_VERSION}/service-variations/${existingVar.id}`,
                      { method: 'DELETE' }
                    );
                  } catch (delError) {
                    console.warn(`⚠️ Error al eliminar variación ${existingVar.id}:`, delError);
                  }
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Error al obtener variaciones existentes:', error);
          }
          
          // Ahora crear, actualizar o eliminar cada variación
          for (const variation of serviceConfig.variations) {
            try {
              // Si la variación tiene ID pero está desactivada → ELIMINAR
              if (variation.id && !variation.enabled) {
                console.log(`🗑️ Eliminando variación desactivada: "${variation.name}" (ID: ${variation.id})`);
                const deleteResponse = await fetchWithAuth(
                  `${API_URL}/${API_VERSION}/service-variations/${variation.id}`,
                  { method: 'DELETE' }
                );
                
                if (!deleteResponse.ok) {
                  console.warn(`⚠️ Error al eliminar variación "${variation.name}"`);
                } else {
                  console.log(`✅ Variación "${variation.name}" eliminada`);
                }
                continue; // Pasar a la siguiente variación
              }
              
              // Si la variación NO tiene ID y está desactivada → IGNORAR (no crear)
              if (!variation.id && !variation.enabled) {
                console.log(`⏭️ Ignorando variación nueva desactivada: "${variation.name}"`);
                continue;
              }
              
              // Si llegamos aquí, la variación está habilitada → CREAR o ACTUALIZAR
              const variationData = {
                serviceConfigId: result.data.id,
                name: variation.name,
                price: variation.price,
                unit: variation.unit,
                enabled: variation.enabled,
                description: variation.description || '',
                isCustom: variation.isCustom || false,
                displayOrder: variation.displayOrder || 0,
              };
              
              let variationResponse;
              if (variation.id) {
                // Actualizar variación existente
                console.log(`🔄 Actualizando variación "${variation.name}" (ID: ${variation.id})`);
                variationResponse = await fetchWithAuth(
                  `${API_URL}/${API_VERSION}/service-variations/${variation.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variationData),
                  }
                );
              } else {
                // Crear nueva variación
                console.log(`➕ Creando nueva variación "${variation.name}"`);
                variationResponse = await fetchWithAuth(
                  `${API_URL}/${API_VERSION}/service-variations`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variationData),
                  }
                );
              }
              
              if (!variationResponse.ok) {
                const error = await variationResponse.json();
                console.warn(`⚠️ Error al guardar variación "${variation.name}":`, error);
              } else {
                const variationResult = await variationResponse.json();
                console.log(`✅ Variación "${variation.name}" guardada:`, variationResult);
              }
            } catch (error) {
              console.warn(`⚠️ Error al procesar variación "${variation.name}":`, error);
              // Continuamos con las demás variaciones
            }
          }
        }
        
        results.push(result);
        
      } catch (error) {
        console.error(`❌ Error al guardar servicio ${categoryKey}:`, error);
        throw error;
      }
    }
    
    return results;
  },
  
  /**
   * Obtener servicios de un proveedor
   */
  getByProviderId: async (providerId: number) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/service-configs/provider/${providerId}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener servicios del proveedor');
    }
    
    return response.json();
  },
};
