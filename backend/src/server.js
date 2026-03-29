require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const startReservationCleanupJob = require('./jobs/reservationCleanup.job');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  startReservationCleanupJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});