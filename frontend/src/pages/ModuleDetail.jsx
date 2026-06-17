import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ActionPlanView from '../components/ActionPlanView';

const STAGE_MAP = { '3-7': '2-6', '8-12': '6-12', '13-18': '12-17' };

function findMatchingChild(children, module) {
  if (!module) return null;
  return children.find(c => {
    const stageKey = STAGE_MAP[c.age_stage] || c.age_stage;
    return stageKey === module.age_range || c.age_stage === module.age_range;
  });
}

const TABS = [
  { key: 'lecciones', label: 'Lecciones', icon: '📖' },
  { key: 'carta', label: 'Carta Astral', icon: '🔮' },
  { key: 'audio', label: 'Audiolibro', icon: '🎧' },
  { key: 'plan', label: 'Plan 30 días', icon: '📅' },
  { key: 'diario', label: 'Tu Camino Diario', icon: '🌙' },
];

export default function ModuleDetail() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [children, setChildren] = useState([]);
  const [dailyProgram, setDailyProgram] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('lecciones');
  const [activeDay, setActiveDay] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab('lecciones');
    Promise.all([
      api.get(`/modules/${id}`),
      api.get('/children').catch(() => ({ data: { children: [] } })),
      api.get(`/modules/${id}/daily-program`).catch(() => ({ data: { days: [] } })),
    ])
      .then(([modRes, childRes, dailyRes]) => {
        setModule(modRes.data.module);
        setLessons(modRes.data.lessons);
        const first = modRes.data.lessons.find(l => !l.completed) || modRes.data.lessons[0];
        setActiveLesson(first);
        setChildren(childRes.data.children || []);
        const days = dailyRes.data.days || [];
        setDailyProgram(days);
        setActiveDay(days[0] || null);
        setActiveWeek(days[0]?.week || 1);
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
  const matchingChild = findMatchingChild(children, module);
  const chart = matchingChild?.astral_chart;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-2">
          <Link to="/modulos" className="text-sm text-rose-400 hover:text-rose-600 flex items-center gap-1">
            ← Volver a módulos
          </Link>
        </div>

        <div className="rounded-3xl p-8 text-white mb-6 animate-fade-in"
          style={{ background: `linear-gradient(135deg, ${module.color}cc, ${module.color})` }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{module.icon}</span>
            <div>
              <p className="text-white/70 text-sm uppercase tracking-widest">{module.age_label}</p>
              <h1 className="font-serif text-3xl font-bold">Bienvenida a {module.title}</h1>
              <p className="text-white/80">{module.subtitle}</p>
            </div>
          </div>
          <p className="text-white/90 mb-4 max-w-2xl">{module.description}</p>
          <div className="bg-white/20 rounded-full h-2 max-w-sm">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-white/70 text-sm mt-1">{completedCount}/{lessons.length} lecciones · {pct}%</p>
        </div>

        {/* Tabs — this module's self-contained world */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border-2
                ${activeTab === t.key
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-500 hover:border-rose-200 bg-white'}`}
              style={activeTab === t.key ? { backgroundColor: module.color, borderColor: module.color } : {}}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Lecciones ──────────────────────────────────── */}
        {activeTab === 'lecciones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
        )}

        {/* ── Carta Astral ───────────────────────────────── */}
        {activeTab === 'carta' && (
          <div className="animate-fade-in max-w-3xl">
            {chart ? (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🌠</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Carta Astral</p>
                    <p className="font-semibold text-deep-plum text-sm">
                      {chart.is_mother ? 'Tu Carta Astral, mamá' : matchingChild.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-rose-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">{chart.solar.emoji}</p>
                    <p className="text-xs text-gray-400 mb-0.5">Signo Solar</p>
                    <p className="font-semibold text-sm text-deep-plum">{chart.solar.sign}</p>
                    <p className="text-xs text-rose-400">{chart.solar.element}</p>
                  </div>
                  {chart.lunar && (
                    <div className="bg-plum-50 rounded-2xl p-4 text-center">
                      <p className="text-2xl mb-1">{chart.lunar.emoji}</p>
                      <p className="text-xs text-gray-400 mb-0.5">Luna</p>
                      <p className="font-semibold text-sm text-deep-plum">{chart.lunar.sign}</p>
                    </div>
                  )}
                  {chart.ascendant ? (
                    <div className="bg-amber-50 rounded-2xl p-4 text-center">
                      <p className="text-2xl mb-1">{chart.ascendant.emoji}</p>
                      <p className="text-xs text-gray-400 mb-0.5">Ascendente</p>
                      <p className="font-semibold text-sm text-deep-plum">{chart.ascendant.sign}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
                      <p className="text-xl mb-1">⏰</p>
                      <p className="text-xs text-gray-400 leading-tight">Agrega la hora de nacimiento para el ascendente</p>
                    </div>
                  )}
                </div>
              </div>
            ) : matchingChild ? (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10">
                <span className="text-4xl mb-3 block">🔮</span>
                <p className="text-gray-500 mb-4">
                  Completa la fecha de nacimiento {module.age_range === 'embarazo' ? 'tuya' : `de ${matchingChild.name}`} en tu perfil para calcular esta carta astral.
                </p>
                <Link to="/perfil" className="btn-primary py-2 px-6 text-sm inline-block">Ir a mi perfil →</Link>
              </div>
            ) : (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10">
                <span className="text-4xl mb-3 block">🔮</span>
                <p className="text-gray-500 mb-4">
                  Agrega en tu perfil un hijo/a en esta etapa ({module.age_label}) para ver aquí su carta astral.
                </p>
                <Link to="/perfil" className="btn-primary py-2 px-6 text-sm inline-block">Ir a mi perfil →</Link>
              </div>
            )}
          </div>
        )}

        {/* ── Audiolibro ─────────────────────────────────── */}
        {activeTab === 'audio' && (
          <div className="animate-fade-in max-w-3xl">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎧</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Audiolibro</p>
                  <p className="font-semibold text-deep-plum text-sm">{module.title}</p>
                </div>
              </div>
              {module.audiobook_url ? (
                <audio controls className="w-full" src={module.audiobook_url} />
              ) : (
                <div className="rounded-2xl p-6 text-center border border-gold-300/50" style={{ backgroundColor: '#F3E9CC' }}>
                  <span className="text-3xl mb-2 block">🎙️</span>
                  <p className="font-serif text-lg text-deep-plum mb-1">Próximamente</p>
                  <p className="text-gray-500 text-sm">
                    Muy pronto podrás escuchar aquí el audiolibro de "{module.title}" mientras vives tus actividades diarias.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Plan 30 días ───────────────────────────────── */}
        {activeTab === 'plan' && (
          <div className="animate-fade-in">
            <ActionPlanView />
          </div>
        )}

        {/* ── Tu Camino Diario (afirmación, meditación, píldora, audio) ── */}
        {activeTab === 'diario' && (
          <div className="animate-fade-in">
            {dailyProgram.length === 0 ? (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10 max-w-2xl">
                <span className="text-4xl mb-3 block">🌙</span>
                <p className="text-gray-500">Este módulo todavía no tiene un camino diario configurado.</p>
              </div>
            ) : (
              <>
                <div className="bg-gold-300/15 border border-gold-300/50 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3 max-w-3xl">
                  <span className="text-xl">📌</span>
                  <p className="text-sm text-gray-600">
                    Contenido de ejemplo — pronto será reemplazado por el contenido real del libro <em>Tu Embarazo Sagrado</em>.
                  </p>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {[...new Set(dailyProgram.map(d => d.week))].map(w => {
                    const weekDays = dailyProgram.filter(d => d.week === w);
                    return (
                      <button key={w} onClick={() => { setActiveWeek(w); setActiveDay(weekDays[0]); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2
                          ${activeWeek === w ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-rose-200 bg-white'}`}
                        style={activeWeek === w ? { backgroundColor: module.color, borderColor: module.color } : {}}>
                        Semana {w}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {dailyProgram.filter(d => d.week === activeWeek).map(d => (
                        <button key={d.day} onClick={() => setActiveDay(d)}
                          className={`rounded-xl py-2 text-sm font-bold transition-all border-2
                            ${activeDay?.day === d.day ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 bg-white hover:border-rose-200'}`}
                          style={activeDay?.day === d.day ? { backgroundColor: module.color, borderColor: module.color } : {}}>
                          {d.day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeDay && (
                    <div className="lg:col-span-2 space-y-4 animate-fade-in">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                        Día {activeDay.day} · {activeDay.pillar}
                      </p>

                      <div className="bg-plum-50 rounded-2xl p-5 border border-plum-100 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-plum-500 mb-2">✨ Afirmación de la semana</p>
                        <p className="font-serif text-lg text-deep-plum italic">"{activeDay.affirmation}"</p>
                      </div>

                      <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-rose-500 mb-1">🧘 Meditación de la semana</p>
                        <p className="font-semibold text-deep-plum text-sm mb-1">{activeDay.meditation_title}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{activeDay.meditation_text}</p>
                      </div>

                      <div className="rounded-2xl p-4 border border-gold-300/50" style={{ backgroundColor: '#F3E9CC' }}>
                        <p className="text-xs font-bold uppercase tracking-wide text-gold-600 mb-1">💡 Píldora del día</p>
                        <p className="text-deep-plum text-sm leading-relaxed">{activeDay.tip}</p>
                      </div>

                      <button onClick={() => setActiveTab('audio')}
                        className="w-full flex items-center justify-between bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-rose-200 transition-all text-left">
                        <span className="flex items-center gap-2 text-sm font-medium text-deep-plum">
                          🎧 {activeDay.audio_label}
                        </span>
                        <span className="text-rose-400 text-sm">Ir al audiolibro →</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
