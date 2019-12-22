const asyncHandler = require('express-async-handler');
const config = require('../../config');
const transferWise = require('../lib/transferWise');
const uuidv4 = require('uuid/v4')
const validator = require('../lib/validator');

// https://api-docs.transferwise.com/#quotes-create
module.exports.createQuote = asyncHandler(async (req, _res, next) => {
    req.quote = await transferWise.quote.create({
        profile: config.get('transferWise.profile.id'),
        source: config.get('transferWise.currency.source'),
        target: config.get('transferWise.currency.target'),
        rateType: 'FIXED',
        sourceAmount: req.body.data.amount,
        type: 'BALANCE_PAYOUT'
    });
    next();
});

// https://api-docs.transferwise.com/#transfers-create
module.exports.createTransfer = asyncHandler(async (req, _res, next) => {
    req.transfer = await transferWise.transfer.create({
        targetAccount: config.get('transferWise.account.target.id'),
        quote: req.quote.id,
        customerTransactionId: uuidv4(),
        details: {
            reference: 'Other',
            transferPurpose: 'Other',
            sourceOfFunds: 'Other'
        }
    });
    next();
});

// https://api-docs.transferwise.com/#transfers-fund
module.exports.fundTransfer = asyncHandler(async (req, _res, next) => {
    req.transferStatus = await transferWise.transfer.fund(config.get('transferWise.profile.id'), req.transfer.id);
    next();
});
