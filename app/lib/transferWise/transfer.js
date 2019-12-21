const {_sendRequest} = require('./');
const config = require('../../../config');
const uuidv4 = require('uuid/v4');

module.exports.create = async () => {
    return await _sendRequest('POST', '/v1/transfers', {
        targetAccount: config.get('transferWise.account.target.id'),
        quote: req.quote.id,
        customerTransactionId: uuidv4(),
        details: {
            reference: 'Trnsfrws',
            transferPurpose: 'Other',
            sourceOfFunds: 'Other'
        }
    });
};

module.exports.fund = async (profileId, transferId) => {
    return await _sendRequest('POST', `v3/profiles/${profileId}/transfers/${transferId}/payments`, {
        type: 'BALANCE'
    });
};
