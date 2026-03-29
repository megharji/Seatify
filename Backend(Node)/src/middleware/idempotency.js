const IdempotencyKey = require('../models/IdempotencyKey');
const httpError = require('../utils/httpError');

function requireIdempotencyKey(req, _res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) {
    throw httpError(400, 'Idempotency-Key header is required');
  }
  req.idempotencyKey = key;
  next();
}

async function replayIfDuplicate(req, res, next) {
  const key = req.idempotencyKey;
  const userId = req.user ? req.user._id : null;
  const existing = await IdempotencyKey.findOne({ key, route: req.originalUrl, userId });

  if (existing) {
    return res.status(existing.responseCode).json({
      ...existing.responseBody,
      idempotentReplay: true
    });
  }

  next();
}

async function saveIdempotentResponse({ key, route, userId, responseCode, responseBody }) {
  await IdempotencyKey.create({
    key,
    route,
    userId,
    responseCode,
    responseBody
  });
}

module.exports = {
  requireIdempotencyKey,
  replayIfDuplicate,
  saveIdempotentResponse
};
