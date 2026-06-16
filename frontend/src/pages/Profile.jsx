import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AGE_STAGES = [
  { value: 'embarazo', label: 'Embarazo', icon: '🤰' },
  { value: '0-2', label: '0 a 2 años', icon: '👶' },
  { value: '3-7', label: '3 a 7 años', icon: '🌱' },
  { value: '8-12', label: '8 a 12 años', icon: '✨' },
  { value: '13-18', label: '13 a 18 años', icon: '🌟' },
];

const TYPE_LABELS = {
  I: { name: 'Índigo', emoji: '💙' },
  C: { name: 'Cristal', emoji: '💜' },
  A: { name: 'Arcoíris', emoji: '🌈' },
  D: { name: 'Diamante', emoji: '💎' },
};

function ChildCard({ child, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: child.name, age_stage: child.age_stage || '', birth_date: child.birth_date || '' });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await onUpdate(child.id, form);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }

  const typeKey = child.vibration_type;
  const typeInfo = typeKey ? TYPE_LABELS[typeKey] : null;

  return (
    <div className="border-2 border-rose-100 rounded-2xl p-5 bg-white">
      {editing ? (
        <div className="space-y-3">
          <input
            className="input-field text-sm"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre"
          />
          <select
            className="input-field text-sm"
            value={form.age_stage}
            onChange={e => setForm(f => ({ ...f, age_stage: e.target.value }))}
          >
            <option value="">Seleccionar etapa</option>
            {AGE_STAGES.map(s => (
              <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
            ))}
          </select>
          <input
            type="date"
            className="input-field text-sm"
            value={form.birth_date}
            onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={loading} className="btn-primary py-2 px-4 text-sm flex-1">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-hero-gradient flex items-center justify-center text-white font-serif text-lg font-bold flex-shrink-0">
              {child.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-deep-plum">{child.name}</p>
              {child.age_stage && (
                <p className="text-xs text-gray-400">
                  {AGE_STAGES.find(s => s.value === child.age_stage)?.icon} {AGE_STAGES.find(s => s.value === child.age_stage)?.label}
                </p>
              )}
              {typeInfo && (
                <p className="text-xs font-medium mt-0.5" style={{ color: '#9B8EC4' }}>
                  {typeInfo.emoji} Niño/a {typeInfo.name}
                </p>
              )}
              {child.astral_chart?.solar && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {child.astral_chart.solar.emoji} {child.astral_chart.solar.sign}
                  {child.astral_chart.lunar && ` · ${child.astral_chart.lunar.emoji} ${child.astral_chart.lunar.sign}`}
                  {child.astral_chart.ascendant && ` · ↑${child.astral_chart.ascendant.emoji} ${child.astral_chart.ascendant.sign}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-rose-500 transition-colors">
              ✏️
            </button>
            <button onClick={() => onDelete(child.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', children_count: user?.children_count || 0 });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', age_stage: '', birth_date: '', birth_time: '', birth_place: '' });
  const [addingChild, setAddingChild] = useState(false);

  useEffect(() => {
    api.get('/children').then(res => setChildren(res.data.children));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddChild(e) {
    e.preventDefault();
    if (!newChild.name) return;
    setAddingChild(true);
    try {
      const res = await api.post('/children', newChild);
      setChildren(prev => [...prev, res.data.child]);
      setNewChild({ name: '', age_stage: '', birth_date: '', birth_time: '', birth_place: '' });
      setShowAddChild(false);
    } finally {
      setAddingChild(false);
    }
  }

  async function handleUpdateChild(id, data) {
    const res = await api.put(`/children/${id}`, data);
    setChildren(prev => prev.map(c => c.id === id ? res.data.child : c));
  }

  async function handleDeleteChild(id) {
    if (!confirm('¿Eliminar este perfil?')) return;
    await api.delete(`/children/${id}`);
    setChildren(prev => prev.filter(c => c.id !== id));
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="section-title mb-8">Mi Perfil</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm animate-slide-up">
            ✅ Perfil actualizado con amor
          </div>
        )}

        {/* Avatar */}
        <div className="card mb-5 animate-fade-in">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-hero-gradient flex items-center justify-center text-white font-serif text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="font-serif text-2xl text-deep-plum">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-rose-400 text-sm mt-1">Mamá MAJHO desde {joinDate} 🌸</p>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="card mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl text-deep-plum">Información personal</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary py-2 px-4 text-sm">
                ✏️ Editar
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">Nombre</label>
                <input required className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-plum mb-1.5">Sobre mí</label>
                <textarea rows={3} placeholder="Tu camino de mamá..." className="input-field resize-none" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? 'Guardando...' : '💜 Guardar'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nombre</p>
                <p className="text-deep-plum font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <p className="text-deep-plum">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sobre mí</p>
                <p className="text-deep-plum">{user?.bio || <span className="text-gray-300 italic">Sin descripción</span>}</p>
              </div>
            </div>
          )}
        </div>

        {/* Children section */}
        <div className="card mb-5 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl text-deep-plum">Mis hijos/as</h3>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="btn-primary py-2 px-4 text-sm"
            >
              + Agregar
            </button>
          </div>

          {showAddChild && (
            <form onSubmit={handleAddChild} className="bg-rose-50 rounded-2xl p-4 mb-4 space-y-3 animate-slide-up">
              <h4 className="font-semibold text-deep-plum text-sm">Nuevo perfil</h4>
              <input
                required
                placeholder="Nombre de tu hijo/a"
                className="input-field text-sm"
                value={newChild.name}
                onChange={e => setNewChild(c => ({ ...c, name: e.target.value }))}
              />
              <select
                className="input-field text-sm"
                value={newChild.age_stage}
                onChange={e => setNewChild(c => ({ ...c, age_stage: e.target.value }))}
              >
                <option value="">¿En qué etapa están?</option>
                {AGE_STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                ))}
              </select>
              <input
                type="date"
                className="input-field text-sm"
                value={newChild.birth_date}
                onChange={e => setNewChild(c => ({ ...c, birth_date: e.target.value }))}
              />
              <input
                type="time"
                className="input-field text-sm"
                placeholder="Hora de nacimiento (opcional)"
                value={newChild.birth_time}
                onChange={e => setNewChild(c => ({ ...c, birth_time: e.target.value }))}
              />
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Ciudad de nacimiento (opcional)"
                value={newChild.birth_place}
                onChange={e => setNewChild(c => ({ ...c, birth_place: e.target.value }))}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={addingChild} className="btn-primary py-2 px-4 text-sm flex-1">
                  {addingChild ? 'Guardando...' : '+ Agregar'}
                </button>
                <button type="button" onClick={() => setShowAddChild(false)} className="btn-secondary py-2 px-4 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {children.length > 0 ? (
            <div className="space-y-3">
              {children.map(c => (
                <ChildCard key={c.id} child={c} onUpdate={handleUpdateChild} onDelete={handleDeleteChild} />
              ))}
              <Link to="/cuestionario" className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors mt-2">
                🔮 Hacer el Test de Vibración →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👶</div>
              <p className="text-sm">Agrega el perfil de tu hijo/a para personalizar los módulos</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => { if (confirm('¿Deseas cerrar sesión?')) logout(); }}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
