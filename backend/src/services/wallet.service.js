const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { TRANSACTION_TYPE } = require('../utils/constants');
const httpError = require('../utils/httpError');

async function creditWallet({ userId, amount, note, session }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw httpError(400, 'Amount must be a positive integer');
  }

  const user = await User.findById(userId).session(session);
  if (!user) throw httpError(404, 'User not found');

  user.walletBalance += amount;
  await user.save({ session });

  const [transaction] = await WalletTransaction.create(
    [
      {
        userId,
        type: TRANSACTION_TYPE.CREDIT,
        amount,
        balanceAfter: user.walletBalance,
        note: note || 'Wallet top-up'
      }
    ],
    { session }
  );

  return { user, transaction };
}

async function debitWallet({ userId, amount, bookingId, note, session }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw httpError(400, 'Amount must be a positive integer');
  }

  const user = await User.findById(userId).session(session);
  if (!user) throw httpError(404, 'User not found');
  if (user.walletBalance < amount) throw httpError(400, 'Insufficient wallet balance');

  user.walletBalance -= amount;
  await user.save({ session });

  const [transaction] = await WalletTransaction.create(
    [
      {
        userId,
        type: TRANSACTION_TYPE.DEBIT,
        amount,
        balanceAfter: user.walletBalance,
        bookingId,
        note: note || 'Booking payment'
      }
    ],
    { session }
  );

  return { user, transaction };
}

async function refundWallet({ userId, amount, bookingId, note, session }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw httpError(400, 'Amount must be a positive integer');
  }

  const user = await User.findById(userId).session(session);
  if (!user) throw httpError(404, 'User not found');

  user.walletBalance += amount;
  await user.save({ session });

  const [transaction] = await WalletTransaction.create(
    [
      {
        userId,
        type: TRANSACTION_TYPE.REFUND,
        amount,
        balanceAfter: user.walletBalance,
        bookingId,
        note: note || 'Booking refund'
      }
    ],
    { session }
  );

  return { user, transaction };
}

module.exports = {
  creditWallet,
  debitWallet,
  refundWallet
};
