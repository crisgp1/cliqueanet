import React from 'react';
import { Car, Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo y Copyright */}
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              © 2024 CliqueaNet. Todos los derechos reservados
            </span>
          </div>

          {/* Enlaces de Contacto */}
          <div className="flex items-center space-x-6">
            <a href="tel:+1234567890" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Phone className="h-4 w-4" />
              <span className="text-sm">Contacto</span>
            </a>
            <a href="mailto:info@cliqueanet.com" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email</span>
            </a>
            <a href="#ubicacion" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Ubicación</span>
            </a>
          </div>

          {/* Hecho con amor */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>Hecho con</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>en México</span>
          </div>
        </div>
      </div>
    </footer>
  );
};