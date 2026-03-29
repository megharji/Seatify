const express = require('express');
const { listEvents, getEventSeats } = require('../controllers/event.controller');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/', listEvents);
router.get('/:eventId/seats', validateObjectId('eventId'), getEventSeats);

module.exports = router;
