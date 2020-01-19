const {_sendRequest} = require('.');
const validator = require('../validator');

module.exports.create = async body => {
    const valid = validator.validate('apiRequestBodies/createTransfer.json#', body);
    
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
    return await _sendRequest('POST', `/v3/profiles/${profileId}/transfers/${transferId}/payments`, {
        type: 'BALANCE'
    });
};
