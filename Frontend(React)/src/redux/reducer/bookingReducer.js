import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { confirmBookingRequest, getMyBookingsRequest, reserveSeatsRequest } from '../api/bookingApi';
import { getIdempotencyKey } from '../../utils/idempotency';
import { clearSeatSelection, fetchEventDetails } from './eventsReducer';
import { fetchWalletSummary } from './walletReducer';

export const fetchMyBookings = createAsyncThunk('bookings/fetchMyBookings', async (_, { rejectWithValue }) => {
  try {
    const res = await getMyBookingsRequest();
    return res.data.data || [];
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load bookings');
  }
});

export const reserveSeatsForBooking = createAsyncThunk(
  'bookings/reserveSeatsForBooking',
  async ({ eventId, seatIds }, { rejectWithValue, dispatch }) => {
    try {
      const res = await reserveSeatsRequest(
        { eventId, seatIds },
        { headers: { 'Idempotency-Key': getIdempotencyKey('reserve') } }
      );
      await Promise.all([
        dispatch(fetchEventDetails(eventId)),
        dispatch(fetchMyBookings()),
      ]);
      dispatch(clearSeatSelection());
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Reservation failed');
    }
  }
);

export const confirmReservedBooking = createAsyncThunk(
  'bookings/confirmReservedBooking',
  async ({ bookingId, eventId }, { rejectWithValue, dispatch }) => {
    try {
      await confirmBookingRequest(
        { bookingId },
        { headers: { 'Idempotency-Key': getIdempotencyKey('confirm') } }
      );
      await Promise.all([
        dispatch(fetchEventDetails(eventId)),
        dispatch(fetchMyBookings()),
        dispatch(fetchWalletSummary())
      ]);
      return 'Booking confirmed successfully.';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Confirmation failed');
    }
  }
);

const STORAGE_KEY = 'seatify_reserved_booking';

function loadReservedBooking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const booking = JSON.parse(raw);
    if (booking?.reservationExpiresAt && new Date(booking.reservationExpiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return booking;
  } catch {
    return null;
  }
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    reservedBooking: loadReservedBooking(),
    loading: false,
    actionLoading: false,
    error: '',
    success: ''
  },
  reducers: {
    clearBookingMessages(state) {
      state.error = '';
      state.success = '';
    },
    clearReservedBooking(state) {
      state.reservedBooking = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load bookings';
      })
      .addCase(reserveSeatsForBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(reserveSeatsForBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reservedBooking = action.payload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
        state.success = 'Seats reserved. Confirm within the reservation window.';
      })
      .addCase(reserveSeatsForBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Reservation failed';
      })
      .addCase(confirmReservedBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(confirmReservedBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reservedBooking = null;
        localStorage.removeItem(STORAGE_KEY);
        state.success = action.payload;
      })
      .addCase(confirmReservedBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Confirmation failed';
      });
  }
});

export const { clearBookingMessages, clearReservedBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
