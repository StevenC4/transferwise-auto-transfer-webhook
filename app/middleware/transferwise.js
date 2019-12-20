const asyncHandler = require('express-async-handler');
const config = require('../../config');

const baseUrl = config.get('transferWise.api.baseUrl');

module.exports.validateShouldTransferBalance = (req, res, next) => {
    next();
};