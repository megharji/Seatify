import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { clearEventsError, clearSeatSelection, fetchEventDetails, toggleSeatSelection } from '../../redux/reducer/eventsReducer';
import { clearBookingMessages, confirmReservedBooking, reserveSeatsForBooking } from '../../redux/reducer/bookingReducer';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const eventData = useSelector((state) => state.events.detail);
  const selectedSeatIds = useSelector((state) => state.events.selectedSeatIds);
  const loading = useSelector((state) => state.events.detailLoading);
  const eventError = useSelector((state) => state.events.error);
  const reservedBookingRaw = useSelector((state) => state.bookings.reservedBooking);
  const bookingItems = useSelector((state) => state.bookings.items);
  // prefer the fetched booking (has correct _id) over the raw API response
  const reservedBooking = bookingItems.find(
    (b) => b.status === 'RESERVED' && (b.eventId?._id === eventId || b.eventId === eventId)
  ) ?? reservedBookingRaw;
  const actionLoading = useSelector((state) => state.bookings.actionLoading);
  const bookingError = useSelector((state) => state.bookings.error);
  const success = useSelector((state) => state.bookings.success);

  useEffect(() => {
    dispatch(clearEventsError());
    dispatch(clearBookingMessages());
    dispatch(clearSeatSelection());
    dispatch(fetchEventDetails(eventId));
  }, [dispatch, eventId]);

  const availableSeats = useMemo(() => eventData.seats.filter((seat) => seat.status === 'AVAILABLE'), [eventData.seats]);
  const totalPrice = useMemo(
    () => eventData.seats.filter((seat) => selectedSeatIds.includes(seat._id)).reduce((sum, seat) => sum + seat.price, 0),
    [eventData.seats, selectedSeatIds]
  );

  const reserveSeats = async () => {
    await dispatch(reserveSeatsForBooking({ eventId, seatIds: selectedSeatIds }));
  };

  const confirmBooking = async () => {
    const bookingId = reservedBooking?._id;
    if (!bookingId) return;
    await dispatch(confirmReservedBooking({ bookingId, eventId }));
  };

  if (loading) {
    return <Stack alignItems="center" sx={{ mt: 8 }}><CircularProgress /></Stack>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Event details"
        title={eventData.event?.title || 'Event'}
        subtitle={`${eventData.event?.venue || ''} • ${eventData.event?.startsAt ? dayjs(eventData.event.startsAt).format('DD MMM YYYY, hh:mm A') : ''}`}
        chip={`${availableSeats.length} seats available`}
      />

      {eventError ? <Alert severity="error">{eventError}</Alert> : null}
      {bookingError ? <Alert severity="error">{bookingError}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Seat layout</Typography>
              <Grid container spacing={1.5}>
                {eventData.seats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat._id);
                  const available = seat.status === 'AVAILABLE';
                  return (
                    <Grid key={seat._id} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Box
                        onClick={() => dispatch(toggleSeatSelection(seat))}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          cursor: available ? 'pointer' : 'not-allowed',
                          border: '1px solid rgba(255,255,255,0.08)',
                          bgcolor: isSelected ? 'primary.main' : available ? 'rgba(255,255,255,0.02)' : 'rgba(255,99,132,0.12)',
                          color: isSelected ? '#081122' : 'inherit'
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography fontWeight={800}>{seat.seatNumber}</Typography>
                          <Typography variant="body2">₹{seat.price}</Typography>
                          <Chip size="small" label={seat.status} color={available ? 'success' : seat.status === 'RESERVED' ? 'warning' : 'error'} sx={{ width: 'fit-content' }} />
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Booking summary</Typography>
                <Typography color="text.secondary">Choose available seats and reserve them before checkout.</Typography>
                <Divider />
                <Typography>Selected seats: {selectedSeatIds.length}</Typography>
                <Typography>Total amount: ₹{totalPrice}</Typography>
                <Button variant="contained" disabled={!selectedSeatIds.length || actionLoading} onClick={reserveSeats}>
                  {actionLoading ? 'Processing...' : 'Reserve seats'}
                </Button>

                {reservedBooking ? (
                  <>
                    <Divider />
                    <Typography variant="subtitle1" fontWeight={700}>Reserved booking ready</Typography>
                    <Typography color="text.secondary">Booking ID: {reservedBooking._id}</Typography>
                    <Typography color="text.secondary">Expires at: {dayjs(reservedBooking.reservationExpiresAt).format('DD MMM YYYY, hh:mm:ss A')}</Typography>
                    <Button variant="outlined" onClick={confirmBooking} disabled={actionLoading}>Confirm booking</Button>
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
