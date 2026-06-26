import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getMatchingModule, VIBRATION_ELIGIBLE_STAGES } from '../utils/moduleMatch';

const TYPE_STYLES = {
  indigo: { emoji: '💙', color: '#4B0082', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-700' },
  cristal: { emoji: '💜', color: '#9B8EC4', bg: 'from-purple-50 to-pink-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  arcoiris: { emoji: '🌈', color: '#E8A4B8', bg: 'from-pink-50 to-rose-50', border: 'border-pink-300', badge: 'bg-pink-100 text-pink-700' },
  diamante: { emoji: '💎', color: '#7CB9A8', bg: 'from-teal-50 to-cyan-50', border: 'border-teal-300', badge: 'bg-teal-100 text-teal-700' },
};

export default function Questionnaire() {
  const [questions, setQuestions] = useState([]);
  const [children, setChildren] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [existingResult, setExistingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | quiz | result

  useEffect(() => {
    Promise.all([
      api.get('/questionnaire/questions'),
      api.get('/children'),
      api.get('/questionnaire/result'),
      api.get('/modules').catch(() => ({ data: { modules: [] } })),
    ]).then(([qRes, cRes, rRes, modRes]) => {
      setQuestions(qRes.data.questions);
      setChildren(cRes.data.children);
      if (rRes.data.result) setExistingResult(rRes.data);
      setModules(modRes.data.modules || []);
    }).finally(() => setLoading(false));
  }, []);

  const eligibleChildren = children.filter(c => VIBRATION_ELIGIBLE_STAGES.includes(c.age_stage));
  const myModule = getMatchingModule(children, modules);
  const myModuleLink = myModule ? `/modulos/${myModule.id}` : '/modulos';

  function handleAnswer(value) {
    const newAnswers = { ...answers, [currentQ]: value };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 300);
    }
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);
    try {
      const answersArray = questions.map((_, i) => answers[i]);
      const res = await api.post('/questionnaire/submit', {
        child_id: selectedChild || null,
        answers: answersArray,
      });
      setResult(res.data);
      setPhase('result');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setPhase('intro');
  }

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-5xl animate-float">🔮</div>
        </div>
      </div>
    );
  }

  const displayResult = result || existingResult;
  const typeKey = displayResult?.type?.key;
  const style = typeKey ? TYPE_STYLES[typeKey] : null;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {phase === 'intro' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-float inline-block">🔮</div>
              <h1 className="section-title mb-3">Test de Vibración</h1>
              <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
                Descubre si tu hijo/a es un Niño/a Índigo, Cristal, Arcoíris o Diamante
                con este cuestionario de consciencia espiritual.
              </p>
            </div>

            {/* Existing result */}
            {existingResult && (
              <div className={`border-2 ${style?.border} bg-gradient-to-br ${style?.bg} rounded-2xl p-5 mb-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{displayResult.type.emoji}</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Resultado anterior</p>
                    <p className="font-serif text-xl" style={{ color: displayResult.type.color }}>
                      {displayResult.type.name}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">"{displayResult.type.tagline}"</p>
                <button
                  onClick={() => setPhase('result')}
                  className="mt-3 text-sm font-medium hover:underline"
                  style={{ color: displayResult.type.color }}
                >
                  Ver resultado completo →
                </button>
              </div>
            )}

            {children.length > 0 && eligibleChildren.length === 0 ? (
              /* Every child is still in pregnancy/0-2 — the vibration isn't identifiable yet */
              <div className="card border-dashed border-2 border-rose-200 text-center py-10">
                <span className="text-4xl mb-3 block">🌙</span>
                <p className="text-deep-plum font-medium mb-2">Aún es muy pronto para identificar la vibración de tu hijo/a.</p>
                <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
                  El test de vibración aplica a partir de los 2 años. Mientras tanto, sigue disfrutando
                  el contenido de su módulo actual.
                </p>
                <Link to={myModuleLink} className="btn-primary inline-block">Ir a mi módulo →</Link>
              </div>
            ) : (
              <>
                {/* Child selector */}
                {eligibleChildren.length > 0 && (
                  <div className="card mb-6">
                    <label className="block text-sm font-medium text-deep-plum mb-2">
                      ¿Para cuál de tus hijos/as? <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <select
                      className="input-field"
                      value={selectedChild}
                      onChange={e => setSelectedChild(e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {eligibleChildren.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Type preview cards */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { key: 'indigo', name: 'Índigo', emoji: '💙', desc: 'Guerrero espiritual' },
                    { key: 'cristal', name: 'Cristal', emoji: '💜', desc: 'Sanador de almas' },
                    { key: 'arcoiris', name: 'Arcoíris', emoji: '🌈', desc: 'Alegría divina' },
                    { key: 'diamante', name: 'Diamante', emoji: '💎', desc: 'Ser multidimensional' },
                  ].map(t => (
                    <div key={t.key} className={`border-2 ${TYPE_STYLES[t.key]?.border} rounded-2xl p-4 bg-gradient-to-br ${TYPE_STYLES[t.key]?.bg} text-center`}>
                      <div className="text-3xl mb-1">{t.emoji}</div>
                      <p className="font-semibold text-deep-plum text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setPhase('quiz')}
                  className="btn-primary w-full text-base py-4"
                >
                  🔮 Comenzar el test (12 preguntas)
                </button>
              </>
            )}
          </div>
        )}

        {phase === 'quiz' && questions.length > 0 && (
          <div className="animate-fade-in">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Pregunta {currentQ + 1} de {questions.length}</span>
                <span className="text-sm font-medium text-rose-500">{Math.round(progress)}%</span>
              </div>
              <div className="bg-rose-100 rounded-full h-2">
                <div
                  className="bg-rose-400 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="card mb-4 animate-slide-up" key={currentQ}>
              <p className="font-serif text-xl text-deep-plum mb-6 leading-relaxed">
                {questions[currentQ].question}
              </p>
              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all hover:shadow-sm text-sm leading-relaxed
                      ${answers[currentQ] === opt.value
                        ? 'border-rose-400 bg-rose-50 text-rose-700 font-medium'
                        : 'border-gray-200 hover:border-rose-200 text-gray-600'
                      }`}
                  >
                    <span className="text-rose-400 font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
              >
                ← Anterior
              </button>

              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(q => q + 1)}
                  disabled={!answers[currentQ]}
                  className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={answeredCount < questions.length || submitting}
                  className="btn-primary py-2.5 px-6 disabled:opacity-40"
                >
                  {submitting ? 'Calculando...' : '✨ Ver mi resultado'}
                </button>
              )}
            </div>

            {answeredCount < questions.length && currentQ === questions.length - 1 && (
              <p className="text-center text-xs text-amber-500 mt-3">
                Faltan {questions.length - answeredCount} respuestas · Puedes navegar atrás para completarlas
              </p>
            )}
          </div>
        )}

        {phase === 'result' && displayResult && (
          <div className="animate-fade-in">
            {/* Result header */}
            <div className={`border-2 ${style?.border} bg-gradient-to-br ${style?.bg} rounded-3xl p-8 text-center mb-6`}>
              <div className="text-6xl mb-4 animate-float inline-block">{displayResult.type.emoji}</div>
              <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-1">Tu hijo/a es un/a</p>
              <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: displayResult.type.color }}>
                {displayResult.type.name}
              </h1>
              <p className="italic text-gray-600 text-lg">"{displayResult.type.tagline}"</p>
            </div>

            {/* Description */}
            <div className="card mb-4">
              <h2 className="font-serif text-xl text-deep-plum mb-3">¿Qué significa esto?</h2>
              <p className="text-gray-600 leading-relaxed">{displayResult.type.description}</p>
            </div>

            {/* Characteristics */}
            <div className="card mb-4">
              <h2 className="font-serif text-xl text-deep-plum mb-4">Características principales</h2>
              <div className="space-y-2">
                {displayResult.type.characteristics.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0" style={{ color: displayResult.type.color }}>✦</span>
                    <p className="text-gray-600 text-sm">{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parenting tips */}
            <div className="card mb-6">
              <h2 className="font-serif text-xl text-deep-plum mb-4">Cómo acompañarle desde el Método MAJHO</h2>
              <div className="space-y-3">
                {displayResult.type.parenting_tips.map((tip, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${style?.badge?.replace('text-', 'bg-').split(' ')[0]} bg-opacity-30`}>
                    <span className="font-bold text-sm flex-shrink-0" style={{ color: displayResult.type.color }}>
                      {i + 1}.
                    </span>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scores */}
            {displayResult.result?.scores && (
              <div className="card mb-6">
                <h3 className="font-serif text-lg text-deep-plum mb-4">Distribución de energías</h3>
                {Object.entries(displayResult.result.scores).map(([key, score]) => {
                  const types = { I: 'Índigo 💙', C: 'Cristal 💜', A: 'Arcoíris 🌈', D: 'Diamante 💎' };
                  const pct = Math.round((score / questions.length) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 w-24 flex-shrink-0">{types[key]}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, backgroundColor: displayResult.type.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-500 w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={restart} className="btn-secondary flex-1">
                🔄 Repetir test
              </button>
              <Link to={myModuleLink} className="btn-primary flex-1 text-center">
                Ir a mi módulo →
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
