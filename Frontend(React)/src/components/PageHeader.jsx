import { Box, Chip, Stack, Typography } from '@mui/material';

export default function PageHeader({ eyebrow, title, subtitle, chip }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          {eyebrow ? (
            <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 1.2 }}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h4" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
        </Box>
        {chip ? <Chip label={chip} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} /> : null}
      </Stack>
    </Box>
  );
}
