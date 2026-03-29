import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getEventDetailsRequest, getEventsRequest } from '../api/bookingApi';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const res = await getEventsRequest();
    return res.data.data || [];
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load events');
  }
});

export const fetchEventDetails = createAsyncThunk('events/fetchEventDetails', async (eventId, { rejectWithValue }) => {
  try {
    const res = await getEventDetailsRequest(eventId);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load event');
  }
});

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    detail: { event: null, seats: [] },
    selectedSeatIds: [],
    loading: false,
    detailLoading: false,
    error: ''
  },
  reducers: {
    toggleSeatSelection(state, action) {
      const seat = action.payload;
      if (seat.status !== 'AVAILABLE') return;
      if (state.selectedSeatIds.includes(seat._id)) {
        state.selectedSeatIds = state.selectedSeatIds.filter((id) => id !== seat._id);
      } else {
        state.selectedSeatIds.push(seat._id);
      }
    },
    clearSeatSelection(state) {
      state.selectedSeatIds = [];
    },
    clearEventsError(state) {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load events';
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.detailLoading = true;
        state.error = '';
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload || { event: null, seats: [] };
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to load event';
      });
  }
});

export const { toggleSeatSelection, clearSeatSelection, clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
