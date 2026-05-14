const express = require('express');
const router = express.Router();
const { getPlan, createPlan, completeDay, uncompleteDay } = require('../controllers/actionPlanController');
const auth = require('../middleware/auth');

router.get('/', auth, getPlan);
router.post('/', auth, createPlan);
router.post('/days/:day/complete', auth, completeDay);
router.delete('/days/:day/complete', auth, uncompleteDay);

module.exports = router;
