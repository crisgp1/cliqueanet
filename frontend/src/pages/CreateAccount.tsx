import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  UserCircle2,
  Mail,
  Lock,
  BadgeCheck
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    username: false,
    correo: false,
    password: false,
    confirmPassword: false
  });

  const [validation, setValidation] = useState({
    username: false,
    correo: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    setValidation({
      username: formData.username.length >= 3,
      correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo),
      password: formData.password.length >= 8,
      confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword !== ''
    });
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Object.values(validation).every(Boolean)) {
      setError('Por favor corrija los errores en el formulario');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        username: formData.username,
        correo: formData.correo,
        password: formData.password,
        created_at: new Date(),
        is_active: true
      };
      
      console.log('Usuario creado:', userData);
      setSuccess('¡Cuenta creada exitosamente!');
      
      // Reset form
      setFormData({
        username: '',
        correo: '',
        password: '',
        confirmPassword: ''
      });
      setTouched({
        username: false,
        correo: false,
        password: false,
        confirmPassword: false
      });
    } catch (err) {
      setError('Error al crear la cuenta. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getInputStatus = (field: keyof typeof validation) => {
    if (!touched[field]) return 'neutral';
    return validation[field] ? 'valid' : 'invalid';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear nueva cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete los campos para registrarse
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top duration-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200 animate-in fade-in slide-in-from-top duration-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
            {/* Username Input */}
            <div className="relative">
              <label htmlFor="username" className="sr-only">Nombre de usuario</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle2 className={`h-5 w-5 ${
                  getInputStatus('username') === 'valid' ? 'text-green-500' :
                  getInputStatus('username') === 'invalid' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10
                  border rounded-xl text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  focus:z-10 sm:text-sm
                  ${getInputStatus('username') === 'valid' 
                    ? 'border-green-200 focus:border-green-500 focus:ring-green-500' 
                    : getInputStatus('username') === 'invalid'
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                placeholder="Nombre de usuario"
              />
              <ValidationIcon status={getInputStatus('username')} touched={touched.username} />
            </div>

            {/* Email Input */}
            <div className="relative">
              <label htmlFor="correo" className="sr-only">Correo electrónico</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${
                  getInputStatus('correo') === 'valid' ? 'text-green-500' :
                  getInputStatus('correo') === 'invalid' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
              </div>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                value={formData.correo}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, correo: true }))}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10
                  border rounded-xl text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  focus:z-10 sm:text-sm
                  ${getInputStatus('correo') === 'valid' 
                    ? 'border-green-200 focus:border-green-500 focus:ring-green-500' 
                    : getInputStatus('correo') === 'invalid'
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                placeholder="Correo electrónico"
              />
              <ValidationIcon status={getInputStatus('correo')} touched={touched.correo} />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${
                  getInputStatus('password') === 'valid' ? 'text-green-500' :
                  getInputStatus('password') === 'invalid' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10
                  border rounded-xl text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  focus:z-10 sm:text-sm
                  ${getInputStatus('password') === 'valid' 
                    ? 'border-green-200 focus:border-green-500 focus:ring-green-500' 
                    : getInputStatus('password') === 'invalid'
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                placeholder="Contraseña"
              />
              <ValidationIcon status={getInputStatus('password')} touched={touched.password} />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">Confirmar contraseña</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${
                  getInputStatus('confirmPassword') === 'valid' ? 'text-green-500' :
                  getInputStatus('confirmPassword') === 'invalid' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10
                  border rounded-xl text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  focus:z-10 sm:text-sm
                  ${getInputStatus('confirmPassword') === 'valid' 
                    ? 'border-green-200 focus:border-green-500 focus:ring-green-500' 
                    : getInputStatus('confirmPassword') === 'invalid'
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                placeholder="Confirmar contraseña"
              />
              <ValidationIcon status={getInputStatus('confirmPassword')} touched={touched.confirmPassword} />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || !Object.values(validation).every(Boolean)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                shadow-lg shadow-blue-500/30"
            >
              <span className="flex items-center">
                {loading ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                ) : null}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                <ChevronRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ValidationIcon = ({ status, touched }: { status: string; touched: boolean }) => {
  if (!touched) return null;
  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      {status === 'valid' ? 
        <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in" /> :
        <XCircle className="h-5 w-5 text-red-500 animate-in fade-in" />
      }
    </div>
  );
};

export default CreateAccount;