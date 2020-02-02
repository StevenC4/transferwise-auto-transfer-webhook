const transferWise = require('./');

module.exports.get = async profileId => await transferWise._sendRequest('GET', `/v1/borderless-accounts?profileId=${profileId}`);
