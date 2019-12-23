const dotenv = require('dotenv');
dotenv.config();

const transferWise = require('../app/lib/transferWise');

transferWise.profiles.get().then(response => console.log(response)).catch(error => console.error(error));
