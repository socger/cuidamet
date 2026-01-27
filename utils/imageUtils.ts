// utils/imageUtils.ts
// Utilidad para redimensionar y comprimir una imagen antes de convertirla a base64

/**
 * Redimensiona y comprime una imagen para obtener un base64 pequeño
 * @param file Archivo de imagen (File)
 * @param maxWidth Ancho máximo (px)
 * @param maxHeight Alto máximo (px)
 * @param quality Calidad de compresión (0-1)
 * @returns Promise<string> base64 optimizado
 */
export async function resizeAndCompressImageToBase64(
  file: File,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Calcular dimensiones
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const aspect = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspect);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspect);
          }
        }
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No se pudo obtener el contexto del canvas');
        ctx.drawImage(img, 0, 0, width, height);
        // Convertir a base64 comprimido
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = (e) => reject('Error al cargar la imagen');
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject('Error al leer el archivo');
    reader.readAsDataURL(file);
  });
}
