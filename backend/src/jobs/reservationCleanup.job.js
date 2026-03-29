const cron = require('node-cron');
const { expireReservations } = require('../services/reservation.service');

function startReservationCleanupJob() {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await expireReservations();
      console.log('Expired reservation cleanup completed');
    } catch (error) {
      console.error('Reservation cleanup failed:', error.message);
    }
  });
}

module.exports = startReservationCleanupJob;
