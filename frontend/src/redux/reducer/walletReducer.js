import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addMoneyRequest, getWalletSummaryRequest } from '../api/walletApi';
import { getIdempotencyKey } from '../../utils/idempotency';

export const fetchWalletSummary = createAsyncThunk('wallet/fetchWalletSummary', async (_, { rejectWithValue }) => {
  try {
    const res = await getWalletSummaryRequest();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load wallet');
  }
});

export const addMoneyToWallet = createAsyncThunk('wallet/addMoneyToWallet', async ({ amount, note }, { rejectWithValue, dispatch }) => {
  try {
    await addMoneyRequest(
      { amount: Number(amount), note },
      { headers: { 'Idempotency-Key': getIdempotencyKey('wallet') } }
    );
    await dispatch(fetchWalletSummary());
    return 'Wallet balance updated successfully.';
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to add money');
  }
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    summary: { walletBalance: 0, transactions: [] },
    form: { amount: '500', note: 'Wallet top-up' },
    loading: false,
    actionLoading: false,
    error: '',
    success: ''
  },
  reducers: {
    setWalletField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    clearWalletMessages(state) {
      state.error = '';
      state.success = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletSummary.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload || { walletBalance: 0, transactions: [] };
      })
      .addCase(fetchWalletSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load wallet';
      })
      .addCase(addMoneyToWallet.pending, (state) => {
        state.actionLoading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = action.payload;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to add money';
      });
  }
});

export const { setWalletField, clearWalletMessages } = walletSlice.actions;
export default walletSlice.reducer;
