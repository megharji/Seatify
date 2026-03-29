import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading, initialized } = useAuth();
  const location = useLocation();

  // if (loading || !initialized) {
  //   return (
  //     <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
  //       <CircularProgress />
  //     </Stack>
  //   );
  // }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}
