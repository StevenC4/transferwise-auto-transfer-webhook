const {_sendRequest} = require('.');

module.exports.get = async () => await _sendRequest('GET', '/v1/profiles');