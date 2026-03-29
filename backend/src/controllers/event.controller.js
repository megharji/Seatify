const Event = require('../models/Event');
const Seat = require('../models/Seat');
const httpError = require('../utils/httpError');

async function listEvents(_req, res) {
  const events = await Event.find({ isActive: true }).sort({ startsAt: 1 });
  res.json({ success: true, data: events });
}

async function getEventSeats(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw httpError(404, 'Event not found');

  const seats = await Seat.find({ eventId: req.params.eventId }).sort({ seatNumber: 1 });
  res.json({ success: true, data: { event, seats } });
}

module.exports = {
  listEvents,
  getEventSeats
};
