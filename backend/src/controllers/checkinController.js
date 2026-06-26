const { initDb, nextId } = require('../database/init');

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Chronological stage from real dates, independent of the age_stage stored on the
// child — used to detect when a child has actually outgrown their current module.
function computeChronologicalStage(child) {
  const now = new Date();
  const due = child.due_date ? new Date(child.due_date) : null;
  const birth = child.birth_date
    ? new Date(child.birth_date)
    : (due && due <= now ? due : null);

  if (!birth) return due && due > now ? 'embarazo' : null;

  const months = (now - birth) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 24) return '0-2';
  if (months < 84) return '2-7';
  if (months < 144) return '7-12';
  return '12-17';
}

function getStatus(req, res) {
  const childId = req.query.child_id ? Number(req.query.child_id) : null;
  if (!childId) return res.json({ due: false });

  const db = initDb();
  const existing = db.get('monthly_checkins')
    .find({ user_id: req.userId, child_id: childId, month_key: monthKey() })
    .value();

  res.json({ due: !existing });
}

function submitCheckin(req, res) {
  const { child_id, connection_score, evolution_score } = req.body;
  if (!child_id) return res.status(400).json({ error: 'child_id es requerido' });

  const db = initDb();
  const child = db.get('children').find({ id: Number(child_id), user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  const key = monthKey();
  const already = db.get('monthly_checkins')
    .find({ user_id: req.userId, child_id: child.id, month_key: key }).value();
  if (already) return res.status(409).json({ error: 'Ya completaste tu check-in de este mes' });

  const avgScore = ((Number(connection_score) || 0) + (Number(evolution_score) || 0)) / 2;
  const chronoStage = computeChronologicalStage(child);
  const outgrewStage = chronoStage && chronoStage !== child.age_stage;
  // A low score doesn't block an age-based transition forever, but it does mean
  // we hold off one more month rather than rushing the change.
  const decision = outgrewStage && avgScore >= 2 ? 'advance' : 'stay';

  let message;
  let newModule = null;

  if (decision === 'advance') {
    db.get('children').find({ id: child.id })
      .assign({ age_stage: chronoStage, updated_at: new Date().toISOString() })
      .write();
    newModule = db.get('modules').find({ age_range: chronoStage }).value() || null;
    message = `${child.name} está listo/a para dar su siguiente paso. `
      + (newModule
        ? `Te damos la bienvenida a ${newModule.title}, donde encontrará nuevas herramientas para seguir desarrollando su propósito.`
        : 'Una nueva etapa de su camino está comenzando.');
  } else {
    // Same stage: renew the 30-day plan for a fresh cycle instead of leaving it stale.
    const plan = db.get('action_plans').find({ user_id: req.userId, child_id: child.id }).value();
    if (plan) {
      db.get('action_plans').find({ id: plan.id })
        .assign({ started_at: new Date().toISOString(), current_day: 1 })
        .write();
      db.get('plan_progress').remove({ plan_id: plan.id }).write();
    }
    message = `${child.name} sigue floreciendo a su propio ritmo. Renovamos su plan de este mes `
      + 'con nuevas herramientas para seguir profundizando su conexión contigo.';
  }

  db.get('monthly_checkins').push({
    id: nextId('monthly_checkins'),
    user_id: req.userId,
    child_id: child.id,
    month_key: key,
    connection_score: Number(connection_score) || null,
    evolution_score: Number(evolution_score) || null,
    decision,
    created_at: new Date().toISOString(),
  }).write();

  res.json({ decision, message, new_module: newModule });
}

module.exports = { getStatus, submitCheckin };
