const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const WalletTransaction = require('../models/WalletTransaction');
const httpError = require('../utils/httpError');
const { cancelConfirmedBooking } = require('../services/reservation.service');
const { saveIdempotentResponse } = require('../middleware/idempotency');

async function createEvent(req, res) {
  const { title, description, venue, startsAt } = req.body;
  if (!title || !venue || !startsAt) {
    throw httpError(400, 'title, venue and startsAt are required');
  }

  const event = await Event.create({ title, description, venue, startsAt });
  res.status(201).json({ success: true, message: 'Event created successfully', data: event });
}

async function updateEvent(req, res) {
  const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) throw httpError(404, 'Event not found');
  res.json({ success: true, message: 'Event updated successfully', data: event });
}

async function deleteEvent(req, res) {
  const event = await Event.findByIdAndDelete(req.params.eventId);
  if (!event) throw httpError(404, 'Event not found');

  await Seat.deleteMany({ eventId: event._id });
  res.json({ success: true, message: 'Event deleted successfully' });
}

async function bulkCreateSeats(req, res) {
  const { seats } = req.body;
  if (!Array.isArray(seats) || seats.length === 0) {
    throw httpError(400, 'seats array is required');
  }

  const payload = seats.map((seat) => ({
    eventId: req.params.eventId,
    seatNumber: seat.seatNumber,
    price: seat.price
  }));

  const createdSeats = await Seat.insertMany(payload, { ordered: true });
  res.status(201).json({ success: true, message: 'Seats created successfully', data: createdSeats });
}

// ✅ GET seats by eventId
async function getEventSeats(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw httpError(404, 'Event not found');

  const seats = await Seat.find({ eventId: req.params.eventId }).sort({ seatNumber: 1 });

  res.json({
    success: true,
    message: 'Seats fetched successfully',
    data: seats
  });
}

async function getAllBookings(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.eventId) filter.eventId = req.query.eventId;
  if (req.query.userId) filter.userId = req.query.userId;

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email')
    .populate('eventId', 'title venue startsAt')
    .populate('seatIds', 'seatNumber price status')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
}

async function getAllTransactions(_req, res) {
  const transactions = await WalletTransaction.find({})
    .populate('userId', 'name email')
    .populate('bookingId')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: transactions });
}

async function cancelBooking(req, res) {
  const { bookingId } = req.body;
  const result = await cancelConfirmedBooking({ bookingId, adminUserId: req.user._id });

  const responseBody = {
    success: true,
    message: 'Booking cancelled and wallet refunded successfully',
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

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  bulkCreateSeats,
  getEventSeats,
  getAllBookings,
  getAllTransactions,
  cancelBooking
};