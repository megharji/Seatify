import { Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { clearBookingMessages, confirmReservedBooking, fetchMyBookings } from '../../redux/reducer/bookingReducer';

export default function BookingsPage() {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.bookings.items);
  const loading = useSelector((state) => state.bookings.loading);
  const actionLoading = useSelector((state) => state.bookings.actionLoading);
  const error = useSelector((state) => state.bookings.error);
  const success = useSelector((state) => state.bookings.success);

  useEffect(() => {
    dispatch(clearBookingMessages());
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleConfirm = (booking) => {
    dispatch(confirmReservedBooking({
      bookingId: booking._id,
      eventId: booking.eventId?._id,
    }));
  };

  if (loading) {
    return <Stack alignItems="center" sx={{ mt: 8 }}><CircularProgress /></Stack>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="My bookings"
        title="Track your reservations and confirmations"
        subtitle="Use this page to verify reservation, confirmation, and cancellation states."
        chip={`${bookings.length} bookings`}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Stack spacing={2}>
        {bookings.map((booking) => {
          const isReserved = booking.status === 'RESERVED';
          const isExpired = booking.reservationExpiresAt && new Date(booking.reservationExpiresAt) < new Date();

          return (
            <Card key={booking._id}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="h6">{booking.eventId?.title || 'Event'}</Typography>
                    <Typography color="text.secondary">{booking.eventId?.venue}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Chip
                      label={booking.status}
                      color={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'error' : 'warning'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Typography>₹{booking.totalAmount}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Typography color="text.secondary">
                      Seats: {booking.seatIds?.map((s) => s.seatNumber).join(', ') || '—'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography color="text.secondary">
                      Booked: {dayjs(booking.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                    {booking.reservationExpiresAt ? (
                      <Typography color={isExpired ? 'error' : 'text.secondary'}>
                        Expiry: {dayjs(booking.reservationExpiresAt).format('DD MMM YYYY, hh:mm A')}
                      </Typography>
                    ) : null}
                  </Grid>
                </Grid>

                {isReserved && !isExpired && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Reservation pending — confirm to complete payment from your wallet.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleConfirm(booking)}
                        disabled={actionLoading}
                        sx={{ ml: 2, flexShrink: 0 }}
                      >
                        {actionLoading ? <CircularProgress size={16} /> : 'Confirm booking'}
                      </Button>
                    </Stack>
                  </>
                )}

                {isReserved && isExpired && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="error">
                      Reservation expired.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!bookings.length ? <Typography color="text.secondary">No bookings to show.</Typography> : null}
      </Stack>
    </Stack>
  );
}
