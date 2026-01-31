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
    console.log('� [PROFILE_SERVICE] saveProviderServices iniciado');
    console.log('🟡 [PROFILE_SERVICE] providerId:', providerId);
    console.log('🟡 [PROFILE_SERVICE] services:', JSON.stringify(services, null, 2));
    
    // Verificar certificados en services
    Object.entries(services).forEach(([key, service]) => {
      if (service.certificates && service.certificates.length > 0) {
        console.log(`🟡 [PROFILE_SERVICE] Servicio "${key}" tiene ${service.certificates.length} certificados:`, service.certificates);
      } else {
        console.log(`🟡 [PROFILE_SERVICE] Servicio "${key}" NO tiene certificados`);
      }
    });
    
    console.log('�💾 Guardando servicios para proveedor:', providerId, services);
    
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
        
        // Guardar/actualizar los certificados
        if (serviceConfig.certificates && serviceConfig.certificates.length > 0) {
          console.log(`📄 Procesando ${serviceConfig.certificates.length} certificados para ${categoryKey}...`);
          
          for (const cert of serviceConfig.certificates) {
            try {
              const certificateData = {
                serviceConfigId: result.data.id,
                name: cert.name,
                contactInfo: cert.contactInfo || '',
                description: cert.description || '',
                certificateType: cert.type || 'other',
                fileName: cert.fileName,
                fileUrl: cert.fileUrl,
                verificationStatus: cert.status || 'pending',
              };
              
              let certResponse;
              // Si el certificado tiene ID numérico válido de BD (no timestamp), actualizarlo
              // Los IDs de BD son números < 1000000, los timestamps son mucho mayores
              const certId = Number(cert.id);
              const isDbId = !isNaN(certId) && certId < 1000000;
              
              if (isDbId) {
                console.log(`🔄 Actualizando certificado "${cert.name}" (ID de BD: ${cert.id})`);
                certResponse = await fetchWithAuth(
                  `${API_URL}/${API_VERSION}/certificates/${cert.id}`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(certificateData),
                  }
                );
              } else {
                // Crear nuevo certificado (incluye timestamps generados en frontend)
                console.log(`➕ Creando nuevo certificado "${cert.name}" (ID temporal: ${cert.id})`);
                certResponse = await fetchWithAuth(
                  `${API_URL}/${API_VERSION}/certificates`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(certificateData),
                  }
                );
              }
              
              if (!certResponse.ok) {
                const error = await certResponse.json();
                console.warn(`⚠️ Error al guardar certificado "${cert.name}":`, error);
              } else {
                const certResult = await certResponse.json();
                console.log(`✅ Certificado "${cert.name}" guardado:`, certResult);
              }
            } catch (error) {
              console.warn(`⚠️ Error al procesar certificado "${cert.name}":`, error);
              // Continuamos con los demás certificados
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

// Servicio para Certificates (Certificados)
export const certificateService = {
  /**
   * Subir archivo de certificado
   */
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates/upload`,
      {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    return response.json();
  },

  /**
   * Crear certificado
   */
  create: async (certificateData: {
    serviceConfigId: number;
    name: string;
    contactInfo?: string;
    description?: string;
    certificateType: string;
    fileName?: string;
    fileUrl?: string;
    verificationStatus?: string;
  }) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear certificado');
    }

    return response.json();
  },

  /**
   * Obtener certificados de una configuración de servicio
   */
  getByServiceConfig: async (serviceConfigId: number) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates/service-config/${serviceConfigId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener certificados');
    }

    return response.json();
  },

  /**
   * Verificar límite de certificados para una configuración de servicio
   */
  checkLimit: async (serviceConfigId: number) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates/service-config/${serviceConfigId}/limit`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al verificar límite');
    }

    return response.json();
  },

  /**
   * Actualizar certificado
   */
  update: async (certificateId: number, certificateData: any) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates/${certificateId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar certificado');
    }

    return response.json();
  },

  /**
   * Eliminar certificado
   */
  delete: async (certificateId: number) => {
    const response = await fetchWithAuth(
      `${API_URL}/${API_VERSION}/certificates/${certificateId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar certificado');
    }

    return response.json();
  },
};

