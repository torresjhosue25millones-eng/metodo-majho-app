import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function ModuleDetail() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/modules/${id}`)
      .then(res => {
        setModule(res.data.module);
        setLessons(res.data.lessons);
        const first = res.data.lessons.find(l => !l.completed) || res.data.lessons[0];
        setActiveLesson(first);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleComplete(lesson) {
    if (lesson.completed || completing) return;
    setCompleting(true);
    try {
      await api.post(`/modules/${id}/lessons/${lesson.id}/complete`);
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, completed: true } : l));
      setActiveLesson(prev => ({ ...prev, completed: true }));
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-5xl animate-float">📖</div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-gray-400 mb-4">Módulo no encontrado</p>
            <Link to="/modulos" className="btn-primary">Volver a módulos</Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(l => l.completed).length;
  const pct = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-2">
          <Link to="/modulos" className="text-sm text-rose-400 hover:text-rose-600 flex items-center gap-1">
            ← Volver a módulos
          </Link>
        </div>

        <div className="rounded-3xl p-8 text-white mb-8 animate-fade-in"
          style={{ background: `linear-gradient(135deg, ${module.color}cc, ${module.color})` }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{module.icon}</span>
            <div>
              <p className="text-white/70 text-sm uppercase tracking-widest">Pilar {module.letter}</p>
              <h1 className="font-serif text-3xl font-bold">{module.title}</h1>
              <p className="text-white/80">{module.subtitle}</p>
            </div>
          </div>
          <p className="text-white/90 mb-4 max-w-2xl">{module.description}</p>
          <div className="bg-white/20 rounded-full h-2 max-w-sm">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-white/70 text-sm mt-1">{completedCount}/{lessons.length} lecciones · {pct}%</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson list */}
          <div className="lg:col-span-1">
            <h2 className="font-serif text-xl text-deep-plum mb-4">Lecciones</h2>
            <div className="space-y-2">
              {lessons.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLesson(l)}
                  className={`w-full text-left rounded-2xl p-4 transition-all border-2
                    ${activeLesson?.id === l.id
                      ? 'border-rose-400 bg-rose-50 shadow-sm'
                      : 'border-transparent bg-white hover:border-rose-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${l.completed ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-500'}`}>
                      {l.completed ? '✓' : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${activeLesson?.id === l.id ? 'text-rose-600' : 'text-deep-plum'}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-gray-400">{l.duration_min} min</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lesson content */}
          {activeLesson && (
            <div className="lg:col-span-2 animate-fade-in">
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-rose-400 font-medium uppercase tracking-wide mb-1">
                      Lección {lessons.findIndex(l => l.id === activeLesson.id) + 1}
                    </p>
                    <h2 className="font-serif text-2xl text-deep-plum">{activeLesson.title}</h2>
                    <p className="text-gray-400 text-sm">{activeLesson.duration_min} minutos de lectura</p>
                  </div>
                  {activeLesson.completed && (
                    <span className="badge bg-green-100 text-green-600">✓ Completada</span>
                  )}
                </div>

                <div className="prose prose-rose max-w-none">
                  <p className="text-gray-600 leading-relaxed text-base">{activeLesson.content}</p>
                </div>

                {activeLesson.practice && (
                  <div className="mt-6 bg-rose-50 rounded-2xl p-4 border border-rose-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-500 mb-1">🌿 Práctica</p>
                    <p className="text-deep-plum text-sm leading-relaxed">{activeLesson.practice}</p>
                  </div>
                )}

                {activeLesson.ritual && (
                  <div className="mt-4 rounded-2xl p-4 border border-gold-300/50" style={{ backgroundColor: '#F3E9CC' }}>
                    <p className="text-xs font-bold uppercase tracking-wide text-gold-600 mb-1">🕯️ Ritual</p>
                    <p className="text-deep-plum text-sm leading-relaxed">{activeLesson.ritual}</p>
                  </div>
                )}

                {activeLesson.affirmation && (
                  <div className="mt-4 bg-plum-50 rounded-2xl p-5 border border-plum-100 text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-plum-500 mb-2">✨ Afirmación</p>
                    <p className="font-serif text-lg text-deep-plum italic">"{activeLesson.affirmation}"</p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-rose-100">
                  {activeLesson.completed ? (
                    <div className="flex items-center gap-3 text-green-600">
                      <span className="text-2xl">✅</span>
                      <p className="font-medium">¡Has completado esta lección! Sigue brillando.</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleComplete(activeLesson)}
                      disabled={completing}
                      className="btn-primary disabled:opacity-60"
                    >
                      {completing ? 'Guardando...' : '✓ Marcar como completada'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
