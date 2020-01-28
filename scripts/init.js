const dotenv = require('dotenv');
dotenv.config();
const config = require('../config');
const prompts = require('prompts');
const readline = require('readline');
const transferWise = require('../app/lib/transferWise');
const util = require('util');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const processAnswer = answer => answer.trim();
const question = questionText => new Promise(resolve => rl.question(questionText, answer => resolve(processAnswer(answer))));

(async () => {
	const response = await prompts([
		{
			type: config.get('transferWise.api.key') ? 'confirm' : null,
			name: 'overwriteApiKey',
			message: 'It looks like you already have an API key set. Would you like to overwrite it?',
			initial: false
		},
		{
			type: overwriteApiKey => {
				if (config.get('transferWise.api.key') && overwriteApiKey) {
					return 'password';
				} else if (!config.get('transferWise.api.key')) {
					return 'password';
				} else {
					return null;
				}
			},
			name: 'apiKey',
			message: 'Enter your TransferWise API key:',
			validate: apiKey => (typeof apiKey === "string" || apiKey instanceof String) && apiKey.length
		}
	]);

	if (response.apiKey) {
		config.set('transferWise.api.key', response.apiKey);
	}
})();

(async () => {
	return;
	// Obtain user's TransferWise API key
	if (!config.get('transferWise.api.key')) {
		const apiKey = await question('Enter your TransferWise API key: ');
		console.log();
		config.set('transferWise.api.key', apiKey);
	}

	// Obtain user's TransferWise profile Id
	if (!config.get('transferWise.profile.id')) {
		console.log('Discovering your TransferWise profile Id...');
		const profiles = await transferWise.profiles.get();
		let profileId;
		if (profiles.length === 1) {
			console.log('You have only one TransferWise profile. Storing your profile Id.');
			profileId = profiles[0].id;
		} else if (profiles.length > 1) {
			console.log('You have more than one TransferWise profile.');
			console.log(`From the list below, chose which TransferWise profile you would like to use. You will likely want to choose one of type "personal"`);
			console.log(profiles);
			profileId = await question(`Enter your the "id" field of the profile you would like to use: `);
		} else {
			console.log();
			console.error('Error: you have no TransferWise profiles associated with your API token. Make sure your token is valid and that you have a TransferWise profile set up.');
			rl.close();
			process.exit(1);
		}

		console.log();
		config.set('transferWise.profile.id', profileId);
	}

	// Obtain user's TransferWise source account Id
	if (!config.get('transferWise.account.source.id')) {
		console.log('Discovering your source accounts...');
		const sourceAccounts = await transferWise.borderlessAccounts.get(config.get('transferWise.profile.id'));
		console.log(util.inspect(sourceAccounts, {showHidden: false, depth: null}));
		const sourceAccountId = await question(`Review the list of accounts and enter the "id" field from the desired source account here: `);

		sourceAccountId = parseInt(sourceAccountId, 10);
		if (sourceAccountId === NaN) {
			console.log();
			console.error('Error: The account Id you have entered is not an integer. TransferWise uses integer account ids.');
			rl.close();
			process.exit(1);
		}

		console.log();
		config.set('transferWise.account.source.id', sourceAccountId);
	}

	// Obtain user's TransferWise target account Id
	if (!config.get('transferWise.account.target.id')) {
		console.log('Discovering your linked recipient accounts...');
		const accounts = await transferWise.accounts.get();
		const likelyAccountIds = accounts.filter(account => account.type !== 'balance' && account.ownedByCustomer === true).map(account => account.id);
		let recipientAccountId;
		if (!accounts.length) {
			console.log();
			console.error('Error: you have no linked recipient accounts set up in TransferWise. Make sure you have chosen the correct profile Id.');
			console.error('If you have chosen the correct profile, make sure to set up a recipient account.');
			rl.close();
			process.exit(1);
		} else {
			console.log(accounts);
			if (!likelyAccountIds.length) {
				console.log(`No likely recipient accounts found. A likely recipient account will not be of type "balance" and will have "ownedByCustomer: true".`);
				recipientAccountId = await question(`If you would like to proceed anyway, look at the account${likelyAccountIds.length > 1 ? 's' : ''} listed above and enter its "id" field here: `);
			} else {
				if (likelyAccountIds.length === 1) {
					console.log('The likely candidate for your intended recipient account is:', likelyAccountIds[0]);
				} else {
					console.log('Likely candidates for your intended recipient account are:');
					likelyAccountIds.forEach(accountId => console.log('\t', accountId));
				}
				recipientAccountId = await question(`Review the list of accounts and likely candidates above and enter the "id" field from the desired target account here: `);
			}
		}

		recipientAccountId = parseInt(recipientAccountId, 10);
		if (recipientAccountId === NaN) {
			console.log();
			console.error('Error: The account Id you have entered is not an integer. TransferWise uses integer account ids.');
			rl.close();
			process.exit(1);
		}

		console.log();
		config.set('transferWise.account.target.id', recipientAccountId);
	}

	rl.close();

	// TODO: Write out to env file

})();
