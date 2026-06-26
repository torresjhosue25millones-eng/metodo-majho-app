import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { resolveHomeRoute } from '../utils/resolveHome';

function LogoImg({ invert = false }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <span className="text-2xl">🌸</span>
    : <img src="/assets/logo-majho.png" alt="Método MAJHO" style={{ height: 70, width: 'auto', filter: invert ? 'brightness(0) invert(1)' : 'none' }} onError={() => setFailed(true)} />;
}

const pillars = [
  {
    icon: '🧠', title: 'Neurociencia',
    desc: 'Cómo funciona el cerebro de tu hijo/a en cada etapa: regulación emocional y desarrollo neurológico.',
    color: 'bg-rose-50 border-rose-200', accent: 'text-rose-600',
  },
  {
    icon: '💭', title: 'Psicología Infantil',
    desc: 'Comprensión real del desarrollo emocional y comportamental de tu hijo/a según su edad.',
    color: 'bg-gold-300/20 border-gold-400', accent: 'text-gold-600',
  },
  {
    icon: '🗣️', title: 'PNL Infantil',
    desc: 'Lenguaje y comunicación consciente entre madre e hijo/a; reprogramación de patrones limitantes.',
    color: 'bg-plum-50 border-plum-200', accent: 'text-plum-500',
  },
  {
    icon: '🪶', title: 'Sabiduría Ancestral',
    desc: 'Prácticas y conocimientos heredados de generaciones, integrados en armonía con la ciencia.',
    style: { backgroundColor: '#F2C4CE22', borderColor: '#F2C4CE' }, accentStyle: { color: '#C9748A' },
  },
];

const testimonials = [
  { name: 'María González', text: 'El Método MAJHO transformó mi manera de ver la maternidad. Pasé del agotamiento a encontrar sagrado cada momento con mi hija.', emoji: '🌸' },
  { name: 'Ana Lucía Mendoza', text: 'Gracias a este método, aprendí a estar presente de verdad. Mi relación con mis hijos cambió completamente.', emoji: '💜' },
  { name: 'Sofía Ramírez', text: 'Por primera vez siento que soy exactamente la madre que mis hijos necesitan. Este método me devolvió mi confianza.', emoji: '✨' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) resolveHomeRoute().then(navigate);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoImg />
            <span className="font-serif font-bold text-deep-plum text-lg">Método MAJHO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
            <Link to="/registro" className="btn-primary text-sm py-2 px-5">Comenzar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-4 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 25% 15%, rgba(255,255,255,0.45), transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25), transparent 50%),
            linear-gradient(135deg, #F5F0E8 0%, #C49A3C 100%)
          `,
        }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🌸</div>
          <div className="absolute bottom-10 right-10 text-8xl">✨</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">💜</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: '#2E2820', opacity: 0.7 }}>Crianza Consciente Espiritual</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#2E2820' }}>
            La Maternidad como<br />
            Camino Sagrado
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#2E2820' }}>
            El Método MAJHO te acompaña a transformar la crianza en una práctica espiritual profunda.
            Descubre la mamá consciente que ya eres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registro" className="bg-white font-semibold px-8 py-4 rounded-full hover:bg-cream transition-all shadow-lg text-lg" style={{ color: '#2E2820' }}>
              Comenzar mi camino
            </Link>
            <Link to="/login" className="border px-8 py-4 rounded-full hover:bg-white/30 transition-all text-lg" style={{ borderColor: 'rgba(46,40,32,0.3)', color: '#2E2820' }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Los 4 Pilares del Método MAJHO</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Cuatro pilares que se entrelazan para formar un camino completo de crianza consciente,
              integrando ciencia y sabiduría ancestral.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map(p => (
              <div key={p.title}
                className={`border-2 ${p.color || ''} rounded-2xl p-6 text-center hover:shadow-md transition-all`}
                style={p.style}>
                <div className={`text-4xl mb-2 ${p.accent || ''}`} style={p.accentStyle}>{p.icon}</div>
                <h3 className="font-semibold text-deep-plum text-sm mb-2">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-spiritual py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Tu Espacio de Crecimiento</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📖', title: 'Módulos Guiados', desc: 'Accede a 22 lecciones organizadas en los 5 pilares del método, con contenido profundo y práctico.' },
              { icon: '✍️', title: 'Diario Espiritual', desc: 'Un espacio íntimo para reflexionar, escribir y acompañar tu proceso como mamá consciente.' },
              { icon: '✨', title: 'Afirmaciones Diarias', desc: 'Mantras y afirmaciones seleccionadas para nutrir tu autoestima y reconectar con tu esencia materna.' },
            ].map(f => (
              <div key={f.title} className="card text-center hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl text-deep-plum mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Voces de Mamás MAJHO</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card">
                <div className="text-3xl mb-4">{t.emoji}</div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">"{t.text}"</p>
                <p className="font-semibold text-rose-500 text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6" style={{ color: '#C49A3C' }}>Tu Camino Comienza Aquí</h2>
          <p className="text-cream text-lg mb-10">
            Únete a nuestra comunidad de mamás que están transformando su crianza con consciencia y espiritualidad.
          </p>
          <Link to="/registro" className="bg-white font-bold px-10 py-4 rounded-full hover:bg-cream transition-all shadow-xl text-lg inline-block" style={{ color: '#6B7A55' }}>
            Comenzar mi camino 🌸
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#6B7A55' }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LogoImg />
          </div>
          <div className="flex items-center justify-center gap-5 mb-4 text-cream">
            <a href="https://www.instagram.com/majho_holistic/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.facebook.com/?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-70 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1 0 2.1.2 2.1.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="https://wa.me/50762654830" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:opacity-70 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.6 14.2c-.2.6-1.4 1.2-2 1.3-.5.1-1.1.1-1.8-.1a14 14 0 0 1-5-3.1 9.7 9.7 0 0 1-2-2.8c-.5-.9-.2-1.4 0-1.8l.6-.7c.2-.2.3-.4.5-.1l1 1.6c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.4.8 1 1.5 1.7 2.1.7.6 1.5 1.1 2.3 1.4.2.1.4.1.5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.9c.2.1.3.2.2.4-.1.4-.2.7-.2 1z" />
              </svg>
            </a>
          </div>
          <p className="text-cream text-sm">Con amor para todas las mamás en su camino sagrado</p>
        </div>
      </footer>
    </div>
  );
}
