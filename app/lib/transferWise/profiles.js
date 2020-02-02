const transferWise = require('./');

module.exports.get = async () => await transferWise._sendRequest('GET', '/v1/profiles');
