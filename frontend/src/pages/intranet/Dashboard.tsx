import React, { useEffect, useState } from 'react';
import { 
  Car, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Globe2 } from 'lucide-react';
import { LoginHistory } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
  trend: number;
  backgroundColor: string;
  iconColor: string;
  index: number;
  isLoading?: boolean;
}

interface DashboardStats {
  vehiclesCount: number;
  clientsCount: number;
  activeCredits: number;
  monthlySales: number;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  backgroundColor, 
  iconColor, 
  index,
  isLoading 
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full relative overflow-hidden"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />

    <div className="flex items-center justify-between mb-3 sm:mb-4 relative">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </motion.div>
          ) : (
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
              {value}
            </motion.h3>
          )}
        </AnimatePresence>
      </div>
      <motion.div 
        whileHover={{ rotate: 15, scale: 1.1 }}
        className={`p-2 sm:p-3 rounded-lg ${backgroundColor} transition-colors duration-300`}
      >
        <div className={`${iconColor} transition-colors duration-300`}>
          {React.cloneElement(icon, { 
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 24,
            className: "transform transition-transform duration-300"
          })}
        </div>
      </motion.div>
    </div>

    <AnimatePresence mode="wait">
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center text-xs sm:text-sm"
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const ActivityCard = ({ title, items }: { title: string, items: { text: string, time: string }[] }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 }}
    className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full"
  >
    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
      {title}
    </h2>
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 * index }}
          className="p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
        >
          <p className="text-sm sm:text-base text-gray-600">{item.text}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.time}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export const Dashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar y mostrar el último login
    const showLastLoginStr = sessionStorage.getItem('showLastLogin');
    if (showLastLoginStr) {
      try {
        const { date, data } = JSON.parse(showLastLoginStr);
        const lastLogin = data as LoginHistory;
        
        if (new Date().getTime() - date < 5000) {
          const formattedDate = new Date(lastLogin.fecha_login).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          toast({
            title: "Información de acceso anterior",
            description: (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Último acceso: {formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  <span>IP: {lastLogin.ip_address}</span>
                </div>
                <div>Desde: {lastLogin.browser} en {lastLogin.device}</div>
                <div>Ubicación: {lastLogin.city}, {lastLogin.country}</div>
              </div>
            ),
            variant: "default",
            className: "bg-blue-500 text-white border-none",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error al mostrar último login:', error);
      }
      sessionStorage.removeItem('showLastLogin');
    }

    // Simular carga de datos
    setTimeout(() => {
      setStats({
        vehiclesCount: 124,
        clientsCount: 1893,
        activeCredits: 89,
        monthlySales: 2400000
      });
      setIsLoading(false);
    }, 1500);
  }, [toast]);

  const statCards = [
    {
      title: 'Vehículos en Inventario',
      value: stats?.vehiclesCount || 0,
      icon: <Car />,
      trend: 12,
      backgroundColor: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clientes Registrados',
      value: stats?.clientsCount.toLocaleString() || 0,
      icon: <Users />,
      trend: 8.5,
      backgroundColor: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Créditos Activos',
      value: stats?.activeCredits || 0,
      icon: <CreditCard />,
      trend: -2.4,
      backgroundColor: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Ventas del Mes',
      value: stats ? `$${(stats.monthlySales / 1000000).toFixed(1)}M` : '$0',
      icon: <TrendingUp />,
      trend: 15.3,
      backgroundColor: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const recentActivity = [
    { text: 'Última venta registrada', time: 'Hace 2 horas' },
    { text: 'Nuevo cliente registrado', time: 'Hace 4 horas' },
  ];

  const salesSummary = [
    { text: 'Ventas del día', time: '$45,850' },
    { text: 'Proyección mensual', time: '$158,000' },
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
        {statCards.map((stat, index) => (
          <StatCard 
            key={index} 
            {...stat} 
            index={index} 
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <ActivityCard title="Actividad Reciente" items={recentActivity} />
        <ActivityCard title="Resumen de Ventas" items={salesSummary} />
      </div>
    </motion.div>
  );
};