import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-5xl animate-float inline-block">🌸</span>
          </Link>
          <h1 className="font-serif text-3xl text-white mt-4 mb-2">Bienvenida de vuelta</h1>
          <p className="text-rose-200">Tu camino sagrado te espera</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-deep-plum mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-plum mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3.5 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar a mi espacio 🌸'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            ¿Eres nueva?{' '}
            <Link to="/registro" className="text-rose-500 font-medium hover:text-rose-700">
              Únete al Método MAJHO
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
