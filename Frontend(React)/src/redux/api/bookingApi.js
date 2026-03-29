import apiClient from './client';

export const getMyBookingsRequest = () => apiClient.get('/bookings/my');
export const reserveSeatsRequest = (payload, config = {}) => apiClient.post('/bookings/reserve', payload, config);
export const confirmBookingRequest = (payload, config = {}) => apiClient.post('/bookings/confirm', payload, config);
export const getEventsRequest = () => apiClient.get('/events');
export const getEventDetailsRequest = (eventId) => apiClient.get(`/events/${eventId}/seats`);
export const getAdminBookingsRequest = (statusFilter = '') =>
  apiClient.get(`/admin/bookings${statusFilter ? `?status=${statusFilter}` : ''}`);
export const getAdminTransactionsRequest = () => apiClient.get('/admin/transactions');
export const createAdminEventRequest = (payload) => apiClient.post('/admin/events', payload);
export const createAdminSeatsRequest = (eventId, payload) => apiClient.post(`/admin/events/${eventId}/seats/bulk`, payload);
export const deleteAdminEventRequest = (eventId) => apiClient.delete(`/admin/events/${eventId}`);
export const updateAdminEventRequest = (eventId, payload) => apiClient.put(`/admin/events/${eventId}`, payload);
export const cancelAdminBookingRequest = (payload, config = {}) =>
  apiClient.post('/admin/bookings/cancel', payload, config);
export const getAdminSeatsRequest = (eventId, token) =>
  apiClient.get(`/admin/events/${eventId}/seats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
