const asyncHandler = require('express-async-handler');
const config = require('../../config');
const transferWise = require('../lib/transferWise');
const uuidv4 = require('uuid/v4')

module.exports.validateShouldTransferBalance = (req, _res, next) => {
    next();
};

// https://api-docs.transferwise.com/#quotes-create
module.exports.createQuote = asyncHandler(async (req, _res, next) => {
    req.quote = await transferWise.quote.create({
        profile: config.get('transferWise.profile.id'),
        source: config.get('transferWise.source.currency'),
        target: config.get('transferWise.target.currency'),
        rateType: 'FIXED',
        sourceAmount: req.body.amount,
        type: 'REGULAR'
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
            reference: 'Trnsfrws',
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
