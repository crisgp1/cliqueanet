import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCircle,
  Car,
  CreditCard,
  ClipboardList,
  Menu,
  LogOut,
  ChevronDown,
  Settings,
  X,
  Pin,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: JSX.Element;
  path: string;
}

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
        setIsSidebarPinned(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleSidebarToggle = () => {
    if (!isMobile) {
      if (isSidebarOpen) {
        setIsSidebarPinned(false); // Desactivar pin al cerrar
      }
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const handlePinToggle = () => {
    if (isSidebarPinned) {
      setIsSidebarPinned(false);
    } else {
      setIsSidebarPinned(true);
      setIsSidebarOpen(true);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { title: 'Empleados', icon: <Users size={20} />, path: '/dashboard/empleados' },
    { title: 'Clientes', icon: <UserCircle size={20} />, path: '/dashboard/clientes' },
    { title: 'Inventario', icon: <Car size={20} />, path: '/dashboard/inventario' },
    { title: 'Créditos', icon: <CreditCard size={20} />, path: '/dashboard/creditos' },
    { title: 'Transacciones', icon: <ClipboardList size={20} />, path: '/dashboard/transacciones' },
  ];

  const shouldShowSidebar = isSidebarOpen || (!isSidebarPinned && isHovered);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div 
        className={`md:hidden fixed top-16 z-[45] bg-white border-b border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'left-64 right-0' : 'left-0 right-0'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {!isSidebarOpen && <h1 className="text-xl font-bold text-gray-800">AutoGestión</h1>}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[40]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => !isMobile && !isSidebarPinned && setIsHovered(true)}
        onMouseLeave={() => !isMobile && !isSidebarPinned && setIsHovered(false)}
        className={`${
          isMobile
            ? `fixed left-0 z-[45] w-64 transform ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : `fixed left-0 z-[45] ${
                shouldShowSidebar ? 'w-64' : 'w-20'
              }`
        } top-16 bottom-16 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Logo and Pin Button */}
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              {shouldShowSidebar && (
                <h1 className="text-xl font-bold text-gray-800">AutoGestión</h1>
              )}
              {!isMobile && (
                <div className="flex items-center gap-2">
                  {shouldShowSidebar && (
                    <button
                      onClick={handlePinToggle}
                      className={`p-2 rounded-lg hover:bg-gray-100 ${
                        isSidebarPinned ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      title={isSidebarPinned ? 'Desfijar sidebar' : 'Fijar sidebar'}
                    >
                      <Pin size={20} className={isSidebarPinned ? 'rotate-45' : ''} />
                    </button>
                  )}
                  <button
                    onClick={handleSidebarToggle}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title={isSidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
                  >
                    {shouldShowSidebar ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 group ${
                  !shouldShowSidebar ? 'justify-center' : ''
                }`}
              >
                <div className={!shouldShowSidebar ? 'tooltip relative' : ''}>
                  {item.icon}
                  {!shouldShowSidebar && (
                    <span className="tooltip-text absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[80]">
                      {item.title}
                    </span>
                  )}
                </div>
                {shouldShowSidebar && <span>{item.title}</span>}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCircle className="text-blue-600" />
              </div>
              {shouldShowSidebar && (
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Usuario Actual</span>
                    <ChevronDown size={16} />
                  </div>
                  <span className="text-xs text-gray-500">Administrador</span>
                </div>
              )}
            </div>
            {shouldShowSidebar && (
              <div className="mt-4 space-y-2">
                <button className="w-full flex items-center space-x-3 p-2 text-sm text-gray-600 hover:text-blue-600">
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center space-x-3 p-2 text-sm text-gray-600 hover:text-red-600"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : shouldShowSidebar ? 'ml-64' : 'ml-20'
        } pt-16 pb-16`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};