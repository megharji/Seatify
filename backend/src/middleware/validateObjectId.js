const mongoose = require('mongoose');
const httpError = require('../utils/httpError');

function validateObjectId(paramName) {
  return (req, _res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw httpError(400, `Invalid ${paramName}`);
    }
    next();
  };
}

module.exports = validateObjectId;
