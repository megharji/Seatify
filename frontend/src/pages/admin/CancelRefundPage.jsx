import { useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import {
  cancelAdminBooking,
  clearAdminMessages,
  fetchAdminDashboard,
  setAdminField,
} from "../../redux/reducer/adminReducer";

export default function CancelRefundPage() {
  const dispatch = useDispatch();

  const transactions = useSelector((state) => state.admin.transactions);
  const cancelBookingId = useSelector((state) => state.admin.cancelBookingId);
  const error = useSelector((state) => state.admin.error);
  const success = useSelector((state) => state.admin.success);
  const actionLoading = useSelector((state) => state.admin.actionLoading);
  const loading = useSelector((state) => state.admin.loading);

  useEffect(() => {
    dispatch(clearAdminMessages());
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const handleCancelBooking = async () => {
    await dispatch(cancelAdminBooking());
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "60vh" }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Admin panel"
        title="Cancel & refund"
        subtitle="Cancel a booking by ID and process the wallet refund automatically."
        chip="Admin access"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Cancel booking</Typography>

            <TextField
              label="Booking ID"
              value={cancelBookingId}
              onChange={(e) =>
                dispatch(setAdminField({ field: "cancelBookingId", value: e.target.value }))
              }
              fullWidth
            />

            <Button
              variant="contained"
              color="error"
              onClick={handleCancelBooking}
              disabled={!cancelBookingId || actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : "Cancel booking"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Recent transactions</Typography>

            <Stack spacing={1.4}>
              {transactions.slice(0, 8).map((tx) => (
                <Stack
                  key={tx._id}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Typography fontWeight={700}>{tx.type}</Typography>
                  <Typography color="text.secondary">₹{tx.amount}</Typography>
                  <Typography color="text.secondary">
                    {dayjs(tx.createdAt).format("DD MMM, hh:mm A")}
                  </Typography>
                </Stack>
              ))}

              {!transactions.length ? (
                <Typography color="text.secondary">No transactions yet.</Typography>
              ) : null}
            </Stack>

            <Divider />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
