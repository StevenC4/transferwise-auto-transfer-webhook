const config = require('../../../config');
const transferWise = require('./');

module.exports.get = async () => await transferWise._sendRequest('GET', `/v1/accounts?profile=${config.get('transferWise.profile.id')}`);
