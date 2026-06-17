import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BREATHING_PHASES = [
  { label: 'Inhala', duration: 4, color: '#5C8A6E', grow: true },
  { label: 'Sostén', duration: 4, color: '#7B5EA7', grow: true },
  { label: 'Exhala', duration: 6, color: '#7CB9A8', grow: false },
];

const CRISIS_AFFIRMATIONS = [
  'Este momento pasará. Soy más fuerte de lo que creo.',
  'Puedo respirar. Puedo pausar. Puedo elegir cómo respondo.',
  'No soy perfecta y aun así soy exactamente la mamá que mi hijo/a necesita.',
  'Mis emociones son válidas. Tengo derecho a sentir y también a calmarme.',
  'Estoy haciendo lo mejor que puedo con lo que tengo en este momento.',
  'Merezco amor y compasión, especialmente de mí misma.',
];

const RESOURCES = [
  { icon: '🚨', title: 'Emergencia real', desc: 'Si hay peligro inmediato', number: '112', color: 'border-red-200 bg-red-50 text-red-700' },
  { icon: '💬', title: 'Crisis emocional', desc: 'Apoyo psicológico urgente', number: '024', color: 'border-plum-200 bg-plum-50 text-plum-700' },
  { icon: '🤱', title: 'Lactancia', desc: 'Apoyo urgente en lactancia', number: 'LLLI: 900 100 000', color: 'border-rose-200 bg-rose-50 text-rose-700' },
  { icon: '🏥', title: 'Salud mental materna', desc: 'Depresión y ansiedad materna', number: 'Tu médico', color: 'border-teal-200 bg-teal-50 text-teal-600' },
];

function BreathingCircle({ active, phase, count }) {
  const current = BREATHING_PHASES[phase];
  const progress = active ? 1 - (count / current.duration) : 0;
  const isGrowing = current.grow;
  const circleScale = active ? (isGrowing ? 1.0 + (progress * 0.45) : 1.45 - (progress * 0.45)) : 1.0;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#D9EBE3" strokeWidth="4" />
        {active && (
          <circle cx="50" cy="50" r="44" fill="none" stroke={current.color} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        )}
      </svg>
      <div className="absolute inset-3 rounded-full flex flex-col items-center justify-center"
        style={{
          background: active ? `${current.color}25` : '#F5EFE0',
          border: `3px solid ${active ? current.color : '#BAD3C8'}`,
          transform: `scale(${circleScale})`,
          transition: `transform ${current.duration}s ease-in-out`,
        }}>
        <span className="font-serif text-3xl font-bold" style={{ color: active ? current.color : '#5C8A6E' }}>
          {active ? count : '🌸'}
        </span>
        <span className="text-xs font-semibold mt-0.5" style={{ color: active ? current.color : '#5C8A6E' }}>
          {active ? current.label : 'Lista'}
        </span>
      </div>
    </div>
  );
}

