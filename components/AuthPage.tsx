import React, { useState, useEffect, useRef } from "react";
import LockClosedIcon from "./icons/LockClosedIcon";
import MailIcon from "./icons/MailIcon";
import EyeIcon from "./icons/EyeIcon";
import EyeSlashIcon from "./icons/EyeSlashIcon";
import CheckCircleIcon from "./icons/CheckCircleIcon";
import UserIcon from "./icons/UserIcon";
import HandRaisedIcon from "./icons/HandRaisedIcon";
import { UserRole, AuthMode } from "../types";
import XMarkIcon from "./icons/XMarkIcon";
import AlertModal from "./actions/AlertModal";
import { authService, tokenStorage } from "../services/authService";
import { createProfileBasedOnRole } from "../services/profileService";

interface AuthPageProps {
  initialMode?: AuthMode;
  preselectedRole?: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onSignupSuccess: (role: UserRole, email: string) => void;
  onBack: () => void;
  pendingActionMessage?: string;
  onMaxAttemptsReached?: () => void;
  authAttempts?: number;
  onAttemptIncrement?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  preselectedRole,
  onLoginSuccess,
  onSignupSuccess,
  onBack,
  pendingActionMessage,
  onMaxAttemptsReached,
  authAttempts = 0,
  onAttemptIncrement,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole | null>(preselectedRole || null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title?: string }>({ isOpen: false, message: '' });
  const firstCodeInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (preselectedRole) {
      setRole(preselectedRole);
    }
  }, [preselectedRole]);

  useEffect(() => {
    if (mode === "verifyEmail" && firstCodeInputRef.current) {
      firstCodeInputRef.current.focus();
    }
  }, [mode]);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleVerificationChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleInternalBack = () => {
    if (mode === "verifyEmail") {
      setMode("signup");
    } else if (mode === "forgotPassword") {
      setMode("login");
    } else {
      onBack();
    }
  };

  const maxAttempts = 5;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Llamar al backend para login
      const response = await authService.login({
        email,
        password,
      });
      
      console.log('🔐 Respuesta de login:', response);
      console.log('👤 Usuario:', response.user);
      console.log('🎭 Roles del usuario:', response.user.roles);
      
      // Determinar el rol del usuario basado en sus roles
      let userRole: UserRole = "client";
      if (response.user.roles.includes('provider') || response.user.roles.includes('admin')) {
        userRole = "provider";
      }
      
      console.log('✅ Rol determinado:', userRole);
      
      // Guardar el rol del usuario
      tokenStorage.setUserRole(userRole);
      
      setIsLoading(false);
      onLoginSuccess(userRole);
    } catch (error: any) {
      setIsLoading(false);
      
      // Increment attempt counter
      if (onAttemptIncrement) {
        onAttemptIncrement();
      }
      
      // Check if max attempts reached
      if (authAttempts >= maxAttempts - 1) { 
        if (onMaxAttemptsReached) {
          onMaxAttemptsReached();
        }
        return;
      }
      
      setAlertModal({ 
        isOpen: true, 
        message: error.message || "Email o contraseña incorrectos. Por favor, verifica tus credenciales.", 
        title: "Error de inicio de sesión" 
      });
    }
  };

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setAlertModal({ isOpen: true, message: "Por favor, selecciona si eres Familiar o Cuidador." });
      return;
    }
    if (password !== confirmPassword) {
      setAlertModal({ isOpen: true, message: "Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.", title: "Error de contraseña" });
      return;
    }
    if (!hasMinLength || !hasNumber || !hasSpecial) {
      setAlertModal({ isOpen: true, message: "La contraseña debe cumplir todos los requisitos: mínimo 8 caracteres, un número y un símbolo especial.", title: "Contraseña débil" });
      return;
    }
    if (!termsAccepted) {
      setAlertModal({ isOpen: true, message: "Debes aceptar los Términos de Servicio y la Política de Privacidad.", title: "Términos no aceptados" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generar username a partir del email si no se proporciona
      const generatedUsername = username || email.split('@')[0];
      
      // Convertir el rol del frontend a profileType del backend
      const profileType = role === 'provider' ? 'provider' : 'client';
      
      // Registrar usuario en el backend con el tipo de perfil
      const response = await authService.register({
        username: generatedUsername,
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        profileType, // Enviar el tipo de perfil al backend
      });
      
      // Guardar el rol del usuario
      tokenStorage.setUserRole(role);
      
      setIsLoading(false);
      
      // Mostrar mensaje de éxito y redirigir
      setAlertModal({ 
        isOpen: true, 
        message: "¡Cuenta creada exitosamente! Ya puedes comenzar a usar Cuidamet.", 
        title: "Registro exitoso" 
      });
      
      // Llamar a onSignupSuccess después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        onSignupSuccess(role, email);
      }, 1500);
      
    } catch (error: any) {
      setIsLoading(false);
      setAlertModal({ 
        isOpen: true, 
        message: error.message || "Error al crear la cuenta. Por favor, verifica los datos e intenta de nuevo.", 
        title: "Error de registro" 
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.requestPasswordReset(email);
      setIsLoading(false);
      setAlertModal({ 
        isOpen: true, 
        message: `Hemos enviado un enlace de recuperación a ${email}`, 
        title: 'Email enviado' 
      });
      setTimeout(() => {
        setMode("login");
      }, 2000);
    } catch (error: any) {
      setIsLoading(false);
      setAlertModal({ 
        isOpen: true, 
        message: error.message || "Error al solicitar recuperación de contraseña.", 
        title: 'Error' 
      });
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role) {
        onSignupSuccess(role, email || "demo@user.com");
      }
    }, 500);
  };

  const renderRoleSelection = () => {
    if (preselectedRole) return null; // Don't show buttons if role is preselected

    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            role === "client"
              ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
              : "border-slate-200 bg-white hover:border-teal-300"
          }`}
        >
          <UserIcon
            className={`w-8 h-8 mb-2 ${
              role === "client" ? "text-teal-600" : "text-slate-400"
            }`}
          />
          <span
            className={`text-sm font-bold ${
              role === "client" ? "text-teal-900" : "text-slate-600"
            }`}
          >
            Perfil familiar
          </span>
          <span className="text-xs text-slate-500 mt-1">Busco cuidados</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("provider")}
          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            role === "provider"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-slate-200 bg-white hover:border-blue-300"
          }`}
        >
          <HandRaisedIcon
            className={`w-8 h-8 mb-2 ${
              role === "provider" ? "text-blue-600" : "text-slate-400"
            }`}
          />
          <span
            className={`text-sm font-bold ${
              role === "provider" ? "text-blue-900" : "text-slate-600"
            }`}
          >
            Perfil profesional
          </span>
          <span className="text-xs text-slate-500 mt-1">Ofrezco servicios</span>
        </button>
      </div>
    );
  };

  const renderPasswordRequirements = () => (
    <div className="mt-2 space-y-1 opacity-50">
      <div
        className={`text-xs flex items-center ${
          hasMinLength ? "text-green-600" : "text-slate-400"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full mr-2 ${
            hasMinLength ? "bg-green-500" : "bg-slate-300"
          }`}
        ></div>
        Mínimo 8 caracteres
      </div>
      <div
        className={`text-xs flex items-center ${
          hasNumber ? "text-green-600" : "text-slate-400"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full mr-2 ${
            hasNumber ? "bg-green-500" : "bg-slate-300"
          }`}
        ></div>
        Contiene un número
      </div>
      <div
        className={`text-xs flex items-center ${
          hasSpecial ? "text-green-600" : "text-slate-400"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full mr-2 ${
            hasSpecial ? "bg-green-500" : "bg-slate-300"
          }`}
        ></div>
        Símbolo especial (!@#$%)
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in"
      onClick={onBack}
    >
      <div
        className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10 border-b border-slate-100 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-slate-800 pl-2">
            {mode === "login" && "Bienvenido de nuevo"}
            {mode === "signup" &&
              (preselectedRole
                ? `Crear perfil ${
                    preselectedRole === "provider" ? "profesional" : "familiar"
                  }`
                : "Elige y crea tu tipo de perfil")}
            {mode === "forgotPassword" && "Recuperar contraseña"}
            {mode === "verifyEmail" && "Verifica tu email"}
          </h2>

          <button
            onClick={handleInternalBack}
            className="text-slate-600 p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow overflow-y-auto">
          <div className="min-h-full flex flex-col justify-center container mx-auto px-6 py-4 max-w-md pb-10">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-md mb-4 border border-slate-100">
                <img
                  src="/resources/logos/Logo CuidaMet_Horizontal.svg"
                  alt="Cuidamet"
                  className="h-10 w-auto"
                />
              </div>

              {pendingActionMessage && (
                <div className="mb-4 bg-teal-50 text-teal-800 px-4 py-2 rounded-lg text-sm font-medium border border-teal-100 animate-pulse">
                    {pendingActionMessage}
                </div>
              )}

              {(mode === "forgotPassword" || mode === "verifyEmail") && (
                <p className="text-slate-500 mt-2 text-sm">
                  {/* La variable "mode" puede tener los valores: 
                    - 'login'
                    - 'signup'
                    - 'forgotPassword'
                    - 'verifyEmail' */}
                  {mode === "forgotPassword" &&
                    "Introduce tu email y te enviaremos instrucciones."}
                  {mode === "verifyEmail" &&
                    `Código enviado a ${email} (pulsa verificar).`}
                </p>
              )}
            </div>

            {mode === "verifyEmail" && (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center space-x-4">
                  {verificationCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-${idx}`}
                      ref={idx === 0 ? firstCodeInputRef : null}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleVerificationChange(idx, e.target.value)
                      }
                      className="w-14 h-16 text-center text-2xl font-bold border-2 border-slate-300 rounded-xl focus:border-teal-500 focus:ring-0 bg-white text-slate-800 shadow-sm"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 transition-all disabled:bg-slate-400 transform active:scale-95"
                >
                  {isLoading ? "Verificando..." : "Verificar cuenta"}
                </button>
                <button
                  type="button"
                  onClick={() => setAlertModal({ isOpen: true, message: "Código reenviado", title: 'Código enviado' })}
                  className="w-full text-teal-600 font-medium text-sm hover:text-teal-800"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </form>
            )}

            {mode !== "verifyEmail" && (
              <form
                onSubmit={
                  mode === "login"
                    ? handleLogin
                    : mode === "signup"
                    ? handleSignupStep1
                    : handleForgotPassword
                }
                className="space-y-4"
              >
                {mode === "signup" && renderRoleSelection()}

                {mode === "signup" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Juan"
                          className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Apellido
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Pérez"
                          className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="juanperez (opcional)"
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 shadow-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Si no lo proporcionas, se generará automáticamente desde tu email
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 shadow-sm"
                    />
                    <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {mode !== "forgotPassword" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 shadow-sm"
                      />
                      <LockClosedIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {mode === "signup" && renderPasswordRequirements()}
                  </div>
                )}

                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 text-slate-800 shadow-sm ${
                          confirmPassword && !passwordsMatch
                            ? "border-red-400 focus:ring-red-500"
                            : confirmPassword && passwordsMatch
                            ? "border-green-400 focus:ring-green-500"
                            : "border-slate-300 focus:ring-teal-500"
                        }`}
                      />
                      <LockClosedIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="mt-2">
                        {passwordsMatch ? (
                          <div className="text-xs flex items-center text-green-600">
                            <div className="w-1.5 h-1.5 rounded-full mr-2 bg-green-500"></div>
                            Las contraseñas coinciden
                          </div>
                        ) : (
                          <div className="text-xs flex items-center text-red-600">
                            <div className="w-1.5 h-1.5 rounded-full mr-2 bg-red-500"></div>
                            Las contraseñas no coinciden
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === "signup" && (
                  <label className="flex items-start space-x-3 cursor-pointer pt-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 shadow-sm transition-all checked:border-teal-500 checked:bg-teal-500 hover:border-teal-400"
                      />
                      <CheckCircleIcon className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-slate-600 leading-snug">
                      He leído y acepto los{" "}
                      <button
                        type="button"
                        className="text-teal-600 hover:underline font-medium"
                      >
                        Términos de Servicio
                      </button>{" "}
                      y la{" "}
                      <button
                        type="button"
                        className="text-teal-600 hover:underline font-medium"
                      >
                        Política de Privacidad
                      </button>{" "}
                      de Cuidamet.
                    </span>
                  </label>
                )}

                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode("forgotPassword")}
                      className="text-xs text-teal-600 font-medium hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (mode === "signup" && (!email || !password || !confirmPassword || !role || !passwordsMatch))
                  }
                  className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed mt-6 flex items-center justify-center transform active:scale-95"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {mode === "login" && "Iniciar Sesión"}
                      {
                        mode === "signup" &&
                        (preselectedRole ? "Crear perfil" : "Crear perfil")
                      }
                      {mode === "forgotPassword" && "Enviar Instrucciones"}
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center pb-4">
              {mode === "login" && (
                <p className="text-slate-600 text-sm">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-teal-600 font-bold hover:underline ml-1"
                  >
                    Regístrate
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p className="text-slate-600 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-teal-600 font-bold hover:underline ml-1"
                  >
                    Inicia Sesión
                  </button>
                </p>
              )}
              {mode === "forgotPassword" && (
                <button
                  onClick={() => setMode("login")}
                  className="text-teal-600 font-bold text-sm hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
      <AlertModal 
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default AuthPage;
