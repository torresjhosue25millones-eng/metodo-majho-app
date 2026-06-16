import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AGE_STAGES = [
  { value: 'embarazo', label: 'Embarazo', icon: '🤰', desc: 'Bebé en camino' },
  { value: '0-2', label: '0 a 2 años', icon: '👶', desc: 'Bebé e infante' },
  { value: '2-6', label: '2 a 6 años', icon: '🌱', desc: 'Primera infancia' },
  { value: '6-12', label: '6 a 12 años', icon: '✨', desc: 'Niñez media' },
  { value: '12-17', label: '12 a 17 años', icon: '🌟', desc: 'Adolescencia' },
];

const REG_STEPS = ['Tu cuenta', 'Tu hijo/a', 'Carta astral'];

function LogoHeader() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-block">
        {!failed ? (
          <img src="/assets/logo-majho.png" alt="Método MAJHO" className="h-16 mx-auto"
            onError={() => setFailed(true)} />
        ) : (
          <span className="text-5xl animate-float inline-block">🌸</span>
        )}
      </Link>
    </div>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('tab') === 'registro' ? 'register' : 'login');

  // ── Login state ────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Register state ─────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [mama, setMama] = useState({ name: '', email: '', password: '' });
  const [child, setChild] = useState({ name: '', age_stage: '', birth_date: '', birth_time: '', birth_city: '', birth_country: '' });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [emailExists, setEmailExists] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // ── Login handlers ─────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus datos.');
    } finally {
      setLoginLoading(false);
    }
  }

  function switchToLogin(email) {
    setMode('login');
    if (email) setLoginForm(f => ({ ...f, email }));
    setLoginError('');
    setEmailExists('');
  }

  // ── Register handlers ──────────────────────────────────────
  function handleStep1(e) {
    e.preventDefault();
    setRegError('');
    if (mama.password.length < 6) return setRegError('La contraseña debe tener al menos 6 caracteres');
    setStep(2);
  }

  function handleStep2(e) {
    e.preventDefault();
    setStep(3);
  }

  async function handleRegister(e) {
    if (e) e.preventDefault();
    setRegError('');
    setEmailExists('');
    setRegLoading(true);
    try {
      await register({ name: mama.name, email: mama.email, password: mama.password, children_count: child.name ? 1 : 0 });
      if (child.name) {
        const birthPlace = [child.birth_city, child.birth_country].filter(Boolean).join(', ') || null;
        const isEmbarazo = child.age_stage === 'embarazo';
        try {
          await api.post('/children', {
            name: child.name,
            age_stage: child.age_stage || null,
            ...(isEmbarazo ? {
              mother_birth_date: child.birth_date || null,
              mother_birth_time: child.birth_time || null,
              mother_birth_place: birthPlace,
            } : {
              birth_date: child.birth_date || null,
              birth_time: child.birth_time || null,
              birth_place: birthPlace,
            }),
          });
        } catch {
          // Usuario ya registrado, continuar aunque falle el hijo
        }
      }
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error
        || (!err.response ? 'No se pudo conectar al servidor. Verifica que el servidor esté activo.' : 'Error al crear la cuenta');
      if (status === 409) {
        setEmailExists(mama.email);
        setRegError('Este email ya tiene una cuenta.');
      } else {
        setRegError(msg);
        setStep(1);
      }
    } finally {
      setRegLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setLoginError('');
    setRegError('');
    setEmailExists('');
    if (newMode === 'register') setStep(1);
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        <LogoHeader />

        {/* Tabs */}
        <div className="flex rounded-2xl bg-white/15 p-1 mb-6 gap-1">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* ── LOGIN ──────────────────────────────────────── */}
          {mode === 'login' && (
            <>
              <h2 className="font-serif text-2xl text-deep-plum mb-6 text-center">Bienvenida de vuelta</h2>
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-deep-plum mb-1.5">Email</label>
                  <input
                    type="email" required placeholder="tu@email.com" className="input-field"
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-deep-plum mb-1.5">Contraseña</label>
                  <input
                    type="password" required placeholder="••••••••" className="input-field"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <button
                  type="submit" disabled={loginLoading}
                  className="btn-primary w-full text-base py-3.5 disabled:opacity-60"
                >
                  {loginLoading ? 'Entrando...' : 'Entrar a mi espacio 🌿'}
                </button>
              </form>
              <p className="text-center mt-5 text-gray-400 text-sm">
                ¿Eres nueva?{' '}
                <button onClick={() => switchMode('register')} className="text-rose-500 font-medium hover:text-rose-700">
                  Crea tu cuenta
                </button>
              </p>
            </>
          )}

          {/* ── REGISTER ───────────────────────────────────── */}
          {mode === 'register' && (
            <>
              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {REG_STEPS.map((label, i) => {
                  const s = i + 1;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                          ${step > s ? 'bg-rose-500 text-white' : step === s ? 'bg-rose-500 text-white ring-2 ring-rose-200' : 'bg-gray-100 text-gray-400'}`}>
                          {step > s ? '✓' : s}
                        </div>
                        <span className={`text-xs mt-1 ${step >= s ? 'text-rose-600' : 'text-gray-300'}`}>{label}</span>
                      </div>
                      {s < 3 && <div className={`w-8 h-0.5 mb-4 transition-all ${step > s ? 'bg-rose-400' : 'bg-gray-200'}`} />}
                    </div>
                  );
                })}
              </div>

              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                  {regError}
                  {emailExists && (
                    <button
                      onClick={() => switchToLogin(emailExists)}
                      className="block mt-2 text-rose-600 font-semibold text-xs underline"
                    >
                      → Iniciar sesión con {emailExists}
                    </button>
                  )}
                </div>
              )}

              {/* Step 1: Account */}
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
                  <p className="text-center text-gray-400 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="text-rose-500 font-medium">
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}

              {/* Step 2: Child */}
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

              {/* Step 3: Carta astral */}
              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="bg-rose-50 rounded-2xl p-4 mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🌠</span>
                      <div>
                        {child.age_stage === 'embarazo' ? (
                          <>
                            <p className="font-semibold text-deep-plum text-sm">Datos para tu Carta Astral</p>
                            <p className="text-gray-500 text-xs mt-0.5">Opcionales — personalizan tu camino como mamá.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-deep-plum text-sm">Datos para la Carta Astral de tu hijo/a</p>
                            <p className="text-gray-500 text-xs mt-0.5">Opcionales — personalizan aún más el camino de tu hijo/a.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-plum mb-1.5">
                      {child.age_stage === 'embarazo' ? 'Tu fecha de nacimiento' : 'Fecha de nacimiento'}{' '}
                      <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input type="date" className="input-field"
                      value={child.birth_date} onChange={e => setChild(c => ({ ...c, birth_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-plum mb-1.5">
                      {child.age_stage === 'embarazo' ? 'Tu hora de nacimiento' : 'Hora de nacimiento'}{' '}
                      <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input type="time" className="input-field"
                      value={child.birth_time} onChange={e => setChild(c => ({ ...c, birth_time: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-plum mb-1.5">
                      {child.age_stage === 'embarazo' ? 'Tu ciudad de nacimiento' : 'Ciudad de nacimiento'}{' '}
                      <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input placeholder="Ej: Bogotá" className="input-field"
                      value={child.birth_city} onChange={e => setChild(c => ({ ...c, birth_city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-deep-plum mb-1.5">
                      {child.age_stage === 'embarazo' ? 'Tu país' : 'País'}{' '}
                      <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input placeholder="Ej: Colombia" className="input-field"
                      value={child.birth_country} onChange={e => setChild(c => ({ ...c, birth_country: e.target.value }))} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Atrás</button>
                    <button type="submit" disabled={regLoading} className="btn-primary flex-1 py-3 disabled:opacity-60">
                      {regLoading ? 'Creando...' : 'Comenzar 🌿'}
                    </button>
                  </div>
                  <button type="button" onClick={() => handleRegister(null)} disabled={regLoading}
                    className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors">
                    Omitir y comenzar
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
