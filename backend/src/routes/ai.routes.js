const express = require('express');
const { foodAssistant } = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, foodAssistant);

module.exports = router;
