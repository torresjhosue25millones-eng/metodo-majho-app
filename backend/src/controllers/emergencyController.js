const { initDb, nextId } = require('../database/init');

const MONTHLY_LIMIT = 2;

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function checkLimit(req, res) {
  const db = initDb();
  const monthStart = getMonthStart();
  const uses = db.get('emergency_uses')
    .filter(u => u.user_id === req.userId && u.used_at >= monthStart)
    .value();

  const usesThisMonth = uses.length;
  const remaining = Math.max(0, MONTHLY_LIMIT - usesThisMonth);
  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    .toLocaleDateString('es', { day: 'numeric', month: 'long' });

  res.json({
    uses_this_month: usesThisMonth,
    limit: MONTHLY_LIMIT,
    remaining,
    can_use: usesThisMonth < MONTHLY_LIMIT,
    reset_date: resetDate,
    last_use: uses.length > 0 ? uses[uses.length - 1].used_at : null,
  });
}

function recordUse(req, res) {
  const db = initDb();
  const monthStart = getMonthStart();
  const usesThisMonth = db.get('emergency_uses')
    .filter(u => u.user_id === req.userId && u.used_at >= monthStart)
    .value().length;

  if (usesThisMonth >= MONTHLY_LIMIT) {
    const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      .toLocaleDateString('es', { day: 'numeric', month: 'long' });
    return res.status(429).json({
      error: `Has alcanzado el límite de ${MONTHLY_LIMIT} activaciones por mes. Se renueva el ${resetDate}.`,
      remaining: 0,
      can_use: false,
      reset_date: resetDate,
    });
  }

  const use = {
    id: nextId('emergency_uses'),
    user_id: req.userId,
    used_at: new Date().toISOString(),
    note: req.body.note || null,
  };
  db.get('emergency_uses').push(use).write();

  const remaining = MONTHLY_LIMIT - usesThisMonth - 1;
  res.json({ success: true, remaining, can_use: remaining > 0, uses_this_month: usesThisMonth + 1 });
}

module.exports = { checkLimit, recordUse };
