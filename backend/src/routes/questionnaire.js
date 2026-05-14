const express = require('express');
const router = express.Router();
const { getQuestions, submitQuestionnaire, getLatestResult } = require('../controllers/questionnaireController');
const auth = require('../middleware/auth');

router.get('/questions', auth, getQuestions);
router.post('/submit', auth, submitQuestionnaire);
router.get('/result', auth, getLatestResult);

module.exports = router;
