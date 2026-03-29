import { Card, CardContent, Stack, Typography } from '@mui/material';

export default function StatCard({ label, value, helper }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
          {helper ? (
            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
