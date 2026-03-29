const express = require('express');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  bulkCreateSeats,
  getAllBookings,
  getAllTransactions,
  cancelBooking,
  getEventSeats
} = require('../controllers/admin.controller');

const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { ROLES } = require('../utils/constants');
const { requireIdempotencyKey, replayIfDuplicate } = require('../middleware/idempotency');

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.post('/events', createEvent);
router.patch('/events/:eventId', validateObjectId('eventId'), updateEvent);
router.delete('/events/:eventId', validateObjectId('eventId'), deleteEvent);

router.post('/events/:eventId/seats/bulk', validateObjectId('eventId'), bulkCreateSeats);
router.get('/events/:eventId/seats', validateObjectId('eventId'), getEventSeats); // ✅ seats get route

router.get('/bookings', getAllBookings);
router.get('/transactions', getAllTransactions);
router.post('/bookings/cancel', requireIdempotencyKey, replayIfDuplicate, cancelBooking);

module.exports = router;