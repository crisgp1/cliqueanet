import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Loader2, 
  KeyRound,
  UserCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { authService } from '../services/auth.service';
import { useToast } from '../components/ui/use-toast';
import { LoginHistory, LoginResponse } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formatLastLogin = (lastLogin: LoginHistory) => {
    const date = new Date(lastLogin.fecha_login);
    const formattedDate = date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `Último acceso: ${formattedDate}
Desde: ${lastLogin.browser} en ${lastLogin.device}
Ubicación: ${lastLogin.city}, ${lastLogin.country}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Submit initiated');
    
    if (!employeeId || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Attempting login...');
      const response: LoginResponse = await authService.login({
        employeeId,
        password
      });

      console.log('🚀 Login response:', response);

      if (response.success && response.data?.token && response.data?.usuario) {
        console.log('🚀 Login successful, showing toast...');
        
        // Show welcome toast
        toast({
          title: "¡Inicio de sesión exitoso!",
          description: "Bienvenido al sistema",
          variant: "default",
          className: "bg-green-500 text-white border-none",
          duration: 3000,
        });

        // If there's last login info, show it in a separate toast
        if (response.data.lastLogin) {
          setTimeout(() => {
            toast({
              title: "Información de acceso anterior",
              description: (
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatLastLogin(response.data.lastLogin!)}
                  </div>
                </div>
              ),
              variant: "default",
              className: "bg-blue-500 text-white border-none",
              duration: 5000,
            });
          }, 1000);
        }

        console.log('🚀 Toast shown, waiting before navigation...');

        await new Promise(resolve => {
          setTimeout(() => {
            console.log('🚀 Timeout complete, attempting navigation...');
            resolve(true);
          }, 1000);
        });

        console.log('🚀 Navigating to /intranet...');
        navigate('/intranet');
        console.log('🚀 Navigation called');
      } else {
        console.log('🚀 Login failed:', response.message);
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('🚀 Login error:', err);
      setError('Error de conexión con el servidor. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-4">
      {/* Error Alert */}
      <div className={`w-full max-w-md transition-all duration-300 ease-in-out ${
        error ? 'opacity-100 translate-y-0 mb-4' : 'opacity-0 -translate-y-full mb-0'
      }`}>
        {error && (
          <Alert variant="destructive" className="mx-auto shadow-lg animate-in fade-in slide-in-from-top duration-300">
            <AlertDescription className="flex items-center justify-center">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Content Container - No box on mobile, box on desktop */}
      <div className="w-full max-w-md mt-24">
        <div className={`
          space-y-8 p-4 md:p-8
          md:bg-white/80 md:backdrop-blur-lg md:rounded-2xl md:shadow-xl md:border md:border-gray-100 
          md:hover:shadow-2xl transition-all duration-300 relative overflow-hidden
        `}>
          {/* Decorative Background Icons - Only visible on desktop */}
          <div className="absolute -right-8 -top-8 text-blue-100 transform rotate-12 hidden md:block mt-xl">
            <ShieldCheck className="w-32 h-32 opacity-20" />
          </div>
          
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Bienvenido
            </h2>
            <p className="text-gray-500 text-sm">
              Sistema de Gestión Automotriz
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <UserCircle2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    border-gray-200 focus:ring-blue-500
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white"
                  placeholder="Número de Empleado"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    border-gray-200 focus:ring-blue-500
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 transition-opacity hover:opacity-70"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl 
                hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                disabled:hover:from-blue-500 disabled:hover:to-blue-600 group overflow-hidden"
            >
              <span className="flex items-center relative z-10">
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : null}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </span>
              <ChevronRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Forgot Password Section */}
            <div className="text-center text-gray-500 text-sm mt-4">
              <Link to="/forgot-password" className="hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};