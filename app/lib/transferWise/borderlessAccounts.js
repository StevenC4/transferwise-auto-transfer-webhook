const {_sendRequest} = require('./');

module.exports.get = async profileId => await _sendRequest('GET', `/v1/borderless-accounts?profileId=${profileId}`);
