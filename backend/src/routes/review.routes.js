const express = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, reviewController.createReview);
router.get('/:menuItemId', reviewController.getReviewsByMenuItem);
router.get('/average/:menuItemId', reviewController.getAverageRating);
router.put('/:reviewId', authenticate, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);


module.exports = router;
