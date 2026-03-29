import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginRequest, meRequest, signupRequest } from '../api/authApi';
import { clearAuth, loadAuth, saveAuth } from '../../utils/storage';

const persistedAuth = loadAuth();

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    
    const res = await loginRequest(payload);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Login failed');
  }
});

export const signupUser = createAsyncThunk('auth/signupUser', async (payload, { rejectWithValue }) => {
  try {
    const res = await signupRequest(payload);

    return res.data.data;
  } catch (error) {

    return rejectWithValue(error?.response?.data?.message || 'Signup failed');
  }
});

export const refreshMe = createAsyncThunk('auth/refreshMe', async (_, { rejectWithValue }) => {
  try {
    const res = await meRequest();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to refresh user');
  }
});

const initialFormState = { email: '', password: '' };
const initialSignupFormState = { name: '', email: '', password: '', role: 'USER' };

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: persistedAuth?.token || null,
    user: persistedAuth?.user || null,
    loading: false,
    initialized: !persistedAuth?.token,
    error: '',
    loginForm: initialFormState,
    signupForm: initialSignupFormState
  },
  reducers: {
    setSession(state, action) {
      state.token = action.payload?.token || null;
      state.user = action.payload?.user || null;
      state.loading = false;
      state.initialized = true;
      state.error = '';
      saveAuth({ token: state.token, user: state.user });
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      state.initialized = true;
      state.error = '';
      clearAuth();
    },
    setLoginField(state, action) {
      const { field, value } = action.payload;
      state.loginForm[field] = value;
    },
    setSignupField(state, action) {
      const { field, value } = action.payload;
      state.signupForm[field] = value;
    },
    resetLoginForm(state) {
      state.loginForm = initialFormState;
    },
    resetSignupForm(state) {
      state.signupForm = initialSignupFormState;
    },
    clearAuthError(state) {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
        state.loginForm = initialFormState;
        saveAuth({ token: state.token, user: state.user });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
        state.signupForm = initialSignupFormState;
        saveAuth({ token: state.token, user: state.user });
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      })
      .addCase(refreshMe.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(refreshMe.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
        saveAuth({ token: state.token, user: state.user });
      })
      .addCase(refreshMe.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload || 'Session expired';
        state.token = null;
        state.user = null;
        clearAuth();
      });
  }
});

export const {
  setSession,
  logout,
  setLoginField,
  setSignupField,
  resetLoginForm,
  resetSignupForm,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
