import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const categories = [
  { value: '', label: 'Todas', emoji: '✨' },
  { value: 'autoamor', label: 'Autoamor', emoji: '💜' },
  { value: 'presencia', label: 'Presencia', emoji: '🧘‍♀️' },
  { value: 'confianza', label: 'Confianza', emoji: '🌟' },
  { value: 'amor', label: 'Amor', emoji: '❤️' },
  { value: 'hogar', label: 'Hogar', emoji: '🏡' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🌸' },
  { value: 'espiritualidad', label: 'Espiritualidad', emoji: '🙏' },
];

export default function Affirmations() {
  const [affirmations, setAffirmations] = useState([]);
  const [daily, setDaily] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/affirmations/daily').then(res => setDaily(res.data.affirmation));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = category ? `/affirmations?category=${category}` : '/affirmations';
    api.get(url).then(res => setAffirmations(res.data.affirmations)).finally(() => setLoading(false));
  }, [category]);

  async function toggleFavorite(id) {
    const res = await api.post(`/affirmations/${id}/favorite`);
    setAffirmations(prev =>
      prev.map(a => a.id === id ? { ...a, is_favorite: res.data.is_favorite } : a)
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="section-title mb-2">Afirmaciones para Mamás</h1>
          <p className="text-gray-500">Palabras que nutren tu alma y fortalecen tu camino.</p>
        </div>

        {/* Daily card */}
        {daily && (
          <div className="bg-hero-gradient rounded-3xl p-8 text-white mb-8 animate-fade-in relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20">✨</div>
            <p className="text-rose-200 text-xs uppercase tracking-widest mb-3 font-medium">
              Tu afirmación de hoy
            </p>
            <p className="font-serif text-2xl italic leading-relaxed mb-3">
              "{daily.text}"
            </p>
            <p className="text-rose-300 text-sm">— {daily.author}</p>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all
                ${category === c.value
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-rose-200 text-gray-600 hover:border-rose-300 bg-white'
                }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16"><div className="text-4xl animate-float">✨</div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affirmations.map((a, i) => (
              <div
                key={a.id}
                className="card bg-gradient-to-br from-rose-50 to-plum-50 border-rose-100 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-serif text-lg text-deep-plum italic leading-relaxed flex-1">
                    "{a.text}"
                  </p>
                  <button
                    onClick={() => toggleFavorite(a.id)}
                    className={`text-2xl transition-transform hover:scale-125 flex-shrink-0
                      ${a.is_favorite ? 'text-rose-500' : 'text-gray-300'}`}
                  >
                    {a.is_favorite ? '💜' : '🤍'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="badge bg-rose-100 text-rose-500 text-xs">
                    {categories.find(c => c.value === a.category)?.emoji} {a.category}
                  </span>
                  <span className="text-xs text-gray-400">{a.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
