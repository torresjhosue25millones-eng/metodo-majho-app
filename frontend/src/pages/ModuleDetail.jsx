import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ActionPlanView from '../components/ActionPlanView';
import JournalView from '../components/JournalView';
import EmergencyView from '../components/EmergencyView';

const STAGE_MAP = { '3-7': '2-6', '8-12': '6-12', '13-18': '12-17' };

function findMatchingChild(children, module) {
  if (!module) return null;
  return children.find(c => {
    const stageKey = STAGE_MAP[c.age_stage] || c.age_stage;
    return stageKey === module.age_range || c.age_stage === module.age_range;
  });
}

function getTabs(module) {
  const isEmbarazo = module?.age_range === 'embarazo';
  return [
    { key: 'lecciones', label: 'Lecciones', icon: '📖' },
    { key: 'carta', label: 'Carta Astral', icon: '🔮' },
    { key: 'audio', label: 'Audiolibro', icon: '🎧' },
    // El embarazo no tiene un tipo de vibración calculable (el niño aún no nace);
    // su plan es "Tu Camino del Embarazo", basado en el mes real de gestación.
    isEmbarazo
      ? { key: 'mensual', label: 'Tu Camino del Embarazo', icon: '🌙' }
      : { key: 'plan', label: 'Plan 30 días', icon: '📅' },
    { key: 'diario', label: 'Diario', icon: '✍️' },
    { key: 'emergencia', label: 'Línea de apoyo', icon: '💬' },
  ];
}

