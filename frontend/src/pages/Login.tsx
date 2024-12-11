import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Loader2, 
  KeyRound,
  UserCircle2,
  Eye,
  EyeOff,
  Globe2,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/ui/use-toast';
import { LoginResponse } from '@/types';

const LoadingAnimation = ({ status }: { status: 'loading' | 'success' | 'error' | null }) => {
  const variants = {
    globe: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    check: {
      scale: [0.8, 1],
      opacity: 1,
      pathLength: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    error: {
      scale: [0.8, 1],
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-white/80 backdrop-blur-sm"
    >
      <div className="relative w-16 h-16">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={variants.globe}
            className="text-blue-500"
          >
            <Globe2 size={64} strokeWidth={1.5} />
          </motion.div>
        )}

        {status === 'success' && (
          <motion.svg
            viewBox="0 0 50 50"
            className="w-16 h-16"
          >
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M15 25 L23 33 L35 17"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={variants.check}
            />
          </motion.svg>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={variants.error}
            className="text-red-500"
          >
            <div className="relative">
              <AlertCircle size={64} strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0 bg-red-100 rounded-full -z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Submit initiated');
    
    if (!employeeId || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setShowAnimation(true);
      setAuthStatus('loading');
      setError('');
      
      console.log('🚀 Attempting login...');
      const response = await authService.login({
        employeeId,
        password
      });
  
      console.log('🚀 Login response:', response);
  
      if (response.success && response.data?.token && response.data?.usuario) {
        console.log('🚀 Login successful...');
        setAuthStatus('success');
        
        // Guardar información del último login para mostrarla después de la redirección
        if (response.data.lastLogin) {
          sessionStorage.setItem('showLastLogin', JSON.stringify({
            date: new Date().getTime(),
            data: response.data.lastLogin
          }));
        }
  
        // Mostrar toast de bienvenida
        toast({
          title: "¡Inicio de sesión exitoso!",
          description: `Bienvenido, ${response.data.usuario.nombre}`,
          variant: "default",
          className: "bg-green-500 text-white border-none",
          duration: 3000,
        });
  
        console.log('🚀 Toast shown, waiting before navigation...');
        
        // Esperar a que termine la animación
        await new Promise(resolve => {
          setTimeout(() => {
            console.log('🚀 Timeout complete, attempting navigation...');
            resolve(true);
          }, 1500);
        });
  
        console.log('🚀 Navigating to /intranet...');
        navigate('/intranet');
        console.log('🚀 Navigation called');
      } else {
        console.log('🚀 Login failed:', response.message);
        setAuthStatus('error');
        
        // Esperar a que termine la animación de error
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setShowAnimation(false);
        setAuthStatus(null);
        
        // Solo mostrar el toast de error, eliminamos el setError
        toast({
          title: "Error de acceso",
          description: response.message || "Credenciales incorrectas. Por favor verifique sus datos.",
          variant: "destructive",
          duration: 4000,
        });
        
        setLoading(false);
      }
    } catch (err) {
      console.error('🚀 Login error:', err);
      setAuthStatus('error');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowAnimation(false);
      setAuthStatus(null);
      
      // Solo mostrar el toast de error, eliminamos el setError
      toast({
        title: "Error de conexión",
        description: 'Error de conexión con el servidor. Por favor intente nuevamente.',
        variant: "destructive",
        duration: 4000,
      });
      
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      {/* Error Alert */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mb-4"
          >
            <Alert variant="destructive" className="mx-auto shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 
            p-8 space-y-8 transition-all duration-300 hover:shadow-2xl"
          animate={{
            scale: error ? 0.98 : 1
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
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
              {/* Employee ID Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <UserCircle2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className={`block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    ${error ? 'border-red-200 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white`}
                  placeholder="Número de Empleado"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    ${error ? 'border-red-200 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white`}
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
              className="relative w-full inline-flex items-center justify-center px-6 py-3 text-base 
                font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl 
                hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 
                disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-blue-600 
                group overflow-hidden"
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

            {/* Forgot Password Link */}
            <div className="text-center text-gray-500 text-sm mt-4">
              <Link to="/forgot-password" className="hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Authentication Animation */}
      <AnimatePresence>
        {showAnimation && (
          <LoadingAnimation status={authStatus} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;