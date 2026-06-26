import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SCALE = [1, 2, 3, 4, 5];

export default function MonthlyCheckinModal({ child, onClose }) {
  const [connection, setConnection] = useState(0);
  const [evolution, setEvolution] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    if (!connection || !evolution || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/checkins', {
        child_id: child.id,
        connection_score: connection,
        evolution_score: evolution,
      });
      setResult(res.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full animate-slide-up">
        {!result ? (
          <>
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🌙</span>
              <h2 className="font-serif text-xl text-deep-plum mb-1">Check-in mensual</h2>
              <p className="text-gray-500 text-sm">
                Un momento para reconocer la evolución de {child.name} y de tu conexión con él/ella.
              </p>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-deep-plum mb-2">
                ¿Cómo sientes tu conexión con {child.name} este mes?
              </p>
              <div className="flex gap-2 justify-between">
                {SCALE.map(n => (
                  <button key={n} onClick={() => setConnection(n)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                      ${connection === n ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-400 hover:border-rose-200'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Distante</span><span>Muy conectada</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-deep-plum mb-2">
                ¿Cómo percibes la evolución de {child.name} este mes?
              </p>
              <div className="flex gap-2 justify-between">
                {SCALE.map(n => (
                  <button key={n} onClick={() => setEvolution(n)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                      ${evolution === n ? 'border-plum-400 bg-plum-50 text-plum-600' : 'border-gray-200 text-gray-400 hover:border-plum-200'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Igual que antes</span><span>Mucho avance</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => onClose(false)} className="btn-secondary flex-1">Ahora no</button>
              <button onClick={handleSubmit} disabled={!connection || !evolution || submitting}
                className="btn-primary flex-1 disabled:opacity-50">
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Quedará pendiente y disponible cuando quieras completarlo.
            </p>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <span className="text-5xl mb-4 block">{result.decision === 'advance' ? '🌟' : '🌙'}</span>
            <p className="text-deep-plum leading-relaxed mb-6">{result.message}</p>
            {result.decision === 'advance' && result.new_module ? (
              <Link to={`/modulos/${result.new_module.id}`} onClick={() => onClose(true)} className="btn-primary inline-block">
                Ir a {result.new_module.title} →
              </Link>
            ) : (
              <button onClick={() => onClose(true)} className="btn-primary">Continuar</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
