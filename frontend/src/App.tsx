import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';  
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Intranet } from './pages/intranet';

const App = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-16 pb-16"> {/* pt-16 para el header, pb-16 para el footer */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/intranet/*" element={<Intranet/>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;