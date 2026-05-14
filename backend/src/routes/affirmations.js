const express = require('express');
const router = express.Router();
const { getDailyAffirmation, getAllAffirmations, toggleFavorite } = require('../controllers/affirmationController');
const auth = require('../middleware/auth');

router.get('/daily', auth, getDailyAffirmation);
router.get('/', auth, getAllAffirmations);
router.post('/:id/favorite', auth, toggleFavorite);

module.exports = router;
