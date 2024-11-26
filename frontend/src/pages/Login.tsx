import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  KeyRound,
  UserCircle2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    employeeId: false,
    password: false
  });

  const [validation, setValidation] = useState({
    employeeId: false,
    password: false 
  });

  useEffect(() => {
    // Validar ID de empleado (al menos 5 caracteres, solo números)
    setValidation(prev => ({
      ...prev,
      employeeId: /^\d{5,}$/.test(employeeId)
    }));
  }, [employeeId]);

  useEffect(() => {
    // Validar contraseña (al menos 8 caracteres, una mayúscula, un número)
    setValidation(prev => ({
      ...prev,
      password: /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
    }));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!validation.employeeId || !validation.password) {
      setError('Por favor corrija los errores en el formulario');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login attempt:', { employeeId, password });
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStatus = (field: 'employeeId' | 'password') => {
    if (!touched[field]) return 'neutral';
    return validation[field] ? 'valid' : 'invalid';
  };

  return (
    <div className="w-full h-full flex flex-col  items-center px-4">
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
                  <UserCircle2 className={`h-5 w-5 transition-all duration-300 ${
                    getInputStatus('employeeId') === 'valid' ? 'text-green-500 scale-110' :
                    getInputStatus('employeeId') === 'invalid' ? 'text-red-500 scale-110' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, employeeId: true }))}
                  className={`block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    ${getInputStatus('employeeId') === 'valid' ? 'border-green-200 focus:ring-green-500' :
                      getInputStatus('employeeId') === 'invalid' ? 'border-red-200 focus:ring-red-500' :
                      'border-gray-200 focus:ring-blue-500'
                    } 
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white`}
                  placeholder="Número de Empleado"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  {touched.employeeId && (
                    validation.employeeId ? 
                      <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in" /> :
                      <XCircle className="h-5 w-5 text-red-500 animate-in fade-in" />
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <KeyRound className={`h-5 w-5 transition-all duration-300 ${
                    getInputStatus('password') === 'valid' ? 'text-green-500 scale-110' :
                    getInputStatus('password') === 'invalid' ? 'text-red-500 scale-110' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  className={`block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    ${getInputStatus('password') === 'valid' ? 'border-green-200 focus:ring-green-500' :
                      getInputStatus('password') === 'invalid' ? 'border-red-200 focus:ring-red-500' :
                      'border-gray-200 focus:ring-blue-500'
                    } 
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

            {/* Validation Messages */}
            <div className="space-y-2 text-sm">
              {touched.employeeId && !validation.employeeId && (
                <p className="text-red-500 animate-in fade-in flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  El número de empleado debe tener al menos 5 dígitos
                </p>
              )}
              {touched.password && !validation.password && (
                <p className="text-red-500 animate-in fade-in flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  La contraseña debe tener al menos 8 caracteres, una mayúscula y un número
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !validation.employeeId || !validation.password}
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
          </form>
        </div>
      </div>
    </div>
  );
};