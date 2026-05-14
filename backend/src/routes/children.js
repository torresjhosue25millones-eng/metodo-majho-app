const express = require('express');
const router = express.Router();
const { getChildren, addChild, updateChild, deleteChild } = require('../controllers/childController');
const auth = require('../middleware/auth');

router.get('/', auth, getChildren);
router.post('/', auth, addChild);
router.put('/:id', auth, updateChild);
router.delete('/:id', auth, deleteChild);

module.exports = router;
