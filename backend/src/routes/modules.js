const express = require('express');
const router = express.Router();
const { getAllModules, getModule, getDailyProgram, completeLesson } = require('../controllers/moduleController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllModules);
router.get('/:id', auth, getModule);
router.get('/:id/daily-program', auth, getDailyProgram);
router.post('/:id/lessons/:lessonId/complete', auth, completeLesson);

module.exports = router;
