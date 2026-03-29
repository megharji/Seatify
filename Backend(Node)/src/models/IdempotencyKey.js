const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    route: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    responseCode: {
      type: Number,
      default: 200
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
