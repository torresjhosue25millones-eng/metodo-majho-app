const { initDb, nextId } = require('../database/init');

function getChildren(req, res) {
  const db = initDb();
  const children = db.get('children').filter({ user_id: req.userId }).value();
  res.json({ children });
}

function addChild(req, res) {
  const { name, birth_date, birth_time, birth_place, age_stage } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del niño/a es requerido' });

  const db = initDb();
  const child = {
    id: nextId('children'),
    user_id: req.userId,
    name,
    birth_date: birth_date || null,
    birth_time: birth_time || null,
    birth_place: birth_place || null,
    age_stage: age_stage || deriveAgeStage(birth_date),
    vibration_type: null,
    created_at: new Date().toISOString(),
  };
  db.get('children').push(child).write();
  res.status(201).json({ child });
}

function updateChild(req, res) {
  const { name, birth_date, birth_time, birth_place, age_stage, vibration_type } = req.body;
  const db = initDb();
  const id = Number(req.params.id);
  const child = db.get('children').find({ id, user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  db.get('children').find({ id }).assign({
    ...(name && { name }),
    ...(birth_date !== undefined && { birth_date }),
    ...(birth_time !== undefined && { birth_time }),
    ...(birth_place !== undefined && { birth_place }),
    ...(age_stage && { age_stage }),
    ...(vibration_type && { vibration_type }),
    updated_at: new Date().toISOString(),
  }).write();

  const updated = db.get('children').find({ id }).value();
  res.json({ child: updated });
}

function deleteChild(req, res) {
  const db = initDb();
  const id = Number(req.params.id);
  const child = db.get('children').find({ id, user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  db.get('children').remove({ id }).write();
  res.json({ success: true });
}

function deriveAgeStage(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  if (birth > now) return 'embarazo';
  const months = (now - birth) / (1000 * 60 * 60 * 24 * 30);
  if (months < 24) return '0-2';
  if (months < 72) return '2-6';
  if (months < 144) return '6-12';
  return '12-17';
}

module.exports = { getChildren, addChild, updateChild, deleteChild };
