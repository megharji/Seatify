import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAdminMessages,
  fetchAdminDashboard,
} from "../../redux/reducer/adminReducer";

const STATUS_COLOR = { CONFIRMED: "success", CANCELLED: "error", RESERVED: "warning" };

export default function AdminDashboardPage() {
  const dispatch = useDispatch();

  const events      = useSelector((s) => s.admin.events);
  const bookings    = useSelector((s) => s.admin.bookings);
  const transactions = useSelector((s) => s.admin.transactions);
  const error       = useSelector((s) => s.admin.error);
  const loading     = useSelector((s) => s.admin.loading);

  const [filterUser, setFilterUser] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    dispatch(clearAdminMessages());
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const analytics = useMemo(() => {
    const total      = bookings.length;
    const confirmed  = bookings.filter((b) => b.status === "CONFIRMED");
    const cancelled  = bookings.filter((b) => b.status === "CANCELLED");
    const reserved   = bookings.filter((b) => b.status === "RESERVED");

    const revenue    = confirmed.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const refunds    = transactions
      .filter((t) => t.type === "REFUND")
      .reduce((s, t) => s + (t.amount || 0), 0);

    // revenue per event
    const revenueByEvent = {};
    confirmed.forEach((b) => {
      const id    = b.eventId?._id || b.eventId;
      const title = b.eventId?.title || "Unknown";
      if (!revenueByEvent[id]) revenueByEvent[id] = { title, revenue: 0, bookings: 0 };
      revenueByEvent[id].revenue  += b.totalAmount || 0;
      revenueByEvent[id].bookings += 1;
    });
    const topEvents = Object.values(revenueByEvent)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const txByType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + (t.amount || 0);
      return acc;
    }, {});

    return {
      total,
      confirmed: confirmed.length,
      cancelled: cancelled.length,
      reserved:  reserved.length,
      revenue,
      refunds,
      confirmedRate: total ? Math.round((confirmed.length / total) * 100) : 0,
      cancelledRate: total ? Math.round((cancelled.length / total) * 100) : 0,
      reservedRate:  total ? Math.round((reserved.length  / total) * 100) : 0,
      topEvents,
      txByType,
    };
  }, [bookings, transactions]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchUser =
        !filterUser ||
        (b.userId?.name || "").toLowerCase().includes(filterUser.toLowerCase()) ||
        (b.userId?.email || "").toLowerCase().includes(filterUser.toLowerCase());
      const matchEvent =
        !filterEvent ||
        (b.eventId?.title || "").toLowerCase().includes(filterEvent.toLowerCase());
      const matchStatus = filterStatus ? b.status === filterStatus : true;
      return matchUser && matchEvent && matchStatus;
    });
  }, [bookings, filterUser, filterEvent, filterStatus]);

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
        title="Analytics dashboard"
        subtitle="Live overview of events, bookings, revenue, and transactions."
        chip="Admin access"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {/* ── Top stat cards ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Events" value={events.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total bookings" value={analytics.total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Confirmed bookings" value={analytics.confirmed} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total revenue" value={`₹${analytics.revenue}`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ── Booking status breakdown ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Booking breakdown</Typography>
              <Stack spacing={2.5} sx={{ mt: 1 }}>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">Confirmed</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {analytics.confirmed} ({analytics.confirmedRate}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.confirmedRate}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">Reserved</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {analytics.reserved} ({analytics.reservedRate}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.reservedRate}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">Cancelled</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {analytics.cancelled} ({analytics.cancelledRate}%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={analytics.cancelledRate}
                    color="error"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total revenue</Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    ₹{analytics.revenue}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total refunds</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    ₹{analytics.refunds}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Net</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₹{analytics.revenue - analytics.refunds}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Top events by revenue ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top events by revenue</Typography>
              {analytics.topEvents.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topEvents.map((ev, i) => (
                      <TableRow key={ev.title}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{ev.title}</TableCell>
                        <TableCell align="right">{ev.bookings}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          ₹{ev.revenue}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No confirmed bookings yet.
                </Typography>
              )}

              {Object.keys(analytics.txByType).length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction volume by type
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {Object.entries(analytics.txByType).map(([type, amount]) => (
                      <Chip
                        key={type}
                        label={`${type}: ₹${amount}`}
                        size="small"
                        color={type === "REFUND" ? "error" : type === "CREDIT" ? "success" : "default"}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Recent bookings table ── */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">Recent bookings</Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredBookings.length} of {bookings.length} bookings
            </Typography>
          </Stack>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Filter by user"
                placeholder="Name or email"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                label="Filter by event"
                placeholder="Event name"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="RESERVED">Reserved</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {filteredBookings.length ? (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Seats</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell>{b.eventId?.title || "—"}</TableCell>
                      <TableCell>{b.userId?.name || b.userId?.email || "—"}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {b._id}
                      </TableCell>
                      <TableCell>
                        {b.seatIds?.map((s) => s.seatNumber).join(", ") || "—"}
                      </TableCell>
                      <TableCell align="right">₹{b.totalAmount}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={b.status}
                          color={STATUS_COLOR[b.status] || "default"}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(b.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {bookings.length ? "No bookings match your filters." : "No bookings yet."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
