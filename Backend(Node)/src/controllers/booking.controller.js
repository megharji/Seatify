const Booking = require('../models/Booking');
const { reserveSeats, confirmBooking } = require('../services/reservation.service');
const { saveIdempotentResponse } = require('../middleware/idempotency');

async function reserve(req, res) {
  const { eventId, seatIds } = req.body;

  const result = await reserveSeats({
    userId: req.user._id,
    eventId,
    seatIds
  });

  const responseBody = {
    success: true,
    message: 'Seats reserved successfully',
    data: result
  };

  await saveIdempotentResponse({
    key: req.idempotencyKey,
    route: req.originalUrl,
    userId: req.user._id,
    responseCode: 201,
    responseBody
  });

  res.status(201).json(responseBody);
}

async function confirm(req, res) {
  const { bookingId } = req.body;

  const result = await confirmBooking({
    userId: req.user._id,
    bookingId
  });

  const responseBody = {
    success: true,
    message: 'Booking confirmed successfully',
    data: result
  };

  await saveIdempotentResponse({
    key: req.idempotencyKey,
    route: req.originalUrl,
    userId: req.user._id,
    responseCode: 200,
    responseBody
  });

  res.json(responseBody);
}

async function myBookings(req, res) {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('eventId')
    .populate('seatIds')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
}

module.exports = {
  reserve,
  confirm,
  myBookings
};