export default function ModuleDetail() {
  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [children, setChildren] = useState([]);
  const [monthlyProgram, setMonthlyProgram] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('lecciones');
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeTrimester, setActiveTrimester] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab('lecciones');
    Promise.all([
      api.get(`/modules/${id}`),
      api.get('/children').catch(() => ({ data: { children: [] } })),
      api.get(`/modules/${id}/monthly-program`).catch(() => ({ data: { months: [] } })),
    ])
      .then(([modRes, childRes, monthlyRes]) => {
        setModule(modRes.data.module);
        setLessons(modRes.data.lessons);
        const first = modRes.data.lessons.find(l => !l.completed) || modRes.data.lessons[0];
        setActiveLesson(first);
        const fetchedChildren = childRes.data.children || [];
        setChildren(fetchedChildren);
        setMonthlyProgram(monthlyRes.data.months || []);
        const matching = findMatchingChild(fetchedChildren, modRes.data.module);
        const currentMonth = matching?.pregnancy_month || 1;
        setActiveMonth(currentMonth);
        const months = monthlyRes.data.months || [];
        setActiveTrimester(months.find(m => m.month === currentMonth)?.trimester || 1);
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
  const TABS = getTabs(module);

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

        {/* ── Tu Camino del Embarazo (9 meses reales, no un ciclo fijo) ── */}
        {activeTab === 'mensual' && (
          <div className="animate-fade-in">
            {monthlyProgram.length === 0 ? (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10 max-w-2xl">
                <span className="text-4xl mb-3 block">🌙</span>
                <p className="text-gray-500">Este módulo todavía no tiene un camino mensual configurado.</p>
              </div>
            ) : !matchingChild ? (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10 max-w-2xl">
                <span className="text-4xl mb-3 block">🤰</span>
                <p className="text-gray-500 mb-4">Agrega en tu perfil que estás en esta etapa para ver tu camino del embarazo.</p>
                <Link to="/perfil" className="btn-primary py-2 px-6 text-sm inline-block">Ir a mi perfil →</Link>
              </div>
            ) : !matchingChild.pregnancy_month ? (
              <div className="card border-dashed border-2 border-rose-200 text-center py-10 max-w-2xl">
                <span className="text-4xl mb-3 block">📅</span>
                <p className="text-gray-500 mb-4">
                  Agrega tu fecha probable de parto en tu perfil para ver el contenido del mes de embarazo en el que estás.
                </p>
                <Link to="/perfil" className="btn-primary py-2 px-6 text-sm inline-block">Ir a mi perfil →</Link>
              </div>
            ) : (
              <>
                <div className="bg-gold-300/15 border border-gold-300/50 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                  <span className="text-xl">📌</span>
                  <p className="text-sm text-gray-600">
                    Contenido de ejemplo — pronto será reemplazado por el contenido real del libro <em>Tu Embarazo Sagrado</em>.
                  </p>
                </div>

                {/* Header, en el mismo estilo que el Plan 30 días */}
                <div className="border-2 rounded-3xl p-6 mb-6"
                  style={{ borderColor: module.color + '40', background: `linear-gradient(135deg, ${module.color}10, ${module.color}25)` }}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🌙</span>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tu Camino del Embarazo</p>
                        <h1 className="font-serif text-2xl font-bold" style={{ color: module.color }}>
                          Mes {matchingChild.pregnancy_month} de 9
                        </h1>
                        <p className="text-gray-500 text-sm">
                          {monthlyProgram.find(m => m.month === matchingChild.pregnancy_month)?.trimester_label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-32 bg-white/60 rounded-full h-3 mb-1">
                        <div className="h-3 rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((matchingChild.pregnancy_month / 9) * 100)}%`, backgroundColor: module.color }} />
                      </div>
                      <p className="text-xs text-gray-500">{matchingChild.pregnancy_month}/9 meses</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Trimestres + meses */}
                  <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {[1, 2, 3].map(tri => {
                        const triMonths = monthlyProgram.filter(m => m.trimester === tri);
                        if (triMonths.length === 0) return null;
                        const unlockedCount = triMonths.filter(m => m.month <= matchingChild.pregnancy_month).length;
                        return (
                          <button key={tri} onClick={() => setActiveTrimester(tri)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2
                              ${activeTrimester === tri ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                            style={activeTrimester === tri ? { backgroundColor: module.color, borderColor: module.color } : {}}>
                            {triMonths[0].trimester_label}
                            <span className="ml-1.5 opacity-70 text-xs">({unlockedCount}/{triMonths.length})</span>
                          </button>
                        );
                      })}
                    </div>

                    {monthlyProgram.filter(m => m.trimester === activeTrimester)[0]?.etapa && (
                      <p className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                        📌 {monthlyProgram.find(m => m.trimester === activeTrimester)?.etapa}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {monthlyProgram.filter(m => m.trimester === activeTrimester).map(m => {
                        const unlocked = m.month <= matchingChild.pregnancy_month;
                        const isActive = activeMonth === m.month;
                        return (
                          <button key={m.month}
                            onClick={() => unlocked && setActiveMonth(m.month)}
                            disabled={!unlocked}
                            className={`relative rounded-2xl p-4 text-left transition-all border-2 hover:shadow-md
                              ${!unlocked ? 'bg-gray-50 border-gray-100 cursor-not-allowed'
                                : isActive ? 'ring-2 ring-offset-2 bg-rose-50' : 'bg-white border-gray-100 hover:border-rose-200'}`}
                            style={unlocked && isActive ? { borderColor: module.color } : {}}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-400">Mes {m.month}</span>
                              {unlocked && m.month === matchingChild.pregnancy_month && <span className="text-xs">📍</span>}
                            </div>
                            <div className="text-2xl mb-1">{unlocked ? '🌙' : '🔒'}</div>
                            <p className={`text-xs font-medium leading-tight line-clamp-2 ${unlocked ? 'text-deep-plum' : 'text-gray-300'}`}>
                              {m.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Panel de detalle */}
                  <div className="lg:col-span-1">
                    {(() => {
                      const current = monthlyProgram.find(m => m.month === activeMonth);
                      const currentUnlocked = current && current.month <= matchingChild.pregnancy_month;
                      if (!current || !currentUnlocked) {
                        return (
                          <div className="card text-center text-gray-400 py-10">
                            <div className="text-4xl mb-3">👆</div>
                            <p className="text-sm">Selecciona un mes desbloqueado para ver su contenido</p>
                          </div>
                        );
                      }
                      return (
                        <div className="card sticky top-20 animate-slide-up space-y-4">
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                            Mes {current.month} · {current.etapa} · {current.trimester_label}
                          </p>

                          <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">🎧 Resumen en audio</p>
                            <p className="text-sm text-gray-700">{current.audio_recap_label}</p>
                          </div>

                          <div className="bg-plum-50 rounded-xl p-3 text-center">
                            <p className="text-xs font-bold text-plum-500 uppercase tracking-wide mb-1">✨ Afirmación del mes</p>
                            <p className="text-sm font-serif italic text-deep-plum">"{current.affirmation}"</p>
                          </div>

                          <div className="bg-rose-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">🧘 Meditación del mes</p>
                            <p className="font-semibold text-deep-plum text-sm mb-1">{current.meditation_title}</p>
                            <p className="text-gray-600 text-sm">{current.meditation_text}</p>
                          </div>

                          <div className="rounded-xl p-3" style={{ backgroundColor: '#F3E9CC' }}>
                            <p className="text-xs font-bold text-gold-600 uppercase tracking-wide mb-1">💡 Píldora del mes</p>
                            <p className="text-sm text-gray-700">{current.tip}</p>
                          </div>

                          <button onClick={() => setActiveTab('audio')}
                            className="w-full mt-1 py-3 rounded-xl font-medium text-sm transition-all bg-white border-2 border-gray-100 hover:border-rose-200 flex items-center justify-between px-4">
                            <span className="flex items-center gap-2 text-deep-plum">🎧 Ir al Audiolibro</span>
                            <span className="text-rose-400">→</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* Stats */}
                    <div className="card mt-4">
                      <h3 className="font-semibold text-deep-plum text-sm mb-3">Tu progreso</h3>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-xl p-2">
                          <p className="text-lg font-bold text-green-600">{matchingChild.pregnancy_month}</p>
                          <p className="text-xs text-gray-400">Mes actual</p>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-2">
                          <p className="text-lg font-bold text-rose-500">{9 - matchingChild.pregnancy_month}</p>
                          <p className="text-xs text-gray-400">Por vivir</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-2">
                          <p className="text-lg font-bold text-amber-600">{Math.round((matchingChild.pregnancy_month / 9) * 100)}%</p>
                          <p className="text-xs text-gray-400">Avance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Diario ─────────────────────────────────────── */}
        {activeTab === 'diario' && (
          <div className="animate-fade-in">
            <JournalView />
          </div>
        )}

        {/* ── Línea de apoyo ─────────────────────────────── */}
        {activeTab === 'emergencia' && (
          <div className="animate-fade-in">
            <EmergencyView />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
