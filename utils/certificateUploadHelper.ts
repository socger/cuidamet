import { Certificate, CareCategory } from "../types";

export interface CertificateUploadOptions {
  file: File;
  servicesData: Record<string, any>;
  category: CareCategory;
  onError: (message: string, title?: string) => void;
  onSuccess: (newCert: Certificate, category: CareCategory) => void;
}

/**
 * Maneja la subida de certificados con validación de límites y tipos de archivo
 * 
 * @param options - Opciones de configuración para la subida
 * @returns Promise<boolean> - true si la subida fue exitosa, false si hubo error
 */
export async function uploadCertificate(
  options: CertificateUploadOptions
): Promise<boolean> {
  const { file, servicesData, category, onError, onSuccess } = options;

  // Validar límite de certificados GLOBAL (todas las categorías)
  const maxCertificates = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
  
  // Contar TODOS los certificados del usuario (todas las categorías)
  const totalCertificates = Object.values(servicesData).reduce(
    (total, service) => total + ((service as any).certificates?.length || 0),
    0
  );
  
  if (totalCertificates >= maxCertificates) {
    onError(
      `Has alcanzado el límite máximo de ${maxCertificates} certificados en total. Tienes ${totalCertificates} certificados subidos en todos tus servicios. Elimina algunos antes de subir uno nuevo.`,
      "Límite Alcanzado"
    );
    return false;
  }
  
  // Validaciones básicas
  const maxSizeMB = Number(import.meta.env.VITE_MAX_CERTIFICATE_SIZE_MB) || 5;
  const maxSize = maxSizeMB * 1024 * 1024; // Convertir MB a bytes
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (file.size > maxSize) {
    onError(`El archivo no debe superar los ${maxSizeMB}MB`, "Error");
    return false;
  }
  
  if (!allowedTypes.includes(file.type)) {
    onError('Solo se permiten archivos PDF, JPG, JPEG o PNG', "Error");
    return false;
  }

  try {
    // Importar el servicio de certificados
    const { certificateService } = await import('../services/profileService');
    
    // Subir el archivo al servidor
    const uploadResult = await certificateService.uploadFile(file);
    
    if (uploadResult && uploadResult.data) {
      const newCert: Certificate = {
        id: Date.now().toString(),
        name: file.name.split(".")[0],
        description: "Documento subido",
        type: "other",
        fileName: uploadResult.data.fileName,
        fileUrl: uploadResult.data.fileUrl, // URL del servidor
        status: "pending",
        dateAdded: new Date().toISOString(),
      };

      onSuccess(newCert, category);
      console.log('✅ Certificado subido exitosamente:', newCert);
      return true;
    }
    
    onError('Error al subir el archivo. Por favor, intenta nuevamente.', "Error");
    return false;
  } catch (error) {
    console.error('❌ Error al subir certificado:', error);
    onError('Error al subir el archivo. Por favor, intenta nuevamente.', "Error");
    return false;
  }
}
