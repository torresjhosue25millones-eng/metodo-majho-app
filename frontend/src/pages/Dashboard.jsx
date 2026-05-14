import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TYPE_COLORS = {
  indigo: { color: '#4B0082', bg: '#F0E6FF', emoji: '💙', name: 'Índigo' },
  cristal: { color: '#9B8EC4', bg: '#F5F0FA', emoji: '💜', name: 'Cristal' },
  arcoiris: { color: '#E8A4B8', bg: '#FDF3F6', emoji: '🌈', name: 'Arcoíris' },
  diamante: { color: '#7CB9A8', bg: '#F0FAF8', emoji: '💎', name: 'Diamante' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [affirmation, setAffirmation] = useState(null);
  const [children, setChildren] = useState([]);
  const [vibResult, setVibResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/modules'),
      api.get('/affirmations/daily'),
      api.get('/auth/me'),
      api.get('/children'),
      api.get('/questionnaire/result').catch(() => ({ data: { result: null } })),
    ]).then(([modRes, affRes, meRes, childRes, vibRes]) => {
      setModules(modRes.data.modules.slice(0, 3));
      setAffirmation(affRes.data.affirmation);
      setProgress(meRes.data.progress);
      setTotalLessons(meRes.data.totalLessons);
      setChildren(childRes.data.children);
      if (vibRes.data.result) setVibResult(vibRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const pct = totalLessons > 0 ? Math.round((progress / totalLessons) * 100) : 0;
  const firstChild = children[0];
  const typeData = vibResult?.type?.key ? TYPE_COLORS[vibResult.type.key] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-5xl animate-float mb-4">🌸</div>
          <p className="text-rose-400">Preparando tu espacio sagrado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Welcome hero */}
        <div className="bg-hero-gradient rounded-3xl p-8 text-white mb-6 animate-fade-in relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl">🌸</div>
          <p className="text-rose-200 text-sm mb-1 relative z-10">{greeting} 💜</p>
          <h1 className="font-serif text-3xl font-bold mb-1 relative z-10">
            {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-rose-100 mb-5 relative z-10">Tu camino de crianza consciente continúa hoy.</p>
          <div className="bg-white/20 rounded-2xl p-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-rose-100">Progreso general</span>
              <span className="text-white font-bold">{pct}%</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-rose-200 text-xs mt-2">{progress} de {totalLessons} lecciones completadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Daily affirmation */}
          <div className="lg:col-span-2">
            {affirmation && (
              <div className="card border-rose-200 bg-gradient-to-br from-rose-50 to-plum-50 h-full animate-fade-in">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✨</span>
                  <div>
                    <p className="text-xs font-medium text-rose-400 uppercase tracking-widest mb-2">
                      Tu afirmación de hoy
                    </p>
                    <p className="font-serif text-xl text-deep-plum italic leading-relaxed">
                      "{affirmation.text}"
                    </p>
                    <p className="text-rose-300 text-sm mt-2">— {affirmation.author}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Child card / vibration result */}
          <div className="animate-fade-in">
            {firstChild ? (
              <div
                className="card h-full border-2"
                style={typeData ? { borderColor: typeData.color + '60', backgroundColor: typeData.bg } : {}}
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 font-medium">Mi hijo/a</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-hero-gradient flex items-center justify-center text-white font-serif text-lg font-bold flex-shrink-0">
                    {firstChild.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-deep-plum">{firstChild.name}</p>
                    {firstChild.age_stage && (
                      <p className="text-xs text-gray-400">{firstChild.age_stage === 'embarazo' ? 'Embarazo' : `${firstChild.age_stage} años`}</p>
                    )}
                  </div>
                </div>
                {typeData ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeData.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-500">Vibración</p>
                      <p className="font-semibold text-sm" style={{ color: typeData.color }}>
                        Niño/a {typeData.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link to="/cuestionario" className="text-xs text-rose-500 hover:text-rose-700 font-medium">
                    🔮 Descubrir su vibración →
                  </Link>
                )}
              </div>
            ) : (
              <div className="card h-full border-dashed border-2 border-rose-200 flex flex-col items-center justify-center text-center py-6">
                <span className="text-3xl mb-2">👶</span>
                <p className="text-sm text-gray-500 mb-3">¿Quieres agregar a tu hijo/a?</p>
                <Link to="/perfil" className="text-xs text-rose-500 font-medium hover:text-rose-700">
                  Ir a mi perfil →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { to: '/modulos', icon: '📖', label: 'Módulos MAJHO', color: 'bg-rose-50 border-rose-200 text-rose-700' },
            { to: '/cuestionario', icon: '🔮', label: 'Test Vibración', color: 'bg-plum-50 border-plum-200 text-plum-600' },
            { to: '/diario', icon: '✍️', label: 'Mi Diario', color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { to: '/emergencia', icon: '🆘', label: '911 MAJHO', color: 'bg-red-50 border-red-200 text-red-600' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`border-2 ${item.color} rounded-2xl p-4 text-center hover:shadow-md transition-all active:scale-95`}
            >
              <div className="text-3xl mb-1.5">{item.icon}</div>
              <p className="font-medium text-xs sm:text-sm">{item.label}</p>
            </Link>
          ))}
        </div>

        {/* Continue modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-deep-plum">Continúa tu camino</h2>
            <Link to="/modulos" className="btn-ghost text-sm">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map(m => (
              <Link key={m.id} to={`/modulos/${m.id}`} className="card-hover group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: m.color }}>
                      {m.age_label}
                    </p>
                    <h3 className="font-semibold text-deep-plum text-sm group-hover:text-rose-600 transition-colors">
                      {m.title}
                    </h3>
                  </div>
                </div>
                <div className="bg-rose-100 rounded-full h-1.5 mb-1">
                  <div className="h-1.5 rounded-full" style={{ width: `${m.progress_pct}%`, backgroundColor: m.color }} />
                </div>
                <p className="text-xs text-gray-400">{m.completed_lessons}/{m.lessons_count} lecciones</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
