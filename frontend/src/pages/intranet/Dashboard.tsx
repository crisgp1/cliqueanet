import React from 'react';
import { Car, Users, CreditCard, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: JSX.Element;
  trend: number;
  backgroundColor: string;
  iconColor: string;
  index: number;
}

const StatCard = ({ title, value, icon, trend, backgroundColor, iconColor, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full"
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {value}
        </h3>
      </div>
      <motion.div 
        whileHover={{ rotate: 15 }}
        className={`p-2 sm:p-3 rounded-lg ${backgroundColor} transition-colors duration-300`}
      >
        <div className={`${iconColor} transition-colors duration-300`}>
          {React.cloneElement(icon, { size: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24 })}
        </div>
      </motion.div>
    </div>
    <div className="flex items-center text-xs sm:text-sm">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {trend > 0 ? (
          <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
        )}
      </motion.div>
      <span className={`ml-1 font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {Math.abs(trend)}%
      </span>
      <span className="text-gray-500 ml-2">vs mes anterior</span>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  const stats = [
    {
      title: 'Vehículos en Inventario',
      value: '124',
      icon: <Car />,
      trend: 12,
      backgroundColor: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clientes Registrados',
      value: '1,893',
      icon: <Users />,
      trend: 8.5,
      backgroundColor: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Créditos Activos',
      value: '89',
      icon: <CreditCard />,
      trend: -2.4,
      backgroundColor: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Ventas del Mes',
      value: '$2.4M',
      icon: <TrendingUp />,
      trend: 15.3,
      backgroundColor: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 sm:px-6 py-4 sm:py-6 w-full max-w-[100vw] overflow-x-hidden"
    >
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bienvenido al Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Sistema de Gestión Automotriz - Panel de Control
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} index={index} />
        ))}
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
            Actividad Reciente
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-600">Última venta registrada</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Hace 2 horas</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-600">Nuevo cliente registrado</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Hace 4 horas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
            Resumen de Ventas
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-600">Ventas del día</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">$45,850</p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-600">Proyección mensual</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">$158,000</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};