import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { Link as RouterLink } from 'react-router-dom';

const features = [
  {
    title: 'Secure seat reservation',
    description: 'Reserve seats, confirm bookings, and prevent double-booking with a smooth customer flow.',
    icon: <EventSeatRoundedIcon color="primary" />
  },
  {
    title: 'Wallet-based checkout',
    description: 'Add funds, track credits and debits, and review transaction history in one place.',
    icon: <AccountBalanceWalletRoundedIcon color="primary" />
  },
  {
    title: 'Admin control panel',
    description: 'Create events, bulk-create seats, monitor bookings, and process cancellations with refunds.',
    icon: <AdminPanelSettingsRoundedIcon color="primary" />
  },
  {
    title: 'Redux-powered state',
    description: 'Centralized Redux Toolkit state for auth, wallet, events, bookings, and admin operations.',
    icon: <VerifiedRoundedIcon color="primary" />
  }
];

export default function HomePage() {
  return (
    <Stack spacing={4}>
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Chip label="Modern event booking & wallet platform" color="secondary" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h3">
                  Experience seamless ticket booking with Seatify.
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 700 }}>
                  User signup, wallet top-up, event browsing, seat reservation, booking confirmation, and admin operations — all in one polished, Redux-driven frontend.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={RouterLink} to="/signup" variant="contained" size="large">
                    Start as User
                  </Button>
                  <Button component={RouterLink} to="/login" variant="outlined" size="large">
                    Login
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  borderRadius: 6,
                  p: 5,
                  background: 'radial-gradient(circle at top, rgba(124,156,255,0.28), rgba(110,243,197,0.08), transparent 70%)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6">Demo flow</Typography>
                  <Typography color="text.secondary">1. Signup or login</Typography>
                  <Typography color="text.secondary">2. Add wallet balance</Typography>
                  <Typography color="text.secondary">3. Open an event and reserve seats</Typography>
                  <Typography color="text.secondary">4. Confirm booking</Typography>
                  <Typography color="text.secondary">5. Review bookings and admin actions</Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid key={feature.title} size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  {feature.icon}
                  <Typography variant="h6">{feature.title}</Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
