const express = require('express');
const router = express.Router();
const { checkLimit, recordUse } = require('../controllers/emergencyController');
const auth = require('../middleware/auth');

router.get('/limit', auth, checkLimit);
router.post('/use', auth, recordUse);

module.exports = router;
