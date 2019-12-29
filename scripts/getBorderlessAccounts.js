const dotenv = require('dotenv');
dotenv.config();

const config = require('../config');
const transferWise = require('../app/lib/transferWise');

(async () => {
    const borderlessAccounts = await transferWise.borderlessAccounts.get(config.get('transferWise.profile.id'));
    console.log(borderlessAccounts, borderlessAccounts[0].balances);
})();
