const {_sendRequest} = require('./');
const config = require('../../../config');

module.exports.create = async (amount) => {
    return await _sendRequest('POST', '/v1/quotes', {
        profile: config.get('transferWise.profile.id'),
        source: config.get('transferWise.source.currency'),
        target: config.get('transferWise.target.currency'),
        rateType: 'FIXED',
        sourceAmount: amount,
        type: 'REGULAR'
    });
};
