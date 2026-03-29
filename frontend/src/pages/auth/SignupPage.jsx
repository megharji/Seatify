import { Alert, Button, Card, CardContent, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
  const { signupForm, loading, error, signupUser, setSignupField, clearAuthError, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    if (user?.role) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    await signupUser(signupForm);
  };

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <div>
                <Typography variant="h4" sx={{ mb: 1 }}>Create account</Typography>
                <Typography color="text.secondary">Create a Seatify account and choose whether this profile should be used as a customer or admin.</Typography>
              </div>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField label="Full name" value={signupForm.name} onChange={(e) => setSignupField('name', e.target.value)} required fullWidth />
              <TextField label="Email" type="email" value={signupForm.email} onChange={(e) => setSignupField('email', e.target.value)} required fullWidth />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={signupForm.password}
                onChange={(e) => setSignupField('password', e.target.value)}
                required
                fullWidth
                helperText="Minimum 6 characters"
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
              <FormControl fullWidth>
                <InputLabel id="role-select-label">Account type</InputLabel>
                <Select
                  labelId="role-select-label"
                  label="Account type"
                  value={signupForm.role}
                  onChange={(e) => setSignupField('role', e.target.value)}
                >
                  <MenuItem value="USER">Customer</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Creating...' : signupForm.role === 'ADMIN' ? 'Create admin account' : 'Create account'}
              </Button>
              <Typography color="text.secondary">
                Already have an account?{' '}
                <Typography component={RouterLink} to="/login" color="primary" sx={{ textDecoration: 'none' }}>
                  Login
                </Typography>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
