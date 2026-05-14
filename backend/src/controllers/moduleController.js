const { initDb } = require('../database/init');

function getAllModules(req, res) {
  const db = initDb();
  const modules = db.get('modules').sortBy('order_num').value();
  const userProgress = db.get('user_progress').filter({ user_id: req.userId }).value();
  const lessons = db.get('lessons').value();

  const result = modules.map(m => {
    const moduleLessons = lessons.filter(l => l.module_id === m.id);
    const completedIds = new Set(userProgress.map(p => p.lesson_id));
    const completed = moduleLessons.filter(l => completedIds.has(l.id)).length;
    return {
      ...m,
      completed_lessons: completed,
      progress_pct: m.lessons_count > 0 ? Math.round((completed / m.lessons_count) * 100) : 0,
    };
  });

  res.json({ modules: result });
}

function getModule(req, res) {
  const db = initDb();
  const id = Number(req.params.id);
  const module = db.get('modules').find({ id }).value();
  if (!module) return res.status(404).json({ error: 'Módulo no encontrado' });

  const lessons = db.get('lessons').filter({ module_id: id }).sortBy('order_num').value();
  const userProgress = db.get('user_progress').filter({ user_id: req.userId }).value();
  const completedIds = new Set(userProgress.map(p => p.lesson_id));

  const lessonsWithProgress = lessons.map(l => ({ ...l, completed: completedIds.has(l.id) }));
  res.json({ module, lessons: lessonsWithProgress });
}

function completeLesson(req, res) {
  const db = initDb();
  const lessonId = Number(req.params.lessonId);
  const lesson = db.get('lessons').find({ id: lessonId }).value();
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada' });

  const exists = db.get('user_progress').find({ user_id: req.userId, lesson_id: lessonId }).value();
  if (!exists) {
    db.get('user_progress').push({ user_id: req.userId, lesson_id: lessonId, completed_at: new Date().toISOString() }).write();
  }

  res.json({ success: true, message: '¡Lección completada! Sigue brillando.' });
}

module.exports = { getAllModules, getModule, completeLesson };
