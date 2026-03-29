const mongoose = require('mongoose');
const WalletTransaction = require('../models/WalletTransaction');
const { creditWallet } = require('../services/wallet.service');
const { saveIdempotentResponse } = require('../middleware/idempotency');

async function addMoney(req, res) {
  const { amount, note } = req.body;
  const session = await mongoose.startSession();
  let responseBody;

  try {
    await session.withTransaction(async () => {
      const { user, transaction } = await creditWallet({
        userId: req.user._id,
        amount,
        note,
        session
      });

      responseBody = {
        success: true,
        message: 'Money added successfully',
        data: {
          walletBalance: user.walletBalance,
          transaction
        }
      };
    });
  } finally {
    session.endSession();
  }

  await saveIdempotentResponse({
    key: req.idempotencyKey,
    route: req.originalUrl,
    userId: req.user._id,
    responseCode: 200,
    responseBody
  });

  res.json(responseBody);
}

async function getWalletSummary(req, res) {
  const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      walletBalance: req.user.walletBalance,
      transactions
    }
  });
}

module.exports = {
  addMoney,
  getWalletSummary
};
