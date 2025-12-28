import React, { useState, useRef, useEffect } from 'react';
import CameraIcon from './icons/CameraIcon';
import PhotoIcon from './icons/PhotoIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import AlertModal from './AlertModal';

interface PhotoCaptureProps {
  photoUrl: string;
  onPhotoChange: (photoUrl: string) => void;
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  photoUrl, 
  onPhotoChange, 
  title = "Añade tu foto de perfil",
  subtitle = "Una buena foto genera confianza. Asegúrate de que se vea bien tu rostro.",
  size = 'large'
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title?: string }>({ isOpen: false, message: '' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-24 h-24', icon: 'w-16 h-16', border: 'border-[3px]' },
    medium: { container: 'w-32 h-32', icon: 'w-20 h-20', border: 'border-[4px]' },
    large: { container: 'w-48 h-48', icon: 'w-32 h-32', border: 'border-[5px]' }
  };

  const currentSize = sizeConfig[size];

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Attach stream to video element
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 } } 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Preferred camera constraints failed, retrying with basic config...", err);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsCameraActive(true);
      } catch (fallbackErr) {
        console.error("Error accessing camera:", fallbackErr);
        setAlertModal({ isOpen: true, message: 'No se pudo iniciar la cámara. Por favor, sube una foto de la galería.', title: 'Error de cámara' });
        cameraInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        onPhotoChange(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setAlertModal({ isOpen: true, message: 'El archivo debe ser JPG o PNG y menor de 5MB.', title: 'Archivo inválido' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-600 text-sm mt-1">{subtitle}</p>}
        </div>
      )}

      <div className={`relative ${currentSize.container} mb-6`}>
        <div className={`w-full h-full rounded-full ${currentSize.border} border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center relative z-10 ring-1 ring-slate-200`}>
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          ) : photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserCircleIcon className={`${currentSize.icon} text-slate-300`} />
          )}
        </div>
      </div>

      {/* Hidden Inputs and Canvas */}
      <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="user" />
      <input type="file" ref={galleryInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Buttons */}
      <div className="w-full">
        {!isCameraActive ? (
          <div className="flex gap-3 w-full">
            <button 
              onClick={startCamera} 
              className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-teal-600 transition-colors shadow-md text-sm"
            >
              <CameraIcon className="w-4 h-4 mr-1.5" /> Usar Cámara
            </button>
            <button 
              onClick={() => galleryInputRef.current?.click()} 
              className="flex-1 bg-white border-2 border-teal-500 text-teal-600 py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-teal-50 transition-colors text-sm"
            >
              <PhotoIcon className="w-4 h-4 mr-1.5" /> Galería
            </button>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <button 
              onClick={stopCamera} 
              className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={capturePhoto} 
              className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors shadow-md"
            >
              Capturar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
