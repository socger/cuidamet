import React, { useState, useEffect } from "react";
import LockClosedIcon from "./icons/LockClosedIcon";
import MailIcon from "./icons/MailIcon";
import EyeIcon from "./icons/EyeIcon";
import EyeSlashIcon from "./icons/EyeSlashIcon";
import CheckCircleIcon from "./icons/CheckCircleIcon";
import UserIcon from "./icons/UserIcon";
import HandRaisedIcon from "./icons/HandRaisedIcon";
import { UserRole, AuthMode } from "../types";
import XMarkIcon from "./icons/XMarkIcon";

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
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedRole) {
      setRole(preselectedRole);
    }
  }, [preselectedRole]);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In development mode, always allow login (bypass validation)
    // In production, you would validate credentials against a backend
    // Validación simple de ejemplo
    const isValidLogin = email === "socger@cuidamet.com" && password === "1234";
    // const isValidLogin = true; // Bypass for demo
    
    if (!isValidLogin) {
      // Increment attempt counter
      if (onAttemptIncrement) {
        onAttemptIncrement();
      }
      
      // Check if max attempts reached
      if (authAttempts >= 2) { // 3 attempts total (0, 1, 2)
        if (onMaxAttemptsReached) {
          onMaxAttemptsReached();
        }
        return;
      }
      
      alert(`Credenciales inválidas. Intento ${authAttempts + 1} de 3.`);
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Use the role state if set (e.g. via preselection), otherwise default to client.
      onLoginSuccess(role || "client");
    }, 500);
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      alert(
        "Por favor, selecciona si eres Familiar o Cuidador (necesario para la demo)."
      );
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMode("verifyEmail");
    }, 500);
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

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Hemos enviado un enlace de recuperación a ${email}`);
      setMode("login");
    }, 1000);
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
            Soy Familiar
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
            Soy Cuidador
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
                ? `Crear cuenta de ${
                    preselectedRole === "provider" ? "Cuidador" : "Familiar"
                  }`
                : "Crea tu cuenta gratis")}
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
                  src="/resources/docs/logos/Logo CuidaMet_Horizontal.svg"
                  alt="Cuidamet"
                  className="h-10 w-auto"
                />
              </div>

              {/* {pendingActionMessage && (
                        <div className="mb-4 bg-teal-50 text-teal-800 px-4 py-2 rounded-lg text-sm font-medium border border-teal-100 animate-pulse">
                            {pendingActionMessage}
                        </div>
                    )} */}

              {/* <h2 className="text-2xl font-bold text-slate-800">
                        {mode === 'login' && 'Bienvenido de nuevo'}
                        {mode === 'signup' && (preselectedRole ? `Crear cuenta de ${preselectedRole === 'provider' ? 'Cuidador' : 'Familiar'}` : 'Crea tu cuenta gratis')}
                        {mode === 'forgotPassword' && 'Recuperar contraseña'}
                        {mode === 'verifyEmail' && 'Verifica tu email'}
                    </h2> */}
              <p className="text-slate-500 mt-2 text-sm">
                {mode === "login" && "Modo desarrollo: pulsa para entrar."}
                {mode === "signup" &&
                  "Modo desarrollo: validaciones desactivadas."}
                {mode === "forgotPassword" &&
                  "Introduce tu email y te enviaremos instrucciones."}
                {mode === "verifyEmail" &&
                  `Código enviado a ${email} (pulsa verificar).`}
              </p>
            </div>

            {mode === "verifyEmail" && (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center space-x-4">
                  {verificationCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-${idx}`}
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
                  {isLoading ? "Verificando..." : "Verificar Cuenta (Bypass)"}
                </button>
                <button
                  type="button"
                  onClick={() => alert("Código reenviado")}
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
                    : handleForgot
                }
                className="space-y-4"
              >
                {mode === "signup" && renderRoleSelection()}

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
                  disabled={isLoading}
                  className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all disabled:bg-slate-400 disabled:shadow-none mt-6 flex items-center justify-center transform active:scale-95"
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      {mode === "login" && "Iniciar Sesión"}
                      {mode === "signup" &&
                        (preselectedRole
                          ? "Crear Cuenta"
                          : "Crear Cuenta (Bypass)")}
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
    </div>
  );
};

export default AuthPage;
