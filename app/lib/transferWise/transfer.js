const {_sendRequest} = require('./');
const config = require('../../../config');
const uuidv4 = require('uuid/v4');

module.exports.create = async body => {
    const valid = validator('apiRequestBodies/createTransfer.json#', body);
    
    if (!valid) {
        console.error(validator.errors);
        const error = new Error('Invalid request body');
        error.validationErrors = validator.errors;
        throw error;
    }

    return await _sendRequest('POST', '/v1/transfers', body);
};

// TODO: Add parameter validation
module.exports.fund = async (profileId, transferId) => {
    return await _sendRequest('POST', `v3/profiles/${profileId}/transfers/${transferId}/payments`, {
        type: 'BALANCE'
    });
};
