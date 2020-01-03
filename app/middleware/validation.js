const config = require('../../config');
const validator = require('../lib/validator');
const logger = require('../lib/loggers/transferWise');

// https://api-docs.transferwise.com/#webhook-events-balance-deposit-event
module.exports.balanceAccountEvent = (req, res, next) => {
    let error;

    if (config.get('logs.transferWise.log')) {
        logger.info(req.body);
    }

    const valid = validator.validate('events/balanceAccount.json#', req.body);
    if (!valid) {
        error = new Error('Invalid event format');
        error.errors = validator.errors;
    } else if (req.body.data.resource.profile_id !== config.get('transferWise.profile.id')) {
        error = new Error(`Wrong profile id: ${req.body.data.resource.profile_id}`);
    } else if (req.body.data.resource.id !== config.get('transferWise.account.source.id')) {
        error = new Error(`Incorrect balance id: ${req.body.data.resource.id}`);
    } else if (req.body.data.amount > req.body.data.post_transaction_balance_amount) {
        error = new Error(`Amount (${req.body.data.amount}) cannot be greater than post_transaction_balance_amount (${req.body.data.post_transaction_balance_amount})`);
    }

    return next(error);
};
