/* eslint-disable max-depth */
/* eslint-disable dot-location */
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

const nestedLog = (object, level = 0) => {
	if (typeof object === 'object') {
		for (const key in object) {
			if (object[key] === undefined || object[key] === null) {
				continue;
			} else if (typeof object[key] === "object") {
				logWithTabLevel(`${splitCamelCase(key)}:`, level);
				nestedLog(object[key], level + 1);
			} else {
				logWithTabLevel(`${splitCamelCase(key)}: ${object[key]}`, level);
			}
		}
	} else if (Array.isArray(object)) {
		object.forEach(item => nestedLog(item, level + 1));
	} else {
		logWithTabLevel(object, level);
	}
};

const logWithTabLevel = (item, level) => {
	let output = '';
	// eslint-disable-next-line id-length
	// eslint-disable-next-line no-plusplus
	for (let i = 0; i < level; i++) {
		output += '\t';
	}
	output += item;
	console.log(output);
};

const splitCamelCase = string => string
		// Look for long acronyms and filter out the last letter
		.replace(/(?<acronym>[A-Z]+)(?<nextWord>[A-Z][a-z])/gu, ' $<acronym> $<nextWord>')
		// Look for lower-case letters followed by upper-case letters
		.replace(/(?<lower>[a-z\d])(?<upper>[A-Z])/gu, '$<lower> $<upper>')
		// Look for lower-case letters followed by numbers
		.replace(/(?<lower>[a-zA-Z])(?<number>\d)/gu, '$<lower> $<number>')
		.replace(/^./u, str => str.toUpperCase())
		// Remove any white space left around the word
		.trim();

const getTransferWiseApiKey = async () => {
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

	return response.apiKey;
};

// eslint-disable-next-line max-lines-per-function
const getProfileId = async () => {
	let promptProfileIds = true;
	const profiles = await transferWise.profiles.get();
	if (config.get('transferWise.profile.id')) {
		console.log(`You currently have a profile Id set (${config.get('transferWise.profile.id')}).`);

		const prepopulatedProfile = profiles.find(profile => profile.id === config.get('transferWise.profile.id'));

		if (!prepopulatedProfile) {
			console.log('I could not find your selected profile Id among your transferWise profiles. Proceeding to overwrite your selected profile Id.');
		} else {
			let overwriteResponse;
			do {
				// eslint-disable-next-line no-await-in-loop
				overwriteResponse = await prompts({
					type: 'select',
					name: 'action',
					message: `You currently have a profile Id set (${config.get('transferWise.profile.id')}).\nDo you want to overwrite this value?`,
					choices: [
						{title: 'Yes', value: 'overwrite'},
						{title: 'No', value: 'keep'},
						{title: 'View profile information', value: 'show'}
					],
					initial: 1
				});

				if (overwriteResponse.action === 'show') {
					if (prepopulatedProfile) {
						console.clear();
						console.log('---------------------------------------------------------------------');
						nestedLog(prepopulatedProfile);
						console.log('---------------------------------------------------------------------');
						console.log();
					} else {
						console.log('Selected profile Id not found among your transferWise profiles. Proceeding to overwrite your selected profile Id.');
						overwriteResponse.action = 'overwrite';
					}
				}
			} while (overwriteResponse.action === 'show');

			promptProfileIds = overwriteResponse.action === 'overwrite';
		}
	}

	if (promptProfileIds) {
		const response = await prompts({
			type: 'select'
		});
	}
};

(async () => {
	const apiKey = await getTransferWiseApiKey();
	if (apiKey) {
		config.set('transferWise.api.key', apiKey);
	}

	// Get user's TransferWise profile Id
	const profileId = await getProfileId();
})();

// eslint-disable-next-line max-lines-per-function
(async () => {
	return;

	// Obtain user's TransferWise profile Id
	// eslint-disable-next-line no-unreachable
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
