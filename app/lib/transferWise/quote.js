const transferWise = require('./');
const validator = require('../../lib/validator');

module.exports.create = async body => {
    const valid = validator.validate('apiRequestBodies/createQuote.json#', body);
    
    if (!valid) {
        console.error(validator.errors);
        const error = new Error('Invalid request body');
        error.validationErrors = validator.errors;
        throw error;
    }

    return await transferWise._sendRequest('POST', '/v1/quotes', body);
};
