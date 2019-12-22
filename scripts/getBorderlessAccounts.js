const dotenv = require('dotenv');
dotenv.config();

const config = require('../config');
const transferWise = require('../app/lib/transferWise');

transferWise.borderlessAccounts.get(config.get('transferWise.profile.id')).then(response => console.log(response));
