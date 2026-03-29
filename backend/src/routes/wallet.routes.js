const express = require('express');
const { addMoney, getWalletSummary } = require('../controllers/wallet.controller');
const { protect, authorize } = require('../middleware/auth');
const { requireIdempotencyKey, replayIfDuplicate } = require('../middleware/idempotency');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.USER, ROLES.ADMIN));
router.get('/', getWalletSummary);
router.post('/add-money', requireIdempotencyKey, replayIfDuplicate, addMoney);

module.exports = router;
