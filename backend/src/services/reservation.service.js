const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const httpError = require('../utils/httpError');
const { BOOKING_STATUS, SEAT_STATUS } = require('../utils/constants');
const { debitWallet, refundWallet } = require('./wallet.service');

const HOLD_MINUTES = Number(process.env.RESERVATION_HOLD_MINUTES || 5);

async function reserveSeats({ userId, eventId, seatIds }) {
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    throw httpError(400, 'seatIds are required');
  }

  const uniqueSeatIds = [...new Set(seatIds)];
  const session = await mongoose.startSession();

  try {
    let response;
    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      if (!event || !event.isActive) throw httpError(404, 'Event not found or inactive');

      const seats = await Seat.find({
        _id: { $in: uniqueSeatIds },
        eventId
      }).session(session);

      if (seats.length !== uniqueSeatIds.length) {
        throw httpError(404, 'One or more seats were not found');
      }

      const now = new Date();
      for (const seat of seats) {
        const holdExpired = seat.reservationExpiresAt && seat.reservationExpiresAt <= now;
        if (seat.status === SEAT_STATUS.BOOKED) {
          throw httpError(409, `Seat ${seat.seatNumber} is already booked`);
        }

        if (
          seat.status === SEAT_STATUS.RESERVED &&
          !holdExpired &&
          String(seat.reservedBy) !== String(userId)
        ) {
          throw httpError(409, `Seat ${seat.seatNumber} is reserved by another user`);
        }

        if (seat.status === SEAT_STATUS.RESERVED && holdExpired) {
          seat.status = SEAT_STATUS.AVAILABLE;
          seat.reservedBy = null;
          seat.reservedAt = null;
          seat.reservationExpiresAt = null;
          await seat.save({ session });
        }
      }

      const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
      const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

      for (const seat of seats) {
        seat.status = SEAT_STATUS.RESERVED;
        seat.reservedBy = userId;
        seat.reservedAt = now;
        seat.reservationExpiresAt = expiresAt;
        await seat.save({ session });
      }

      const [booking] = await Booking.create(
        [
          {
            userId,
            eventId,
            seatIds: uniqueSeatIds,
            totalAmount,
            status: BOOKING_STATUS.RESERVED,
            reservationExpiresAt: expiresAt
          }
        ],
        { session }
      );

      response = { booking, expiresAt };
    });

    return response;
  } finally {
    session.endSession();
  }
}

async function confirmBooking({ userId, bookingId }) {
  const session = await mongoose.startSession();

  try {
    let response;
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw httpError(404, 'Booking not found');
      if (String(booking.userId) !== String(userId)) throw httpError(403, 'Not your booking');
      if (booking.status !== BOOKING_STATUS.RESERVED) {
        throw httpError(409, 'Booking is not in reserved state');
      }

      const now = new Date();
      if (booking.reservationExpiresAt <= now) {
        booking.status = BOOKING_STATUS.EXPIRED;
        await booking.save({ session });
        await releaseSeatsByBooking(booking, session);
        throw httpError(409, 'Reservation expired');
      }

      const seats = await Seat.find({ _id: { $in: booking.seatIds } }).session(session);
      for (const seat of seats) {
        if (seat.status !== SEAT_STATUS.RESERVED || String(seat.reservedBy) !== String(userId)) {
          throw httpError(409, `Seat ${seat.seatNumber} is no longer reserved for you`);
        }
        if (seat.reservationExpiresAt <= now) {
          throw httpError(409, `Seat ${seat.seatNumber} reservation expired`);
        }
      }

      await debitWallet({
        userId,
        amount: booking.totalAmount,
        bookingId: booking._id,
        note: `Booking payment for ${booking._id}`,
        session
      });

      for (const seat of seats) {
        seat.status = SEAT_STATUS.BOOKED;
        seat.bookedBy = userId;
        seat.bookedAt = now;
        seat.reservedBy = null;
        seat.reservedAt = null;
        seat.reservationExpiresAt = null;
        await seat.save({ session });
      }

      booking.status = BOOKING_STATUS.CONFIRMED;
      booking.confirmedAt = now;
      await booking.save({ session });

      response = { booking };
    });

    return response;
  } finally {
    session.endSession();
  }
}

async function cancelConfirmedBooking({ bookingId, adminUserId }) {
  const session = await mongoose.startSession();

  try {
    let response;
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw httpError(404, 'Booking not found');
      if (booking.status !== BOOKING_STATUS.CONFIRMED) {
        throw httpError(409, 'Only confirmed bookings can be cancelled');
      }

      const seats = await Seat.find({ _id: { $in: booking.seatIds } }).session(session);
      for (const seat of seats) {
        seat.status = SEAT_STATUS.AVAILABLE;
        seat.bookedBy = null;
        seat.bookedAt = null;
        seat.reservedBy = null;
        seat.reservedAt = null;
        seat.reservationExpiresAt = null;
        await seat.save({ session });
      }

      await refundWallet({
        userId: booking.userId,
        amount: booking.totalAmount,
        bookingId: booking._id,
        note: `Refund by admin ${adminUserId}`,
        session
      });

      booking.status = BOOKING_STATUS.CANCELLED;
      booking.cancelledAt = new Date();
      await booking.save({ session });

      response = { booking };
    });

    return response;
  } finally {
    session.endSession();
  }
}

async function releaseSeatsByBooking(booking, session) {
  await Seat.updateMany(
    { _id: { $in: booking.seatIds } },
    {
      $set: {
        status: SEAT_STATUS.AVAILABLE,
        reservedBy: null,
        reservedAt: null,
        reservationExpiresAt: null
      }
    },
    { session }
  );
}

async function expireReservations() {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const now = new Date();
      const expiredBookings = await Booking.find({
        status: BOOKING_STATUS.RESERVED,
        reservationExpiresAt: { $lte: now }
      }).session(session);

      for (const booking of expiredBookings) {
        booking.status = BOOKING_STATUS.EXPIRED;
        await booking.save({ session });
        await releaseSeatsByBooking(booking, session);
      }
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  reserveSeats,
  confirmBooking,
  cancelConfirmedBooking,
  expireReservations
};
