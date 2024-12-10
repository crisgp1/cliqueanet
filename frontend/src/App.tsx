import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';  
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Intranet } from './pages/intranet';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './services/auth.service';

const App = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-16 pb-16"> {/* pt-16 para el header, pb-16 para el footer */}
        <Routes>
          {/* Ruta raíz - redirige a /intranet si está autenticado o a /login si no lo está */}
          <Route path="/" element={
            authService.isAuthenticated() ? (
              <Navigate to="/intranet" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Rutas públicas */}
          <Route path="/login" element={
            authService.isAuthenticated() ? (
              <Navigate to="/intranet" replace />
            ) : (
              <Login />
            )
          } />
          <Route path="/forgot-password" element={
            authService.isAuthenticated() ? (
              <Navigate to="/intranet" replace />
            ) : (
              <ForgotPassword />
            )
          } />
          
          {/* Rutas protegidas */}
          <Route path="/intranet/*" element={
            <ProtectedRoute>
              <Intranet/>
            </ProtectedRoute>
          } />

          {/* Ruta para manejar URLs no encontradas - redirige a /intranet si está autenticado o a /login si no lo está */}
          <Route path="*" element={
            authService.isAuthenticated() ? (
              <Navigate to="/intranet" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default App;