const express = require('express');
const { reserve, confirm, myBookings } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth');
const { requireIdempotencyKey, replayIfDuplicate } = require('../middleware/idempotency');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.USER, ROLES.ADMIN));
router.get('/my', myBookings);
router.post('/reserve', requireIdempotencyKey, replayIfDuplicate, reserve);
router.post('/confirm', requireIdempotencyKey, replayIfDuplicate, confirm);

module.exports = router;
