const dotenv = require('dotenv');
dotenv.config();

const config = require('../config');
const transferWise = require('../app/lib/transferWise');
const uuidv4 = require('uuid/v4');

(async () => {
    const borderlessAccounts = await transferWise.borderlessAccounts.get(config.get('transferWise.profile.id'));
    const borderlessAccount = borderlessAccounts.find(borderlessAccount => borderlessAccount.id === config.get('transferWise.borderlessAccount.source.id'));
    if (!borderlessAccount) {
        console.error('Chosen borderless account not found');
        return;
    }
    if (!borderlessAccount.balances.length) {
        console.error('Chosen borderless account has no balances');
        return;
    }
    const chosenBalance = borderlessAccount.balances.find(balance => balance.id === config.get('transferWise.balance.source.id'));
    if (!chosenBalance) {
        console.error('Chosen balance not found');
        return;
    }
    if (chosenBalance.amount.value <= 0) {
        console.error('Chosen balance has no funds available to transfer');
        return;
    }

    console.log('Borderless account:', borderlessAccount);
    console.log('Balance:', chosenBalance);

    const accounts = await transferWise.accounts.get();
    const targetAccount = accounts.find(account => account.id === config.get('transferWise.account.target.id'));

    if (!targetAccount) {
        console.error('Chosen target account not found');
        return;
    }

    console.log('Target account:', targetAccount);

    // 1. Create a quote
    let quote;
    try {
        quote = await transferWise.quote.create({
            profile: config.get('transferWise.profile.id'),
            source: chosenBalance.currency,
            target: targetAccount.currency,
            rateType: 'FIXED',
            sourceAmount: chosenBalance.amount.value,
            type: 'BALANCE_PAYOUT'
        });
        console.log('Created a quote:', quote);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        return
    }
    
    // 2. Create a recipient account: skipping because the account is static and is already set up

    // 3. Create a transfer
    let transfer;
    try {
        transfer = await transferWise.transfer.create({
            targetAccount: config.get('transferWise.account.target.id'),
            quote: quote.id,
            customerTransactionId: uuidv4(),
            details: {
                reference: 'Other',
                transferPurpose: 'Other',
                sourceOfFunds: 'Other'
            }
        });
        console.log('Created a transfer:', transfer);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        return
    }
    
    // 4. Fund the transfer
    let transferFundResponse;
    try {
        transferFundResponse = await transferWise.transfer.fund(config.get('transferWise.profile.id'), transfer.id);
        console.log('Transfer fund status:', transferFundResponse);
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
        return
    }
})();
