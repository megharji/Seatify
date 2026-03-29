import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  cancelAdminBookingRequest,
  createAdminEventRequest,
  createAdminSeatsRequest,
  deleteAdminEventRequest,
  getAdminBookingsRequest,
  getAdminSeatsRequest,
  getAdminTransactionsRequest,
  getEventsRequest,
  updateAdminEventRequest
} from '../api/bookingApi';
import { getIdempotencyKey } from '../../utils/idempotency';

const seatTemplate = () =>
  Array.from({ length: 12 }, (_, index) => ({
    seatNumber: `A${index + 1}`,
    price: 500
  }));

export const fetchAdminDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue, getState }) => {
    try {
      const statusFilter = getState().admin.statusFilter;

      const [eventsRes, bookingsRes, txRes] = await Promise.all([
        getEventsRequest(),
        getAdminBookingsRequest(statusFilter),
        getAdminTransactionsRequest()
      ]);

      return {
        events: eventsRes.data?.data || [],
        bookings: bookingsRes.data?.data || [],
        transactions: txRes.data?.data || []
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load admin dashboard'
      );
    }
  }
);

export const fetchAllEventsSeats = createAsyncThunk(
  'admin/fetchAllEventsSeats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const events = getState().admin.events;

      const allSeats = {};

      await Promise.all(
        events.map(async (event) => {
          const res = await getAdminSeatsRequest(event._id, token);
          allSeats[event._id] = res.data?.data || [];
        })
      );

      return allSeats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch seats for all events'
      );
    }
  }
);

export const createAdminEvent = createAsyncThunk(
  'admin/createAdminEvent',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const form = getState().admin.eventForm;
      const token = getState().auth.token;

      await createAdminEventRequest(form, token);
      await dispatch(fetchAdminDashboard());
      await dispatch(fetchAllEventsSeats());

      return 'Event created successfully.';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create event');
    }
  }
);

export const createAdminSeats = createAsyncThunk(
  'admin/createAdminSeats',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const { selectedEventId, seatsJson } = getState().admin;
      const token = getState().auth.token;

      const seats = JSON.parse(seatsJson);

      await createAdminSeatsRequest(selectedEventId, { seats }, token);
      await dispatch(fetchAdminDashboard());
      await dispatch(fetchAllEventsSeats());

      return 'Seats created successfully.';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create seats');
    }
  }
);

export const fetchAdminSeats = createAsyncThunk(
  'admin/fetchAdminSeats',
  async (eventId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await getAdminSeatsRequest(eventId, token);

      return {
        eventId,
        seats: response.data?.data || []
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch seats');
    }
  }
);

export const cancelAdminBooking = createAsyncThunk(
  'admin/cancelAdminBooking',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const bookingId = getState().admin.cancelBookingId;
      const token = getState().auth.token;

      await cancelAdminBookingRequest(
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': getIdempotencyKey('cancel')
          }
        }
      );

      await dispatch(fetchAdminDashboard());
      await dispatch(fetchAllEventsSeats());

      return 'Booking cancelled and refund processed.';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const updateAdminEvent = createAsyncThunk(
  'admin/updateAdminEvent',
  async ({ eventId, payload }, { rejectWithValue, dispatch }) => {
    try {
      await updateAdminEventRequest(eventId, payload);
      await dispatch(fetchAdminDashboard());
      return 'Event updated successfully.';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteAdminEvent = createAsyncThunk(
  'admin/deleteAdminEvent',
  async (eventId, { rejectWithValue, dispatch }) => {
    try {
      await deleteAdminEventRequest(eventId);
      await dispatch(fetchAdminDashboard());
      await dispatch(fetchAllEventsSeats());
      return eventId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete event');
    }
  }
);

const initialState = {
  events: [],
  bookings: [],
  transactions: [],
  seats: [],
  seatsMap: {},
  eventForm: {
    title: '',
    description: '',
    venue: '',
    startsAt: ''
  },
  selectedEventId: '',
  seatsJson: JSON.stringify(seatTemplate(), null, 2),
  cancelBookingId: '',
  statusFilter: '',
  loading: false,
  actionLoading: false,
  seatsLoading: false,
  error: '',
  success: ''
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminEventField(state, action) {
      const { field, value } = action.payload;
      state.eventForm[field] = value;
    },
    setAdminField(state, action) {
      const { field, value } = action.payload;
      state[field] = value;
    },
    clearAdminMessages(state) {
      state.error = '';
      state.success = '';
    },
    clearAdminSeats(state) {
      state.seats = [];
      state.seatsMap = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.bookings = action.payload.bookings;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load admin dashboard';
      })

      .addCase(fetchAllEventsSeats.pending, (state) => {
        state.seatsLoading = true;
      })
      .addCase(fetchAllEventsSeats.fulfilled, (state, action) => {
        state.seatsLoading = false;
        state.seatsMap = action.payload || {};
      })
      .addCase(fetchAllEventsSeats.rejected, (state, action) => {
        state.seatsLoading = false;
        state.error = action.payload || 'Failed to fetch seats for all events';
      })

      .addCase(createAdminEvent.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(createAdminEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload;
        state.eventForm = {
          title: '',
          description: '',
          venue: '',
          startsAt: ''
        };
      })
      .addCase(createAdminEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create event';
      })

      .addCase(createAdminSeats.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(createAdminSeats.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload;
      })
      .addCase(createAdminSeats.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create seats';
      })

      .addCase(fetchAdminSeats.pending, (state) => {
        state.seatsLoading = true;
      })
      .addCase(fetchAdminSeats.fulfilled, (state, action) => {
        state.seatsLoading = false;
        state.seats = action.payload.seats;
        state.selectedEventId = action.payload.eventId;
      })
      .addCase(fetchAdminSeats.rejected, (state, action) => {
        state.seatsLoading = false;
        state.error = action.payload || 'Failed to fetch seats';
      })

      .addCase(cancelAdminBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(cancelAdminBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload;
        state.cancelBookingId = '';
      })
      .addCase(cancelAdminBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to cancel booking';
      })

      .addCase(updateAdminEvent.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(updateAdminEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload;
      })
      .addCase(updateAdminEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update event';
      })

      .addCase(deleteAdminEvent.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(deleteAdminEvent.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.events = state.events.filter((e) => e._id !== action.payload);
        state.success = 'Event deleted successfully.';
      })
      .addCase(deleteAdminEvent.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to delete event';
      });
  }
});

export const {
  setAdminEventField,
  setAdminField,
  clearAdminMessages,
  clearAdminSeats
} = adminSlice.actions;

export default adminSlice.reducer;