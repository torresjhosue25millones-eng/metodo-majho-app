import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

function LogoImg() {
  const [failed, setFailed] = useState(false);
  return failed
    ? <span className="text-2xl">🌸</span>
    : <img src="/assets/logo-majho.png" alt="Método MAJHO" style={{ height: 70, width: 'auto' }} onError={() => setFailed(true)} />;
}

const navLinks = [
  { to: '/dashboard', label: 'Inicio', icon: '🏠' },
  { to: '/modulos', label: 'Módulos', icon: '📖' },
  { to: '/plan', label: 'Plan 30 días', icon: '📅' },
  { to: '/cuestionario', label: 'Vibración', icon: '🔮' },
  { to: '/diario', label: 'Diario', icon: '✍️' },
  { to: '/afirmaciones', label: 'Afirmaciones', icon: '✨' },
  { to: '/perfil', label: 'Perfil', icon: '👤' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() { logout(); navigate('/'); }

  return (
    <nav className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <LogoImg />
            <span className="font-serif font-bold text-deep-plum text-lg hidden md:block">Método MAJHO</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors
                  ${location.pathname === link.to ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:text-rose-500 hover:bg-rose-50'}`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Support button */}
            <Link to="/emergencia"
              className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-2 rounded-full transition-all shadow-sm hover:shadow-md hover:brightness-95 active:scale-95 flex-shrink-0"
              style={{ backgroundColor: '#25D366' }}>
              <span>💬</span>
              <span className="hidden sm:inline">Línea de apoyo MAJHO</span>
            </Link>

            <button onClick={handleLogout}
              className="hidden xl:block text-xs text-gray-400 hover:text-rose-500 transition-colors px-2 py-1.5">
              Salir
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden p-2 rounded-lg text-gray-500 hover:bg-rose-50">
              <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="xl:hidden border-t border-rose-100 py-2 animate-slide-up">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium mb-0.5
                  ${location.pathname === link.to ? 'bg-rose-50 text-rose-600' : 'text-gray-600'}`}>
                <span>{link.icon}</span><span>{link.label}</span>
              </Link>
            ))}
            <Link to="/emergencia" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold mb-0.5"
              style={{ backgroundColor: '#E9F9EF', color: '#1A8C49' }}>
              <span>💬</span><span>Línea de apoyo MAJHO</span>
            </Link>
            <button onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400">
              <span>🚪</span> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
