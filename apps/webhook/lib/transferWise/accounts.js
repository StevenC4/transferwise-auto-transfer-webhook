const config = require('../../../config');
const {_sendRequest} = require('.');

module.exports.get = async () => await _sendRequest('GET', `/v1/accounts?profile=${config.get('transferWise.profile.id')}`);
