const dotenv = require('dotenv');
dotenv.config();

const transferWise = require('../app/lib/transferWise');

transferWise.accounts.get().then(response => console.log(response));
