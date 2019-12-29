const dotenv = require('dotenv');
dotenv.config();

const config = require('../config');
const transferWise = require('../app/lib/transferWise');

(async () => {
    const borderlessAccounts = await transferWise.borderlessAccounts.get(config.get('transferWise.profile.id'));
    borderlessAccounts.forEach(borderlessAccount => {
        console.log('Borderless account', borderlessAccount.id);
        console.log('Account', borderlessAccount);
        console.log('Balances', borderlessAccount.balances);
    });
})();
