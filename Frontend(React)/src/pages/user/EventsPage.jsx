import { Alert, Button, Card, CardActions, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../redux/reducer/eventsReducer';

export default function EventsPage() {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.items);
  const loading = useSelector((state) => state.events.loading);
  const error = useSelector((state) => state.events.error);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  if (loading) {
    return <Stack alignItems="center" sx={{ mt: 8 }}><CircularProgress /></Stack>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Events"
        title="Available events"
        subtitle="Browse all active events and reserve your seats."
        chip={`${events.length} events`}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {events.map((event) => (
          <Grid key={event._id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1.2}>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography color="text.secondary">{event.venue}</Typography>
                  <Typography color="text.secondary">
                    {dayjs(event.startsAt).format('DD MMM YYYY, hh:mm A')}
                  </Typography>
                  {event.description ? (
                    <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                  ) : null}
                </Stack>
              </CardContent>
              <CardActions>
                <Button component={RouterLink} to={`/events/${event._id}`} fullWidth variant="contained">
                  Open event
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {!events.length ? (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">No events found.</Typography>
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
}
