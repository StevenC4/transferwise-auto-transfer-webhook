const config = require('../../../config');
const fetch = require('isomorphic-fetch');

module.exports._sendRequest = async (method, path, body) => {
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${config.get('transferWise.api.key')}`,
            'Content-Type': 'application/json'
        }
    }
    if (body) {
        options.body = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${config.get('transferWise.api.baseUrl')}${path}`, options);
    const json = await response.json();
    return json;
};

module.exports.accounts = require('./accounts');
module.exports.borderlessAccounts = require('./borderlessAccounts');
module.exports.profiles = require('./profiles');
module.exports.quote = require('./quote');
module.exports.transfer = require('./transfer');
