import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AGE_ICONS = {
  'embarazo': '🤰',
  '0-2': '👶',
  '3-7': '🌱',
  '8-12': '✨',
  '13-18': '🌟',
};

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/modules'),
      api.get('/children'),
    ]).then(([modRes, childRes]) => {
      setModules(modRes.data.modules);
      setChildren(childRes.data.children);
    }).finally(() => setLoading(false));
  }, []);

  // Determine recommended modules based on children's age stages
  const recommendedStages = new Set(children.map(c => c.age_stage).filter(Boolean));

  const sortedModules = [...modules].sort((a, b) => {
    const aRec = recommendedStages.has(a.age_range) ? -1 : 1;
    const bRec = recommendedStages.has(b.age_range) ? -1 : 1;
    return aRec - bRec;
  });

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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="section-title mb-2">Módulos del Método MAJHO</h1>
          <p className="text-gray-500">
            5 módulos por etapa de vida · Acompañamiento consciente desde el embarazo hasta la adolescencia.
          </p>
        </div>

        {/* Recommendation banner */}
        {recommendedStages.size > 0 && (
          <div className="bg-gradient-to-r from-rose-50 to-plum-50 border-2 border-rose-200 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl">⭐</span>
            <p className="text-sm text-gray-600">
              Los módulos marcados con{' '}
              <span className="font-semibold text-rose-500">Recomendado</span>{' '}
              corresponden a la etapa actual de tu hijo/a.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedModules.map((m, i) => {
            const isRecommended = recommendedStages.has(m.age_range);
            return (
              <Link
                key={m.id}
                to={`/modulos/${m.id}`}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg group animate-fade-in
                  ${isRecommended
                    ? 'border-rose-300 bg-white shadow-md'
                    : 'border-gray-100 bg-white hover:border-rose-200'
                  }`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-4">
                    <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      ⭐ Recomendado
                    </span>
                  </div>
                )}

                {/* Module icon & age badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: m.color + '20' }}
                  >
                    {m.icon}
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: m.color + '20', color: m.color }}
                  >
                    {m.age_label}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-deep-plum mb-1 group-hover:text-rose-600 transition-colors">
                  {m.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3 font-medium">{m.subtitle}</p>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
                  {m.description}
                </p>

                {/* Progress bar */}
                <div className="bg-gray-100 rounded-full h-1.5 mb-2">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${m.progress_pct}%`, backgroundColor: m.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{m.completed_lessons}/{m.lessons_count} lecciones</span>
                  <span className="font-semibold" style={{ color: m.color }}>
                    {m.progress_pct > 0 ? `${m.progress_pct}%` : 'Sin empezar'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA to questionnaire */}
        <div className="mt-10 bg-hero-gradient rounded-3xl p-8 text-white text-center animate-fade-in">
          <span className="text-4xl mb-3 block">🔮</span>
          <h2 className="font-serif text-2xl font-bold mb-2">¿Qué tipo de niño/a es el tuyo?</h2>
          <p className="text-rose-100 mb-5">
            Descubre si es Índigo, Cristal, Arcoíris o Diamante con nuestro Test de Vibración.
          </p>
          <Link
            to="/cuestionario"
            className="bg-white text-rose-600 font-semibold px-8 py-3 rounded-full hover:bg-rose-50 transition-all inline-block"
          >
            Hacer el test →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
