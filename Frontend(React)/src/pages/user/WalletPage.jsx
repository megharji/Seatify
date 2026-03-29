import { Alert, Button, Card, CardContent, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { useDispatch, useSelector } from 'react-redux';
import { addMoneyToWallet, clearWalletMessages, fetchWalletSummary, setWalletField } from '../../redux/reducer/walletReducer';

export default function WalletPage() {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.wallet.summary);
  const form = useSelector((state) => state.wallet.form);
  const loading = useSelector((state) => state.wallet.loading);
  const actionLoading = useSelector((state) => state.wallet.actionLoading);
  const error = useSelector((state) => state.wallet.error);
  const success = useSelector((state) => state.wallet.success);

  useEffect(() => {
    dispatch(clearWalletMessages());
    dispatch(fetchWalletSummary());
  }, [dispatch]);

  const addMoney = async (e) => {
    e.preventDefault();
    await dispatch(addMoneyToWallet(form));
  };

  // if (loading) {
  //   return <Stack alignItems="center" sx={{ mt: 8 }}><CircularProgress /></Stack>;
  // }

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Wallet" title="Manage balance and transaction history" subtitle="Top up your wallet and review every credit or debit in one place." chip={`₹${summary.walletBalance || 0} available`} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Current balance" value={`₹${summary.walletBalance || 0}`} helper="Required for booking confirmation." />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack component="form" onSubmit={addMoney} spacing={2}>
                <Typography variant="h6">Add money</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Amount" type="number" value={form.amount} onChange={(e) => dispatch(setWalletField({ field: 'amount', value: e.target.value }))} fullWidth required />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField label="Note" value={form.note} onChange={(e) => dispatch(setWalletField({ field: 'note', value: e.target.value }))} fullWidth />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" disabled={actionLoading} sx={{ alignSelf: 'flex-start' }}>
                  {actionLoading ? 'Adding...' : 'Add money'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Transaction history</Typography>
            {summary.transactions.map((tx) => (
              <Grid container spacing={2} key={tx._id} sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Grid size={{ xs: 12, md: 2 }}><Typography fontWeight={700}>{tx.type}</Typography></Grid>
                <Grid size={{ xs: 12, md: 2 }}><Typography>₹{tx.amount}</Typography></Grid>
                <Grid size={{ xs: 12, md: 3 }}><Typography color="text.secondary">Balance after: ₹{tx.balanceAfter}</Typography></Grid>
                <Grid size={{ xs: 12, md: 3 }}><Typography color="text.secondary">{tx.note || '—'}</Typography></Grid>
                <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">{dayjs(tx.createdAt).format('DD MMM, hh:mm A')}</Typography></Grid>
              </Grid>
            ))}
            {!summary.transactions.length ? <Typography color="text.secondary">No wallet activity yet.</Typography> : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
