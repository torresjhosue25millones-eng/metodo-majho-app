const { initDb, nextId } = require('../database/init');

function getEntries(req, res) {
  const db = initDb();
  const entries = db.get('journal_entries').filter({ user_id: req.userId }).sortBy('created_at').reverse().value();
  res.json({ entries });
}

function createEntry(req, res) {
  const { title, content, mood, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Título y contenido son requeridos' });

  const db = initDb();
  const entry = {
    id: nextId('journal_entries'),
    user_id: req.userId,
    title,
    content,
    mood: mood || 'serena',
    tags: tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.get('journal_entries').push(entry).write();
  res.status(201).json({ entry });
}

function updateEntry(req, res) {
  const { title, content, mood, tags } = req.body;
  const db = initDb();
  const id = Number(req.params.id);
  const entry = db.get('journal_entries').find({ id, user_id: req.userId }).value();
  if (!entry) return res.status(404).json({ error: 'Entrada no encontrada' });

  db.get('journal_entries').find({ id }).assign({
    ...(title && { title }),
    ...(content && { content }),
    ...(mood && { mood }),
    ...(tags && { tags }),
    updated_at: new Date().toISOString(),
  }).write();

  const updated = db.get('journal_entries').find({ id }).value();
  res.json({ entry: updated });
}

function deleteEntry(req, res) {
  const db = initDb();
  const id = Number(req.params.id);
  const entry = db.get('journal_entries').find({ id, user_id: req.userId }).value();
  if (!entry) return res.status(404).json({ error: 'Entrada no encontrada' });

  db.get('journal_entries').remove({ id }).write();
  res.json({ success: true });
}

module.exports = { getEntries, createEntry, updateEntry, deleteEntry };
