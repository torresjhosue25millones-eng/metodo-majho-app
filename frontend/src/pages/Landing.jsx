import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function LogoImg({ className = 'h-10 w-auto' }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <span className="text-2xl">🌸</span>
    : <img src="/assets/logo-majho.png" alt="Método MAJHO" className={className} onError={() => setFailed(true)} />;
}

const pillars = [
  { letter: 'M', title: 'Mindfulness', desc: 'Consciencia plena en cada momento con tu hijo/a', color: 'bg-rose-50 border-rose-200', accent: 'text-rose-600' },
  { letter: 'A', title: 'Amor Incondicional', desc: 'El fundamento sagrado de toda crianza consciente', color: 'bg-plum-50 border-plum-200', accent: 'text-plum-500' },
  { letter: 'J', title: 'Juego Sagrado', desc: 'El juego como lenguaje del alma y camino de aprendizaje', color: 'bg-gold-300/20 border-gold-400', accent: 'text-gold-600' },
  { letter: 'H', title: 'Hogar como Templo', desc: 'Tu espacio físico como reflejo de tu espacio interior', color: 'bg-amber-50 border-amber-200', accent: 'text-amber-700' },
  { letter: 'O', title: 'Origen Espiritual', desc: 'La sabiduría ancestral de la maternidad sagrada', color: 'bg-teal-50 border-teal-200', accent: 'text-teal-600' },
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
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoImg className="h-10 w-auto" />
            <span className="font-serif font-bold text-deep-plum text-lg">Método MAJHO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
            <Link to="/registro" className="btn-primary text-sm py-2 px-5">Comenzar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-hero-gradient text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🌸</div>
          <div className="absolute bottom-10 right-10 text-8xl">✨</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">💜</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <p className="text-rose-200 text-sm font-medium tracking-widest uppercase mb-4">Crianza Consciente Espiritual</p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            La Maternidad como<br />
            <span className="text-rose-200">Camino Sagrado</span>
          </h1>
          <p className="text-rose-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            El Método MAJHO te acompaña a transformar la crianza en una práctica espiritual profunda.
            Descubre la mamá consciente que ya eres.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registro" className="bg-white text-rose-600 font-semibold px-8 py-4 rounded-full hover:bg-rose-50 transition-all shadow-lg text-lg">
              Comenzar mi camino
            </Link>
            <Link to="/login" className="border border-white/40 text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all text-lg">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Los 5 Pilares del Método MAJHO</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Cada letra de MAJHO representa un pilar sagrado que juntos forman un camino completo de crianza consciente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pillars.map(p => (
              <div key={p.letter} className={`border-2 ${p.color} rounded-2xl p-6 text-center hover:shadow-md transition-all`}>
                <div className={`text-4xl font-serif font-bold mb-2 ${p.accent}`}>{p.letter}</div>
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
      <section className="bg-hero-gradient text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Tu Camino Comienza Aquí</h2>
          <p className="text-rose-100 text-lg mb-10">
            Únete a nuestra comunidad de mamás que están transformando su crianza con consciencia y espiritualidad.
          </p>
          <Link to="/registro" className="bg-white text-rose-600 font-bold px-10 py-4 rounded-full hover:bg-rose-50 transition-all shadow-xl text-lg inline-block">
            Comenzar gratis 🌸
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-plum text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <LogoImg className="h-10 w-auto brightness-0 invert" />
          </div>
          <p className="text-rose-200 text-sm">Con amor para todas las mamás en su camino sagrado</p>
        </div>
      </footer>
    </div>
  );
}
