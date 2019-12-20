const asyncHandler = require('express-async-handler');
const config = require('../../config');
const uuidv4 = require('uuid/v4');

const baseUrl = config.get('transferWise.api.baseUrl');

module.exports.validateShouldTransferBalance = (req, res, next) => {
    
    next();
};

// https://api-docs.transferwise.com/#quotes-create
module.exports.createQuote = asyncHandler(async (req, res, next) => {
    const response = await fetch(`${baseUrl}/v1/quotes`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.get('transferWise.api.key')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile: config.get('transferWise.profile.id'),
            source: config.get('transferWise.source.currency'),
            target: config.get('transferWise.target.currency'),
            rateType: 'FIXED',
            sourceAmount: req.body.amount,
            type: 'REGULAR'
        })
    });
    req.quote = await response.json();
    next();
});

// https://api-docs.transferwise.com/#transfers-create
module.exports.createTransfer = asyncHandler(async (req, res, next) => {
    const response = await fetch(`${baseUrl}/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.get('transferWise.api.key')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            targetAccount: config.get('transferWise.account.target.id'),
            quote: req.quote.id,
            customerTransactionId: uuidv4(),
            details: {
                reference: 'Trnsfrws',
                transferPurpose: 'Other',
                sourceOfFunds: 'Other'
            }
        })
    });
    const json = await response.json();
    next();
});

// https://api-docs.transferwise.com/#transfers-fund
module.exports.fundTransfer = asyncHandler(async (req, res, next) => {
    next();
});
