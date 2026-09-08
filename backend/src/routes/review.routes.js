const express = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, reviewController.createReview);
router.get('/:menuItemId', reviewController.getReviewsByMenuItem);

module.exports = router;
