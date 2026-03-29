import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";
import PageHeader from "../../../components/PageHeader";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAdminMessages,
  createAdminEvent,
  createAdminSeats,
  deleteAdminEvent,
  fetchAdminDashboard,
  fetchAllEventsSeats,
  setAdminEventField,
  setAdminField,
  updateAdminEvent,
} from "../../../redux/reducer/adminReducer";

const STATUS_COLOR = { BOOKED: "error", RESERVED: "warning", AVAILABLE: "success" };

export default function Event() {
  const dispatch = useDispatch();

  const events = useSelector((state) => state.admin.events);
  const seatsMap = useSelector((state) => state.admin.seatsMap);
  const form = useSelector((state) => state.admin.eventForm);
  const selectedEventId = useSelector((state) => state.admin.selectedEventId);
  const error = useSelector((state) => state.admin.error);
  const success = useSelector((state) => state.admin.success);
  const loading = useSelector((state) => state.admin.loading);
  const actionLoading = useSelector((state) => state.admin.actionLoading);
  const seatsLoading = useSelector((state) => state.admin.seatsLoading);

  const [seatCount, setSeatCount] = useState("");
  const [price, setPrice] = useState("");
  const [editEvent, setEditEvent] = useState(null); // holds event being edited

  useEffect(() => {
    dispatch(clearAdminMessages());
    const load = async () => {
      await dispatch(fetchAdminDashboard());
      await dispatch(fetchAllEventsSeats());
    };
    load();
  }, [dispatch]);

  const handleUpdateEvent = async () => {
    if (!editEvent) return;
    await dispatch(updateAdminEvent({
      eventId: editEvent._id,
      payload: {
        title: editEvent.title,
        venue: editEvent.venue,
        startsAt: editEvent.startsAt,
        description: editEvent.description,
      },
    }));
    setEditEvent(null);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    await dispatch(createAdminEvent());
  };

  const handleCreateSeats = async () => {
    const totalSeats = Number(seatCount);
    const seatPrice = Number(price);

    if (!selectedEventId) {
      dispatch(setAdminField({ field: "error", value: "Please select an event" }));
      return;
    }
    if (!totalSeats || totalSeats <= 0) {
      dispatch(setAdminField({ field: "error", value: "Enter a valid number of seats" }));
      return;
    }
    if (!seatPrice || seatPrice <= 0) {
      dispatch(setAdminField({ field: "error", value: "Enter a valid seat price" }));
      return;
    }

    const generatedSeats = Array.from({ length: totalSeats }, (_, i) => ({
      seatNumber: `A${i + 1}`,
      price: seatPrice,
    }));

    dispatch(setAdminField({ field: "seatsJson", value: JSON.stringify(generatedSeats) }));
    await dispatch(createAdminSeats());
    await dispatch(fetchAllEventsSeats());

    setSeatCount("");
    setPrice("");
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
        eyebrow="Admin panel · Events"
        title="Events"
        subtitle="Create events, bulk-add seats, and view all event inventory."
        chip="Admin access"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      {/* ── Create event & seats ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack component="form" onSubmit={handleCreateEvent} spacing={2}>
                <Typography variant="h6">Create event</Typography>

                <TextField
                  label="Title"
                  value={form.title}
                  onChange={(e) =>
                    dispatch(setAdminEventField({ field: "title", value: e.target.value }))
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Venue"
                  value={form.venue}
                  onChange={(e) =>
                    dispatch(setAdminEventField({ field: "venue", value: e.target.value }))
                  }
                  required
                  fullWidth
                />

                <TextField
                  label="Starts at"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    dispatch(setAdminEventField({ field: "startsAt", value: e.target.value }))
                  }
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) =>
                    dispatch(setAdminEventField({ field: "description", value: e.target.value }))
                  }
                  fullWidth
                />

                <Button type="submit" variant="contained" disabled={actionLoading}>
                  {actionLoading ? <CircularProgress size={20} /> : "Create event"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Bulk create seats</Typography>

                <TextField
                  select
                  label="Select event"
                  value={selectedEventId}
                  onChange={(e) =>
                    dispatch(setAdminField({ field: "selectedEventId", value: e.target.value }))
                  }
                  fullWidth
                >
                  {events.map((event) => (
                    <MenuItem key={event._id} value={event._id}>
                      {event.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Number of seats"
                  type="number"
                  value={seatCount}
                  onChange={(e) => setSeatCount(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Price per seat"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                />

                <Button
                  variant="outlined"
                  onClick={handleCreateSeats}
                  disabled={!selectedEventId || actionLoading}
                >
                  Create seats
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Created events list ── */}
      <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
        Created events
      </Typography>

      {!events.length ? (
        <Typography color="text.secondary">No events created yet.</Typography>
      ) : (
        events.map((event) => {
          const seats = seatsMap[event._id] || [];
          const totalSeats = seats.length;
          const bookedSeats = seats.filter((s) => s.status === "BOOKED").length;
          const reservedSeats = seats.filter((s) => s.status === "RESERVED").length;
          const availableSeats = totalSeats - bookedSeats - reservedSeats;
          const totalAmount = seats.reduce((sum, s) => sum + (s.price || 0), 0);

          return (
            <Accordion key={event._id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ width: "100%", pr: 2 }}
                >
                  <Box>
                    <Typography fontWeight={700}>{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.venue}&nbsp;·&nbsp;
                      {dayjs(event.startsAt).format("DD MMM YYYY, hh:mm A")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={`${totalSeats} seats`} />
                    <Chip size="small" label={`₹${totalAmount}`} color="primary" />
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditEvent({
                          _id: event._id,
                          title: event.title,
                          venue: event.venue,
                          startsAt: event.startsAt ? dayjs(event.startsAt).format("YYYY-MM-DDTHH:mm") : "",
                          description: event.description || "",
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(deleteAdminEvent(event._id));
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
                  {event.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  ) : null}

                  <Divider />

                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Total seats</TableCell>
                          <TableCell>Available</TableCell>
                          <TableCell>Reserved</TableCell>
                          <TableCell>Booked</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{totalSeats}</TableCell>
                          <TableCell>
                            <Chip size="small" label={availableSeats} color="success" />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={reservedSeats} color="warning" />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={bookedSeats} color="error" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>

                  {seatsLoading ? (
                    <CircularProgress size={20} />
                  ) : seats.length ? (
                    <Box sx={{ overflowX: "auto" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Seat</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {seats.map((seat) => (
                            <TableRow key={seat._id}>
                              <TableCell>{seat.seatNumber}</TableCell>
                              <TableCell>₹{seat.price}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={seat.status}
                                  color={STATUS_COLOR[seat.status] || "default"}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No seats created yet.
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      {/* ── Edit event dialog ── */}
      <Dialog open={Boolean(editEvent)} onClose={() => setEditEvent(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editEvent?.title || ""}
              onChange={(e) => setEditEvent((prev) => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Venue"
              value={editEvent?.venue || ""}
              onChange={(e) => setEditEvent((prev) => ({ ...prev, venue: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Starts at"
              type="datetime-local"
              value={editEvent?.startsAt || ""}
              onChange={(e) => setEditEvent((prev) => ({ ...prev, startsAt: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={editEvent?.description || ""}
              onChange={(e) => setEditEvent((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEvent(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateEvent} disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
