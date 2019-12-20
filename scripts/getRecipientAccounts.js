const dotenv = require('dotenv');
dotenv.config();

const config = require('../config');
const fetch = require('isomorphic-fetch');

fetch(`${config.get('transferWise.api.baseUrl')}/v1/accounts`, {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${config.get('transferWise.api.key')}`
    }
})
.then(response => response.json())
.then(json => console.log(json));
