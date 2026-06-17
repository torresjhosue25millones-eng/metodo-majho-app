const express = require('express');
const router = express.Router();
const { getAllModules, getModule, getMonthlyProgram, completeLesson } = require('../controllers/moduleController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllModules);
router.get('/:id', auth, getModule);
router.get('/:id/monthly-program', auth, getMonthlyProgram);
router.post('/:id/lessons/:lessonId/complete', auth, completeLesson);

module.exports = router;
