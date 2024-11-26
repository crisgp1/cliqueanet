// src/pages/Home.tsx
import  { useState } from 'react';
import { Car, LogIn, HelpCircle, ChevronRight, Users, ClipboardList, Shield, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export const Home = (): JSX.Element => {
  const [currentSection, setCurrentSection] = useState<'main' | 'login' | 'faq' | 'features'>('main');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ... resto del código de manejo de estado ...

  const BackButton = () => (
    <button 
      onClick={() => setCurrentSection('main')}
      className="fixed top-4 left-4 flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      Volver
    </button>
  );

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Bienvenido
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sistema de Gestión Automotriz
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              {/* Input fields */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número de Empleado"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
              ) : null}
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex justify-center p-3 bg-blue-50 rounded-2xl mb-6">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sistema de Gestión
            <span className="block text-blue-600">Automotriz</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Gestiona tu inventario, clientes y transacciones de manera eficiente en un solo lugar.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Login Card */}
          <div
            onClick={() => setCurrentSection('login')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Iniciar Sesión</h2>
            </div>
            <p className="text-gray-600 text-sm">Accede a tu cuenta para gestionar el sistema.</p>
          </div>

          {/* FAQ Card */}
          <div
            onClick={() => setCurrentSection('faq')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Ayuda</h2>
            </div>
            <p className="text-gray-600 text-sm">Encuentra respuestas a tus dudas más comunes.</p>
          </div>

          {/* Features Card */}
          <div
            onClick={() => setCurrentSection('features')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Características</h2>
            </div>
            <p className="text-gray-600 text-sm">Descubre todas las funcionalidades del sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <BackButton />
      <div className="max-w-7xl mx-auto pt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Características</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <BackButton />
      <div className="max-w-3xl mx-auto pt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      {currentSection === 'main' && renderMain()}
      {currentSection === 'login' && renderLogin()}
      {currentSection === 'faq' && renderFAQ()}
      {currentSection === 'features' && renderFeatures()}
    </div>
  );
};  