const express = require('express');
const router = express.Router();
const { createShare, accessSharedDocument } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createShare);
router.get('/access/:token', accessSharedDocument);

module.exports = router;
