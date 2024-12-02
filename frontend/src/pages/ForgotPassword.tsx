import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  UserCircle2,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export const ForgotPassword = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    employeeId: false,
    email: false
  });

  const [validation, setValidation] = useState({
    employeeId: false,
    email: false 
  });

  useEffect(() => {
    // Validate Employee ID (at least 5 digits)
    setValidation(prev => ({
      ...prev,
      employeeId: /^\d{5,}$/.test(employeeId)
    }));
  }, [employeeId]);

  useEffect(() => {
    // Validate Email (basic email format)
    setValidation(prev => ({
      ...prev,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !email) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!validation.employeeId || !validation.email) {
      setError('Por favor corrija los errores en el formulario');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulated password reset request
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Password Reset Request:', { employeeId, email });
      
      // Clear form and show success message
      setEmployeeId('');
      setEmail('');
      setTouched({ employeeId: false, email: false });
      setSuccess('Se ha enviado un enlace de restablecimiento de contraseña a su correo electrónico');
    } catch (err) {
      setError('Error al solicitar restablecimiento de contraseña. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStatus = (field: 'employeeId' | 'email') => {
    if (!touched[field]) return 'neutral';
    return validation[field] ? 'valid' : 'invalid';
  };

  return (
    <div className="w-full h-full flex flex-col items-center px-4">
      {/* Error/Success Alert */}
      <div className={`w-full max-w-md transition-all duration-300 ease-in-out ${
        (error || success) ? 'opacity-100 translate-y-0 mb-4' : 'opacity-0 -translate-y-full mb-0'
      }`}>
        {error && (
          <Alert variant="destructive" className="mx-auto shadow-lg animate-in fade-in slide-in-from-top duration-300">
            <AlertDescription className="flex items-center justify-center">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mx-auto shadow-lg animate-in fade-in slide-in-from-top duration-300 bg-green-50 border-green-200">
            <AlertDescription className="flex items-center justify-center text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Content Container */}
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
              Restablecer Contraseña
            </h2>
            <p className="text-gray-500 text-sm">
              Ingrese su número de empleado y correo electrónico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Fields */}
            <div className="space-y-4">
              {/* Employee ID Input */}
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

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className={`h-5 w-5 transition-all duration-300 ${
                    getInputStatus('email') === 'valid' ? 'text-green-500 scale-110' :
                    getInputStatus('email') === 'invalid' ? 'text-red-500 scale-110' :
                    'text-gray-400'
                  }`} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  className={`block w-full pl-12 pr-12 py-3 text-gray-900 rounded-xl border 
                    ${getInputStatus('email') === 'valid' ? 'border-green-200 focus:ring-green-500' :
                      getInputStatus('email') === 'invalid' ? 'border-red-200 focus:ring-red-500' :
                      'border-gray-200 focus:ring-blue-500'
                    } 
                    placeholder:text-gray-400 focus:ring-2 focus:border-transparent focus:outline-none 
                    transition-all bg-white/90 backdrop-blur-sm hover:bg-white`}
                  placeholder="Correo Electrónico"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  {touched.email && (
                    validation.email ? 
                      <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in" /> :
                      <XCircle className="h-5 w-5 text-red-500 animate-in fade-in" />
                  )}
                </div>
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
              {touched.email && !validation.email && (
                <p className="text-red-500 animate-in fade-in flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Ingrese un correo electrónico válido
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !validation.employeeId || !validation.email}
              className="relative w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl 
                hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                disabled:hover:from-blue-500 disabled:hover:to-blue-600 group overflow-hidden"
            >
              <span className="flex items-center relative z-10">
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                ) : null}
                {loading ? 'Enviando solicitud...' : 'Restablecer Contraseña'}
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