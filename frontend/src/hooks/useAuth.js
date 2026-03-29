import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  loginUser,
  logout,
  refreshMe,
  setLoginField,
  setSession,
  setSignupField,
  signupUser
} from '../redux/reducer/authReducer';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    initialized: auth.initialized,
    error: auth.error,
    loginForm: auth.loginForm,
    signupForm: auth.signupForm,
    isAuthenticated: Boolean(auth.token && auth.user),
    setSession: (payload) => dispatch(setSession(payload)),
    logout: () => dispatch(logout()),
    refreshMe: () => dispatch(refreshMe()),
    loginUser: (payload) => dispatch(loginUser(payload)),
    signupUser: (payload) => dispatch(signupUser(payload)),
    setLoginField: (field, value) => dispatch(setLoginField({ field, value })),
    setSignupField: (field, value) => dispatch(setSignupField({ field, value })),
    clearAuthError: () => dispatch(clearAuthError())
  };
}
