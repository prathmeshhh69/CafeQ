const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, recommendationController.getRecommendations);

module.exports = router;
