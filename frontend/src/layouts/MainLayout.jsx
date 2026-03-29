import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import ChairRoundedIcon from '@mui/icons-material/ChairRounded';
import { useMemo, useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const navLinks = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', to: '/' },
        { label: 'Login', to: '/login' },
        { label: 'Signup', to: '/signup' }
      ];
    }

    if (user?.role === 'ADMIN') {
      return [
        { label: 'Admin Dashboard', to: '/admin' },
        { label: 'Events', to: '/admin/events' },
        { label: 'Transactions', to: '/admin/transactions' },
        { label: 'Cancel & Refund', to: '/admin/cancel-refund' },
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Events', to: '/events' },
      { label: 'Wallet', to: '/wallet' },
      { label: 'Bookings', to: '/bookings' }
    ];
  }, [isAuthenticated, user]);

  return (
    <Box>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', color: '#0b1020' }}>
                <ChairRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Seatify</Typography>
                <Typography variant="caption" color="text.secondary">
                  Smart event booking & wallet platform
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {navLinks.map((item) => (
                <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
                  {item.label}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
                    <Avatar sx={{ width: 36, height: 36 }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Avatar>
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem disabled>{user?.name}</MenuItem>
                    <MenuItem disabled>{user?.email}</MenuItem>
                    <MenuItem
                      onClick={() => {
                        logout();
                        setAnchorEl(null);
                        navigate('/login');
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
