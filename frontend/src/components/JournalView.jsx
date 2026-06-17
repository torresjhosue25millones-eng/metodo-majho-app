import { useEffect, useState } from 'react';
import api from '../services/api';

const moods = [
  { value: 'serena', label: 'Serena', emoji: '😌' },
  { value: 'alegre', label: 'Alegre', emoji: '😊' },
  { value: 'agradecida', label: 'Agradecida', emoji: '🙏' },
  { value: 'reflexiva', label: 'Reflexiva', emoji: '🤔' },
  { value: 'cansada', label: 'Cansada', emoji: '😴' },
  { value: 'amorosa', label: 'Amorosa', emoji: '💜' },
];

function EntryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', content: '', mood: 'serena', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  function addTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card animate-slide-up">
      <h3 className="font-serif text-xl text-deep-plum mb-4">
        {initial ? 'Editar entrada' : '✍️ Nueva entrada'}
      </h3>
      <div className="space-y-4">
        <input
          required
          placeholder="Título de tu reflexión..."
          className="input-field"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
        <textarea
          required
          rows={6}
          placeholder="Escribe desde tu corazón... ¿Cómo estuvo hoy tu camino de mamá? ¿Qué aprendiste? ¿Qué sientes?"
          className="input-field resize-none"
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />

        <div>
          <p className="text-sm font-medium text-deep-plum mb-2">¿Cómo te sientes hoy?</p>
          <div className="flex flex-wrap gap-2">
            {moods.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border-2 transition-all
                  ${form.mood === m.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600 font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-rose-200'
                  }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-deep-plum mb-2">Etiquetas (Enter para agregar)</p>
          <input
            placeholder="gratitud, aprendizaje, maternidad..."
            className="input-field"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="badge bg-rose-100 text-rose-600">
                  {tag}
                  <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))} className="ml-1 hover:text-rose-800">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Guardando...' : '💜 Guardar entrada'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </form>
  );
}

export default function JournalView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/journal').then(res => setEntries(res.data.entries)).finally(() => setLoading(false));
  }, []);

  async function handleCreate(form) {
    const res = await api.post('/journal', form);
    setEntries(prev => [res.data.entry, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(form) {
    const res = await api.put(`/journal/${editingEntry.id}`, form);
    setEntries(prev => prev.map(e => e.id === editingEntry.id ? res.data.entry : e));
    setEditingEntry(null);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta entrada?')) return;
    await api.delete(`/journal/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const moodMap = Object.fromEntries(moods.map(m => [m.value, m]));

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Mi Diario Espiritual</h1>
          <p className="text-gray-500">Un espacio íntimo para tu reflexión como mamá.</p>
        </div>
        {!showForm && !editingEntry && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Nueva entrada
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <EntryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingEntry && (
        <div className="mb-6">
          <EntryForm
            initial={editingEntry}
            onSave={handleUpdate}
            onCancel={() => setEditingEntry(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><div className="text-4xl animate-float">✍️</div></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">📓</div>
          <h3 className="font-serif text-xl text-deep-plum mb-2">Tu diario está vacío</h3>
          <p className="text-gray-400 mb-6">Escribe tu primera reflexión desde el corazón.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Escribir mi primera entrada</button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const mood = moodMap[entry.mood];
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="card animate-fade-in">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{mood?.emoji || '📝'}</span>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-deep-plum">{entry.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {mood?.label} · {new Date(entry.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {!isExpanded && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{entry.content}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 ml-2">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-rose-100 animate-fade-in">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    {entry.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {entry.tags.map(tag => (
                          <span key={tag} className="badge bg-rose-50 text-rose-500 text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => { setEditingEntry(entry); setExpandedId(null); }}
                        className="text-sm text-plum-500 hover:text-plum-700 font-medium"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-sm text-red-400 hover:text-red-600 font-medium"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
