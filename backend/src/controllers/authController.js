const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, nextId } = require('../database/init');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { name, email, password, children_count } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  const db = initDb();
  const existing = db.get('users').find({ email }).value();
  if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  const hash = await bcrypt.hash(password, 12);
  const id = nextId('users');
  const user = { id, name, email, password: hash, avatar: null, bio: null, children_count: children_count || 0, created_at: new Date().toISOString() };
  db.get('users').push(user).write();

  const { password: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token: generateToken(id) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

  const db = initDb();
  const user = db.get('users').find({ email }).value();
  if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: generateToken(user.id) });
}

function getMe(req, res) {
  const db = initDb();
  const user = db.get('users').find({ id: req.userId }).value();
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { password: _, ...safeUser } = user;
  const progress = db.get('user_progress').filter({ user_id: req.userId }).value().length;
  const totalLessons = db.get('lessons').value().length;

  res.json({ user: safeUser, progress, totalLessons });
}

async function updateProfile(req, res) {
  const { name, bio, children_count } = req.body;
  const db = initDb();

  db.get('users').find({ id: req.userId }).assign({
    ...(name && { name }),
    ...(bio !== undefined && { bio }),
    ...(children_count !== undefined && { children_count }),
  }).write();

  const user = db.get('users').find({ id: req.userId }).value();
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
}

module.exports = { register, login, getMe, updateProfile };
