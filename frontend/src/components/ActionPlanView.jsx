import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { VIBRATION_ELIGIBLE_STAGES, childDisplayName } from '../utils/moduleMatch';

const TYPE_META = {
  I: { name: 'Índigo', emoji: '💙', color: '#4B0082', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200' },
  C: { name: 'Cristal', emoji: '💜', color: '#9B8EC4', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
  A: { name: 'Arcoíris', emoji: '🌈', color: '#E8A4B8', bg: 'from-pink-50 to-rose-50', border: 'border-pink-200' },
  D: { name: 'Diamante', emoji: '💎', color: '#7CB9A8', bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200' },
};

const WEEK_COLORS = ['#5C8A6E', '#7B5EA7', '#7CB9A8', '#C9A84C', '#2D2D2D'];

export default function ActionPlanView({ moduleColor } = {}) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [days, setDays] = useState([]);
  const [children, setChildren] = useState([]);
  const [vibResult, setVibResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/plan').catch(() => ({ data: { plan: null } })),
      api.get('/children').catch(() => ({ data: { children: [] } })),
      api.get('/questionnaire/result').catch(() => ({ data: { result: null } })),
    ]).then(([planRes, childRes, vibRes]) => {
      if (planRes.data.plan) {
        setPlan(planRes.data.plan);
        setDays(planRes.data.days || []);
        setActiveWeek(Math.max(1, Math.ceil((planRes.data.plan.current_day || 1) / 7)));
      }
      setChildren(childRes.data.children || []);
      if (vibRes.data.result) setVibResult(vibRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // The vibration test belongs to onboarding only — if we land here without a
  // plan or a result for an eligible child, that's the bug the test relocation
  // was supposed to prevent. Send the user back to complete it there.
  const hasEligibleChild = children.some(c => VIBRATION_ELIGIBLE_STAGES.includes(c.age_stage));
  useEffect(() => {
    if (!loading && !plan && !vibResult && hasEligibleChild) {
      navigate('/cuestionario');
    }
  }, [loading, plan, vibResult, hasEligibleChild, navigate]);

  // No eligible child (e.g. embarazo/0-2) means the type will never be known —
  // default to the Cristal plan rather than leaving the membership empty-handed.
  useEffect(() => {
    if (!loading && !plan && !vibResult && !hasEligibleChild) {
      startPlan('C');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, plan, vibResult, hasEligibleChild]);

  async function startPlan(vibType) {
    setCreating(true);
    try {
      const firstChild = children[0];
      const res = await api.post('/plan', {
        vibration_type: vibType,
        child_id: firstChild?.id || null,
      });
      setPlan(res.data.plan);
      setDays(res.data.days);
      setActiveWeek(1);
      setSelectedDay(res.data.days[0]);
    } finally {
      setCreating(false);
    }
  }

  async function toggleDay(day) {
    if (completing) return;
    setCompleting(true);
    try {
      if (day.completed) {
        await api.delete(`/plan/days/${day.day}/complete`);
        setDays(prev => prev.map(d => d.day === day.day ? { ...d, completed: false } : d));
        if (selectedDay?.day === day.day) setSelectedDay({ ...day, completed: false });
      } else {
        await api.post(`/plan/days/${day.day}/complete`);
        setDays(prev => prev.map(d => d.day === day.day ? { ...d, completed: true } : d));
        if (selectedDay?.day === day.day) setSelectedDay({ ...day, completed: true });
      }
    } finally {
      setCompleting(false);
    }
  }

  const completedCount = days.filter(d => d.completed).length;
  const progressPct = days.length > 0 ? Math.round((completedCount / 30) * 100) : 0;
  const typeKey = plan?.vibration_type;
  const meta = typeKey ? TYPE_META[typeKey] : null;
  // Keep one consistent color per module — without this, switching from
  // "Lecciones" (module color) to "Plan 30 días" (vibration-type color) made
  // the module's accent color visibly shift between tabs.
  const accentColor = moduleColor || meta?.color;
  const planChild = plan?.child_id ? children.find(c => c.id === plan.child_id) : null;

  // Group days by week
  const weeks = [1, 2, 3, 4, 5];
  const daysByWeek = (weekNum) => days.filter(d => d.week === weekNum);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-5xl animate-float">📅</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      {!plan ? (
        /* No plan yet — create one */
        <div className="animate-fade-in">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4 animate-float inline-block">📅</div>
            <h1 className="section-title mb-3">Plan de Acción 30 Días</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Un plan personalizado de 30 días con actividades diarias, reflexiones y afirmaciones
              adaptadas a la vibración de tu hijo/a.
            </p>
          </div>

          {vibResult ? (
            <div className={`max-w-lg mx-auto border-2 ${TYPE_META[vibResult.type.key]?.border} bg-gradient-to-br ${TYPE_META[vibResult.type.key]?.bg} rounded-3xl p-8 text-center mb-6`}>
              <div className="text-5xl mb-3">{vibResult.type.emoji}</div>
              <h2 className="font-serif text-2xl text-deep-plum mb-2">{vibResult.type.name}</h2>
              <p className="text-gray-500 text-sm mb-6">Tu test indica que tu hijo/a es un/a {vibResult.type.name}. ¿Creamos el plan personalizado?</p>
              <button
                onClick={() => startPlan(vibResult.result.type_key)}
                disabled={creating}
                className="btn-primary text-base py-3 px-8 disabled:opacity-60"
              >
                {creating ? 'Creando plan...' : `✨ Crear Plan ${vibResult.type.name}`}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">
              {hasEligibleChild ? 'Redirigiendo a tu test de vibración...' : 'Preparando tu plan...'}
            </div>
          )}
        </div>
      ) : (
        /* Plan exists */
        <div className="animate-fade-in">
          {/* 1. Resumen de identidad */}
          {planChild && (
            <div className="rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-sans"
              style={{ backgroundColor: '#F5F0E8', color: '#2E2820' }}>
              <span className="font-semibold">{childDisplayName(planChild)}</span>{' '}
              <span>es</span>{' '}
              <span className="font-semibold" style={{ color: '#C49A3C' }}>{meta?.name}</span>{' '}
              {planChild.astral_chart?.solar && (
                <>
                  <span className="opacity-40">·</span>{' '}
                  <span>Signo solar: <span className="font-semibold">{planChild.astral_chart.solar.sign}</span></span>{' '}
                </>
              )}
              {planChild.astral_chart?.ascendant && (
                <>
                  <span className="opacity-40">·</span>{' '}
                  <span>Ascendente: <span className="font-semibold">{planChild.astral_chart.ascendant.sign}</span></span>
                </>
              )}
            </div>
          )}

          {/* 2. Plan de acción del mes — Header */}
          <div className={`border-2 ${meta?.border} bg-gradient-to-br ${meta?.bg} rounded-3xl p-6 mb-6`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{meta?.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tu Plan Personalizado</p>
                  <h1 className="font-serif text-2xl font-bold" style={{ color: accentColor }}>
                    Tu plan personalizado de 30 días para tu niño/a {meta?.name}
                  </h1>
                  {planChild && <p className="text-gray-500 text-sm">{childDisplayName(planChild)}</p>}
                  <p className="text-gray-500 text-sm">
                    {completedCount}/30 días completados · {progressPct}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-32 bg-white/60 rounded-full h-3 mb-1">
                  <div className="h-3 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%`, backgroundColor: accentColor }} />
                </div>
                <button onClick={() => startPlan(typeKey)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Reiniciar plan
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              {/* Week tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {weeks.map(w => {
                  const weekDays = daysByWeek(w);
                  const weekCompleted = weekDays.filter(d => d.completed).length;
                  if (weekDays.length === 0) return null;
                  return (
                    <button key={w} onClick={() => setActiveWeek(w)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2
                        ${activeWeek === w ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                      style={activeWeek === w ? { backgroundColor: WEEK_COLORS[w - 1], borderColor: WEEK_COLORS[w - 1] } : {}}>
                      {w === 5 ? 'Final' : `Semana ${w}`}
                      <span className="ml-1.5 opacity-70 text-xs">({weekCompleted}/{weekDays.length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Days grid */}
              {weeks.map(w => {
                if (w !== activeWeek) return null;
                const weekDays = daysByWeek(w);
                const theme = weekDays[0]?.theme;
                return (
                  <div key={w} className="animate-fade-in">
                    {theme && (
                      <p className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wide">
                        📌 {theme}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {weekDays.map(day => (
                        <button key={day.day}
                          onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                          className={`relative rounded-2xl p-4 text-left transition-all border-2 hover:shadow-md
                            ${selectedDay?.day === day.day ? 'ring-2 ring-offset-2' : ''}
                            ${day.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-rose-200'}`}
                          style={selectedDay?.day === day.day ? { ringColor: accentColor } : {}}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">Día {day.day}</span>
                            {day.completed && <span className="text-green-500 text-sm">✓</span>}
                          </div>
                          <div className="text-2xl mb-1">{day.emoji}</div>
                          <p className="text-xs font-medium text-deep-plum leading-tight line-clamp-2">
                            {day.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{day.duration_min} min</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day detail */}
            <div className="lg:col-span-1">
              {selectedDay ? (
                <div className="card sticky top-20 animate-slide-up">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{selectedDay.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Día {selectedDay.day} · {selectedDay.duration_min} min</p>
                      <h3 className="font-serif text-lg text-deep-plum">{selectedDay.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedDay.morning ? (
                      <>
                        <div className="bg-amber-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">🌅 Rutina de mañana · {selectedDay.morning.duration_min} min</p>
                          <p className="text-sm text-gray-700">{selectedDay.morning.activity}</p>
                        </div>

                        <div className="bg-rose-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">☀️ Rutina de tarde · {selectedDay.afternoon.duration_min} min</p>
                          <p className="text-sm text-gray-700">{selectedDay.afternoon.activity}</p>
                        </div>

                        <div className="bg-plum-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-plum-500 uppercase tracking-wide mb-1">🌙 Rutina de noche · {selectedDay.night.duration_min} min</p>
                          <p className="text-sm text-gray-700">{selectedDay.night.activity}</p>
                        </div>

                        {selectedDay.tip && (
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">🌿 Tip de ambiente</p>
                            <p className="text-sm text-gray-700">{selectedDay.tip}</p>
                          </div>
                        )}

                        <div className={`bg-gradient-to-br ${meta?.bg} border ${meta?.border} rounded-xl p-3`}>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accentColor }}>💜 Afirmación para ti, mamá</p>
                          <p className="text-sm font-serif italic text-deep-plum">"{selectedDay.mom_affirmation}"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-amber-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">🤔 Reflexión</p>
                          <p className="text-sm text-gray-700 italic">"{selectedDay.reflection}"</p>
                        </div>

                        <div className="bg-rose-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">✅ Actividad</p>
                          <p className="text-sm text-gray-700">{selectedDay.activity}</p>
                        </div>

                        <div className={`bg-gradient-to-br ${meta?.bg} border ${meta?.border} rounded-xl p-3`}>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accentColor }}>💜 Afirmación</p>
                          <p className="text-sm font-serif italic text-deep-plum">"{selectedDay.affirmation}"</p>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => toggleDay(selectedDay)}
                    disabled={completing}
                    className={`w-full mt-4 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-60
                      ${selectedDay.completed
                        ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-500'
                        : 'btn-primary'}`}
                  >
                    {completing ? '...' : selectedDay.completed ? '✓ Completado · Desmarcar' : '✓ Marcar como hecho'}
                  </button>
                </div>
              ) : (
                <div className="card text-center text-gray-400 py-10">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-sm">Selecciona un día para ver su contenido y marcarlo como completado</p>
                </div>
              )}

              {/* Stats */}
              <div className="card mt-4">
                <h3 className="font-semibold text-deep-plum text-sm mb-3">Tu progreso</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-lg font-bold text-green-600">{completedCount}</p>
                    <p className="text-xs text-gray-400">Hechos</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2">
                    <p className="text-lg font-bold text-rose-500">{30 - completedCount}</p>
                    <p className="text-xs text-gray-400">Faltan</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2">
                    <p className="text-lg font-bold text-amber-600">{progressPct}%</p>
                    <p className="text-xs text-gray-400">Avance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
