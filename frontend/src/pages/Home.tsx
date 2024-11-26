// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom';
import { Car, LogIn } from 'lucide-react';

export const Home = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
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

        {/* Card Login */}
        <div className="max-w-sm mx-auto">
          <div
            onClick={() => navigate('/login')}
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
        </div>
      </div>
    </div>
  );
};