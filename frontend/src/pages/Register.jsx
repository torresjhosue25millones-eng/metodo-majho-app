import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AGE_STAGES = [
  { value: 'embarazo', label: 'Embarazo', icon: '🤰', desc: 'Bebé en camino' },
  { value: '0-2', label: '0 a 2 años', icon: '👶', desc: 'Bebé e infante' },
  { value: '2-6', label: '2 a 6 años', icon: '🌱', desc: 'Primera infancia' },
  { value: '6-12', label: '6 a 12 años', icon: '✨', desc: 'Niñez media' },
  { value: '12-17', label: '12 a 17 años', icon: '🌟', desc: 'Adolescencia' },
];

const STEPS = ['Tu cuenta', 'Tu hijo/a', 'Carta astral'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [mama, setMama] = useState({ name: '', email: '', password: '' });
  const [child, setChild] = useState({ name: '', age_stage: '', birth_date: '', birth_time: '', birth_place: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleStep1(e) {
    e.preventDefault();
    setError('');
    if (mama.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setStep(2);
  }

  function handleStep2(e) {
    e.preventDefault();
    setStep(3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ name: mama.name, email: mama.email, password: mama.password, children_count: child.name ? 1 : 0 });
      if (child.name) {
        await api.post('/children', {
          name: child.name,
          age_stage: child.age_stage || null,
          birth_date: child.birth_date || null,
          birth_time: child.birth_time || null,
          birth_place: child.birth_place || null,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-6">
          <Link to="/"><span className="text-5xl animate-float inline-block">🌸</span></Link>
          <h1 className="font-serif text-3xl text-white mt-4 mb-1">
            {step === 1 ? 'Comienza tu camino' : step === 2 ? 'Tu hijo/a' : 'Carta Astral'}
          </h1>
          <p className="text-rose-200 text-sm">
            {step === 1 ? 'La maternidad consciente te espera' : step === 2 ? 'Para personalizar tu experiencia' : 'Para su mapa espiritual (opcional)'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${step > s ? 'bg-white text-rose-600' : step === s ? 'bg-white text-rose-600 ring-2 ring-white/40 ring-offset-2 ring-offset-transparent' : 'bg-white/20 text-white/50'}`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s ? 'text-white' : 'text-white/40'}`}>{label}</span>
                </div>
                {s < 3 && <div className={`w-10 h-0.5 mb-4 transition-all ${step > s ? 'bg-white' : 'bg-white/20'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
          )}

          {/* STEP 1: Account */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">Tu nombre</label>
                <input required placeholder="¿Cómo te llamamos, mamá?" className="input-field"
                  value={mama.name} onChange={e => setMama(m => ({ ...m, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">Email</label>
                <input type="email" required placeholder="tu@email.com" className="input-field"
                  value={mama.email} onChange={e => setMama(m => ({ ...m, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">Contraseña</label>
                <input type="password" required placeholder="Mínimo 6 caracteres" className="input-field"
                  value={mama.password} onChange={e => setMama(m => ({ ...m, password: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary w-full py-3.5">Siguiente →</button>
              <p className="text-center text-gray-500 text-sm">
                ¿Ya tienes cuenta? <Link to="/login" className="text-rose-500 font-medium">Entrar</Link>
              </p>
            </form>
          )}

          {/* STEP 2: Child info */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">
                  Nombre de tu hijo/a <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input placeholder="¿Cómo se llama?" className="input-field"
                  value={child.name} onChange={e => setChild(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-2">Etapa de vida</label>
                <div className="grid grid-cols-1 gap-2">
                  {AGE_STAGES.map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setChild(c => ({ ...c, age_stage: s.value }))}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all
                        ${child.age_stage === s.value ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}>
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className={`font-medium text-sm ${child.age_stage === s.value ? 'text-rose-600' : 'text-deep-plum'}`}>{s.label}</p>
                        <p className="text-xs text-gray-400">{s.desc}</p>
                      </div>
                      {child.age_stage === s.value && <span className="ml-auto text-rose-500 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Atrás</button>
                <button type="submit" className="btn-primary flex-1">Siguiente →</button>
              </div>
            </form>
          )}

          {/* STEP 3: Carta astral */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gradient-to-br from-plum-50 to-rose-50 rounded-2xl p-4 mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌠</span>
                  <div>
                    <p className="font-semibold text-deep-plum text-sm">Datos para la Carta Astral</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      La fecha, hora y lugar de nacimiento nos permite calcular el mapa astral de tu hijo/a para personalizar aún más su camino espiritual. Son opcionales.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">
                  Fecha de nacimiento <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input type="date" className="input-field"
                  value={child.birth_date} onChange={e => setChild(c => ({ ...c, birth_date: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">
                  Hora de nacimiento <span className="text-gray-400 font-normal">(opcional · para el Ascendente)</span>
                </label>
                <input type="time" className="input-field"
                  value={child.birth_time} onChange={e => setChild(c => ({ ...c, birth_time: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">La hora define el Ascendente y las Casas Astrológicas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">
                  Lugar de nacimiento <span className="text-gray-400 font-normal">(opcional · ciudad y país)</span>
                </label>
                <input placeholder="Ej: Buenos Aires, Argentina" className="input-field"
                  value={child.birth_place} onChange={e => setChild(c => ({ ...c, birth_place: e.target.value }))} />
                <p className="text-xs text-gray-400 mt-1">La ubicación determina la posición exacta de los planetas</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Atrás</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
                  {loading ? 'Creando...' : 'Comenzar 🌸'}
                </button>
              </div>
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors">
                Omitir y comenzar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
