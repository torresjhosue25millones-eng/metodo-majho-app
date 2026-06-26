const express = require('express');
const router = express.Router();
const { getStatus, submitCheckin } = require('../controllers/checkinController');
const auth = require('../middleware/auth');

router.get('/status', auth, getStatus);
router.post('/', auth, submitCheckin);

module.exports = router;
