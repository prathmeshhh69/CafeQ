const express = require('express');
const { foodAssistant } = require('../controllers/ai.controller');

const router = express.Router();

router.post('/', foodAssistant);

module.exports = router;
