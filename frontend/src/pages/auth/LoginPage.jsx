import { Alert, Button, Card, CardContent, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { loginForm, loading, error, loginUser, setLoginField, clearAuthError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    if (user?.role) {
      navigate(location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : '/dashboard'), { replace: true });
    }
  }, [user, navigate, location.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await loginUser(loginForm);
  };

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <div>
                <Typography variant="h4" sx={{ mb: 1 }}>Welcome back</Typography>
                <Typography color="text.secondary">Login to continue booking, wallet, and admin workflows in Seatify.</Typography>
              </div>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField label="Email" type="email" value={loginForm.email} onChange={(e) => setLoginField('email', e.target.value)} required fullWidth />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginField('password', e.target.value)}
                required
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </Button>
              <Typography color="text.secondary">
                New here?{' '}
                <Typography component={RouterLink} to="/signup" color="primary" sx={{ textDecoration: 'none' }}>
                  Create an account
                </Typography>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
