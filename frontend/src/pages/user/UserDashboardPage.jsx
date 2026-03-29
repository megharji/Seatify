import { Alert, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../redux/reducer/bookingReducer';
import { fetchWalletSummary } from '../../redux/reducer/walletReducer';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.bookings.items);
  const bookingsError = useSelector((state) => state.bookings.error);
  const wallet = useSelector((state) => state.wallet.summary);
  const walletError = useSelector((state) => state.wallet.error);

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchWalletSummary());
  }, [dispatch]);

  const error = bookingsError || walletError;
  const confirmedCount = useMemo(() => bookings.filter((item) => item.status === 'CONFIRMED').length, [bookings]);

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="User dashboard"
        title={`Hi ${user?.name?.split(' ')[0] || 'there'}, ready to book?`}
        subtitle="Browse active events, reserve seats, and confirm bookings from your wallet."
        chip={user?.email}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Wallet balance" value={`₹${wallet.walletBalance || 0}`} helper="Keep enough balance before confirming." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Confirmed bookings" value={confirmedCount} helper="Your completed reservations." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total bookings" value={bookings.length} helper="All your reservations and confirmations." />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Recent activity</Typography>
                <Button component={RouterLink} to="/wallet" variant="outlined" size="small">Top up wallet</Button>
              </Stack>
              <Stack spacing={1.5}>
                {bookings.slice(0, 8).map((booking) => (
                  <Stack
                    key={booking._id}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={1}
                    sx={{ pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Stack spacing={0.3}>
                      <Typography fontWeight={700}>{booking.eventId?.title || 'Event'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Seats: {booking.seatIds?.map((s) => s.seatNumber).join(', ') || '—'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={booking.status}
                        color={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'error' : 'warning'}
                      />
                      <Typography variant="body2" color="text.secondary">₹{booking.totalAmount}</Typography>
                    </Stack>
                  </Stack>
                ))}
                {!bookings.length ? <Typography color="text.secondary">No bookings yet.</Typography> : null}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Quick links</Typography>
                <Button component={RouterLink} to="/events" variant="contained" fullWidth>Browse events</Button>
                <Button component={RouterLink} to="/bookings" variant="outlined" fullWidth>My bookings</Button>
                <Button component={RouterLink} to="/wallet" variant="outlined" fullWidth>Wallet</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
