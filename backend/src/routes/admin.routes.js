const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, authorize, getDashboardData);

module.exports = router;
