import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
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
import { clearAdminMessages, fetchAdminDashboard } from "../../redux/reducer/adminReducer";

const TYPE_COLOR = { CREDIT: "success", DEBIT: "error", REFUND: "warning" };

export default function TransactionsPage() {
  const dispatch = useDispatch();

  const transactions = useSelector((s) => s.admin.transactions);
  const error = useSelector((s) => s.admin.error);
  const loading = useSelector((s) => s.admin.loading);

  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    dispatch(clearAdminMessages());
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const txTypes = useMemo(() => [...new Set(transactions.map((t) => t.type))], [transactions]);

  const stats = useMemo(() => {
    const total = transactions.reduce((s, t) => s + (t.amount || 0), 0);
    const byType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + (t.amount || 0);
      return acc;
    }, {});
    return { total, byType };
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = filterQuery.toLowerCase();
    return transactions.filter((t) => {
      const matchQuery =
        !q ||
        (t.userId?.name || "").toLowerCase().includes(q) ||
        (t.userId?.email || "").toLowerCase().includes(q) ||
        (t._id || "").toLowerCase().includes(q) ||
        (t.note || "").toLowerCase().includes(q);
      const matchType = filterType ? t.type === filterType : true;
      return matchQuery && matchType;
    });
  }, [transactions, filterQuery, filterType]);

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
        eyebrow="Admin panel · Transactions"
        title="Wallet transactions"
        subtitle="Full history of all wallet credits, debits, and refunds across all users."
        chip="Admin access"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {/* ── Summary stat cards ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total transactions" value={transactions.length} />
        </Grid>
        {Object.entries(stats.byType).map(([type, amount]) => (
          <Grid key={type} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label={`${type} volume`} value={`₹${amount}`} />
          </Grid>
        ))}
      </Grid>

      {/* ── Transactions table ── */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">All transactions</Typography>
            <Typography variant="body2" color="text.secondary">
              {filtered.length} of {transactions.length}
            </Typography>
          </Stack>

          {/* Filters */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by user, note, or transaction ID"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
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
            <TextField
              select
              size="small"
              sx={{ minWidth: 160 }}
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">All types</MenuItem>
              {txTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Stack>

          {filtered.length ? (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Balance after</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.type}
                          color={TYPE_COLOR[tx.type] || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{tx.userId?.name || "—"}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tx.userId?.email || ""}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₹{tx.amount}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {tx.balanceAfter != null ? `₹${tx.balanceAfter}` : "—"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {tx.note || "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                        {dayjs(tx.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {transactions.length ? "No transactions match your filters." : "No transactions yet."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
