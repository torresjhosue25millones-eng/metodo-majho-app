const { initDb } = require('../database/init');

function getDailyAffirmation(req, res) {
  const db = initDb();
  const affirmations = db.get('affirmations').value();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const affirmation = affirmations[dayOfYear % affirmations.length];
  res.json({ affirmation });
}

function getAllAffirmations(req, res) {
  const db = initDb();
  const { category } = req.query;
  let affirmations = db.get('affirmations').value();
  if (category) affirmations = affirmations.filter(a => a.category === category);

  const favorites = new Set(
    db.get('user_affirmations').filter({ user_id: req.userId, is_favorite: true }).map('affirmation_id').value()
  );

  res.json({ affirmations: affirmations.map(a => ({ ...a, is_favorite: favorites.has(a.id) })) });
}

function toggleFavorite(req, res) {
  const db = initDb();
  const affirmationId = Number(req.params.id);
  const existing = db.get('user_affirmations').find({ user_id: req.userId, affirmation_id: affirmationId }).value();

  if (existing) {
    const newVal = !existing.is_favorite;
    db.get('user_affirmations').find({ user_id: req.userId, affirmation_id: affirmationId }).assign({ is_favorite: newVal }).write();
    res.json({ is_favorite: newVal });
  } else {
    db.get('user_affirmations').push({ user_id: req.userId, affirmation_id: affirmationId, is_favorite: true }).write();
    res.json({ is_favorite: true });
  }
}

module.exports = { getDailyAffirmation, getAllAffirmations, toggleFavorite };
