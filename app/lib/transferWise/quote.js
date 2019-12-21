const {_sendRequest} = require('./');
const config = require('../../../config');
const validator = require('../../lib/validator');

module.exports.create = async body => {
    const valid = validator('apiRequestBodies/createQuote.json#', body);
    
    if (!valid) {
        console.error(validator.errors);
        const error = new Error('Invalid request body');
        error.validationErrors = validator.errors;
        throw error;
    }

    return await _sendRequest('POST', '/v1/quotes', body);
};
