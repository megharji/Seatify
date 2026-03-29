import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authReducer';
import walletReducer from './reducer/walletReducer';
import bookingReducer from './reducer/bookingReducer';
import eventsReducer from './reducer/eventsReducer';
import adminReducer from './reducer/adminReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    bookings: bookingReducer,
    events: eventsReducer,
    admin: adminReducer
  }
});
