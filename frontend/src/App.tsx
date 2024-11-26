import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

const App = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-16 pb-16"> {/* pt-16 para el header, pb-16 para el footer */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;