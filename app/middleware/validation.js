const validator = require('../lib/validator');

// https://api-docs.transferwise.com/#webhook-events-balance-deposit-event
module.exports.balanceAccountEvent = (req, res, next) => {
    let error; 
    
    const valid = validator.validate('events/balanceAccount.json#', req.body);
    if (!valid) {
        console.error(validator.errors);
        error = new Error('Invalid event format');
    }

    return next(error);
};
