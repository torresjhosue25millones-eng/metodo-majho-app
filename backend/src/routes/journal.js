const express = require('express');
const router = express.Router();
const { getEntries, createEntry, updateEntry, deleteEntry } = require('../controllers/journalController');
const auth = require('../middleware/auth');

router.get('/', auth, getEntries);
router.post('/', auth, createEntry);
router.put('/:id', auth, updateEntry);
router.delete('/:id', auth, deleteEntry);

module.exports = router;