export default function EmergencyView() {
  const [limitData, setLimitData] = useState(null);
  const [activated, setActivated] = useState(false);
  const [activating, setActivating] = useState(false);
  const [limitError, setLimitError] = useState(null);
  const [affirmIdx, setAffirmIdx] = useState(0);

  // Breathing state
  const [breathActive, setBreathActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const phaseRef = useRef(0);
  const countRef = useRef(4);
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get('/emergency/limit').then(res => setLimitData(res.data)).catch(() => {});
  }, []);

  async function handleActivate() {
    if (activating) return;
    setActivating(true);
    try {
      const res = await api.post('/emergency/use');
      setLimitData(prev => ({ ...prev, ...res.data }));
      setActivated(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al activar el protocolo';
      setLimitError(msg);
    } finally {
      setActivating(false);
    }
  }

  function startBreathing() {
    setBreathActive(true);
    phaseRef.current = 0;
    countRef.current = BREATHING_PHASES[0].duration;
    setPhase(0);
    setCount(BREATHING_PHASES[0].duration);
    setCycles(0);
    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      setCount(countRef.current);
      if (countRef.current <= 0) {
        const next = (phaseRef.current + 1) % BREATHING_PHASES.length;
        phaseRef.current = next;
        countRef.current = BREATHING_PHASES[next].duration;
        setPhase(next);
        setCount(countRef.current);
        if (next === 0) setCycles(c => c + 1);
      }
    }, 1000);
  }

  function stopBreathing() {
    setBreathActive(false);
    clearInterval(intervalRef.current);
    setPhase(0);
    setCount(4);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const canUse = limitData?.can_use !== false;
  const remaining = limitData?.remaining ?? 2;

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="text-white py-5 px-4 rounded-3xl mb-6" style={{ background: 'linear-gradient(90deg, #1A8C49, #25D366)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-float">💬</span>
            <div>
              <h1 className="font-serif text-2xl font-bold">Línea de apoyo MAJHO</h1>
              <p className="text-white/80 text-sm">Estás aquí porque lo necesitas. Eso ya es valentía.</p>
            </div>
          </div>
          {limitData && (
            <div className="bg-white/20 rounded-2xl px-4 py-2 text-center flex-shrink-0">
              <p className="text-xs text-white/80 font-medium">Usos este mes</p>
              <p className="text-white font-bold text-lg">{limitData.uses_this_month}/{limitData.limit}</p>
              <div className="flex gap-1 justify-center mt-1">
                {Array.from({ length: limitData.limit }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < limitData.uses_this_month ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activation gate */}
      {!activated && (
        <div className="animate-fade-in">
          {limitError ? (
            <div className="card border-2 border-amber-200 bg-amber-50 mb-6 text-center">
              <span className="text-4xl mb-3 block">⚠️</span>
              <h2 className="font-serif text-xl text-amber-800 mb-2">Límite mensual alcanzado</h2>
              <p className="text-amber-700 text-sm mb-4">{limitError}</p>
              <p className="text-amber-600 text-sm">
                El límite existe para que este espacio sea un recurso especial, no de uso cotidiano.
                Abajo encontrarás recursos de apoyo permanente.
              </p>
            </div>
          ) : (
            <div className="card border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-plum-50 mb-6 text-center animate-fade-in">
              <span className="text-5xl mb-3 block">💜</span>
              <h2 className="font-serif text-2xl text-deep-plum mb-3">
                Mamá, ¿necesitas apoyo ahora mismo?
              </h2>
              <p className="text-gray-600 mb-2 leading-relaxed">
                La Línea de apoyo MAJHO te guía paso a paso: respiración, anclaje y afirmaciones de acompañamiento.
              </p>
              {limitData && (
                <p className="text-sm text-gray-400 mb-5">
                  {remaining > 0
                    ? `Te quedan ${remaining} activación${remaining > 1 ? 'es' : ''} este mes · Se renueva el ${limitData.reset_date}`
                    : `Has usado tus ${limitData.limit} activaciones este mes`}
                </p>
              )}
              {canUse ? (
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:brightness-95 active:scale-95 text-base disabled:opacity-60"
                  style={{ backgroundColor: '#25D366' }}
                >
                  {activating ? 'Activando...' : '💬 Activar Línea de apoyo MAJHO'}
                </button>
              ) : (
                <button disabled className="bg-gray-200 text-gray-400 font-bold px-8 py-3.5 rounded-full cursor-not-allowed">
                  Límite mensual alcanzado
                </button>
              )}
            </div>
          )}

          {/* Always show resources */}
          <div className="mb-6">
            <h2 className="font-serif text-xl text-deep-plum mb-3">Recursos de apoyo permanentes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESOURCES.map(r => (
                <div key={r.title} className={`border-2 ${r.color} rounded-2xl p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{r.title}</p>
                      <p className="text-xs opacity-70 mt-0.5">{r.desc}</p>
                      <p className="font-bold text-sm mt-1">{r.number}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card text-center bg-hero-gradient text-white border-0">
            <span className="text-3xl mb-2 block">🌸</span>
            <p className="font-serif text-lg font-bold mb-1">No estás sola en esto</p>
            <p className="text-rose-100 text-sm mb-3">Miles de mamás MAJHO han estado aquí. Tú también puedes.</p>
            <Link to="/diario" className="bg-white text-rose-600 text-sm font-semibold px-5 py-2 rounded-full inline-block hover:bg-rose-50 transition-all">
              Escribir en mi diario
            </Link>
          </div>
        </div>
      )}

      {/* Activated protocol */}
      {activated && (
        <div className="space-y-5 animate-fade-in">
          {/* Step 1: Breathing */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <h2 className="font-serif text-lg text-deep-plum">Respira primero (4-4-6)</h2>
            </div>
            <BreathingCircle active={breathActive} phase={phase} count={count} />
            {cycles > 0 && (
              <p className="text-center text-rose-400 text-sm mt-3 font-medium">
                {cycles} ciclo{cycles > 1 ? 's' : ''} completado{cycles > 1 ? 's' : ''} ✨
              </p>
            )}
            <div className="flex justify-center mt-4">
              {!breathActive ? (
                <button onClick={startBreathing} className="btn-primary">Comenzar respiración</button>
              ) : (
                <button onClick={stopBreathing} className="btn-secondary">Detener</button>
              )}
            </div>
          </div>

          {/* Step 2: Affirmation */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-plum-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <h2 className="font-serif text-lg text-deep-plum">Una palabra para tu alma</h2>
            </div>
            <div className="bg-gradient-to-br from-plum-50 to-rose-50 rounded-2xl p-5 text-center">
              <p className="font-serif text-xl italic text-deep-plum leading-relaxed mb-3">
                "{CRISIS_AFFIRMATIONS[affirmIdx]}"
              </p>
              <button onClick={() => setAffirmIdx(i => (i + 1) % CRISIS_AFFIRMATIONS.length)}
                className="text-sm text-plum-500 hover:text-plum-700 font-medium transition-colors">
                Siguiente afirmación →
              </button>
            </div>
          </div>

          {/* Step 3: Grounding */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <h2 className="font-serif text-lg text-deep-plum">Ancla tus sentidos 5-4-3-2-1</h2>
            </div>
            <div className="space-y-2">
              {[
                { n: 5, s: 'cosas que puedes VER', e: '👁️' },
                { n: 4, s: 'cosas que puedes TOCAR', e: '✋' },
                { n: 3, s: 'cosas que puedes OÍR', e: '👂' },
                { n: 2, s: 'cosas que puedes OLER', e: '👃' },
                { n: 1, s: 'cosa que puedes SABOREAR', e: '👅' },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
                  <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{item.n}</div>
                  <p className="text-gray-600 text-sm"><span className="mr-1">{item.e}</span>{item.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Resources */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gold-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <h2 className="font-serif text-lg text-deep-plum">Si necesitas más apoyo</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {RESOURCES.map(r => (
                <div key={r.title} className={`border-2 ${r.color} rounded-2xl p-3`}>
                  <p className="font-semibold text-xs">{r.icon} {r.title}</p>
                  <p className="font-bold text-sm mt-1">{r.number}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Limit info */}
          {limitData && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-400">
                {limitData.uses_this_month}/{limitData.limit} activaciones usadas este mes ·
                {limitData.remaining > 0 ? ` Te queda ${limitData.remaining} más ·` : ' Límite alcanzado ·'}
                {' '}Se renueva el {limitData.reset_date}
              </p>
            </div>
          )}

          <div className="card text-center bg-hero-gradient text-white border-0">
            <span className="text-3xl mb-2 block">🌸</span>
            <p className="font-serif text-lg font-bold mb-1">Ya diste el paso más difícil</p>
            <p className="text-rose-100 text-sm mb-3">Pedir ayuda es un acto de valentía y amor hacia ti y tu familia.</p>
            <Link to="/diario" className="bg-white text-rose-600 text-sm font-semibold px-5 py-2 rounded-full inline-block hover:bg-rose-50 transition-all">
              📓 Escribir cómo me siento
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
