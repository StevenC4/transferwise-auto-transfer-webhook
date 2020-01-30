/* eslint-disable max-lines-per-function */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-depth */
/* eslint-disable dot-location */
const dotenv = require('dotenv');
dotenv.config();
const config = require('../config');
const prompts = require('prompts');
const transferWise = require('../app/lib/transferWise');
const util = require('util');

// Utilities

const nestedLog = (object, level = 0) => {
	if (object !== null && typeof object === 'object') {
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

const logBoundary = () => console.log('---------------------------------------------------------------------');

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

// Gather user information

const getTransferWiseApiKey = async () => {
	console.clear();
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
	console.clear();
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
					message: `Do you want to overwrite this value (${config.get('transferWise.profile.id')})?`,
					choices: [
						{title: 'Yes', value: 'overwrite'},
						{title: 'No', value: 'keep'},
						{title: 'View profile information', value: 'show'}
					],
					initial: 1
				});

				if (overwriteResponse.action === 'show') {
					console.clear();
					logBoundary();
					nestedLog(prepopulatedProfile);
					logBoundary();
					console.log();
				}
			} while (overwriteResponse.action === 'show');

			promptProfileIds = overwriteResponse.action === 'overwrite';
		}
	}

	let selectedProfileId;
	if (promptProfileIds) {
		if (profiles.length === 0) {
			console.clear();
			console.log('I could not find any profiles for your account. Please set up a profile first and then try again.');
			process.exit(1);
		} else if (profiles.length === 1) {
			console.clear();
			console.log(`I only found one profile for your account:`);

			logBoundary();
			nestedLog(profiles[0]);
			logBoundary();

			const {useProfile} = await prompts({
				type: 'confirm',
				name: 'useProfile',
				message: 'Is this the correct profile to use?',
				initial: true
			});

			if (useProfile) {
				console.log('OK! Using profile and proceeding.');

				return profiles[0].id;
			} else {
				console.log('Understood. Please set up the correct profile first and then try again.');
				process.exit(1);
			}
		} else {
			do {
				console.clear();
				const {profileId} = await prompts({
					type: 'select',
					name: 'profileId',
					message: 'Select a profile Id to see more information about the profile:',
					choices: profiles.map(profile => ({title: profile.id, value: profile.id}))
				});
				const selectedProfile = profiles.find(profile => profile.id === profileId);
				console.clear();
				logBoundary();
				nestedLog(selectedProfile);
				logBoundary();
				console.log();
				const {useSelectedProfile} = await prompts({
					type: 'confirm',
					name: 'useSelectedProfile',
					message: 'Would you like to select this as your profile Id?',
					initial: false
				});

				if (useSelectedProfile) {
					selectedProfileId = profileId
				}
			} while (!selectedProfileId);
		}
	}

	return selectedProfileId;
};

const getSourceAccountId = async () => {
	console.clear();
	let promptSourceAccountId = true;
	const sourceAccounts = await transferWise.borderlessAccounts.get(config.get('transferWise.profile.id'));
	if (config.get('transferWise.account.source.id')) {
		console.log(`You currently have a source account Id set (${config.get('transferWise.account.source.id')}).`);
		const prepopulatedSourceAccount = sourceAccounts.find(sourceAccount => sourceAccount.id === config.get('transferWise.account.source.id'));

		if (!prepopulatedSourceAccount) {
			console.log('I could not find your selected source account Id among your transferWise borderless accounts. Proceeding to overwrite your selected source account Id.');
		} else {
			let overwriteResponse;
			do {
				// eslint-disable-next-line no-await-in-loop
				overwriteResponse = await prompts({
					type: 'select',
					name: 'action',
					message: `Do you want to overwrite this value (${config.get('transferWise.account.source.id')})?`,
					choices: [
						{title: 'Yes', value: 'overwrite'},
						{title: 'No', value: 'keep'},
						{title: 'View source account information', value: 'show'}
					],
					initial: 1
				});

				if (overwriteResponse.action === 'show') {
					console.clear();
					logBoundary();
					nestedLog(prepopulatedSourceAccount);
					logBoundary();
					console.log();
				}
			} while (overwriteResponse.action === 'show');

			promptSourceAccountId = overwriteResponse.action === 'overwrite';
		}
	}

	let selectedSourceAccountId;
	if (promptSourceAccountId) {
		if (sourceAccounts.length === 0) {
			console.clear();
			console.log('I could not find any borderless accounts for your TransferWise account. Please set up a borderless account first and then try again.');
			process.exit(1);
		} else if (sourceAccounts.length === 1) {
			console.clear();
			console.log(`I only found one borderless account for your TransferWise account:`);

			logBoundary();
			nestedLog(sourceAccounts[0]);
			logBoundary();

			const {useSourceAccount} = await prompts({
				type: 'confirm',
				name: 'useSourceAccount',
				message: 'Is this the correct borderless account to use?',
				initial: true
			});

			if (useSourceAccount) {
				console.log('OK! Using borderless account and proceeding.');

				return sourceAccounts[0].id;
			} else {
				console.log('Understood. Please set up the correct borderless account first and then try again.');
				process.exit(1);
			}
		} else {
			do {
				console.clear();
				const {sourceAccount} = await prompts({
					type: 'select',
					name: 'sourceAccount',
					message: 'Select a source account Id to see more information about the borderless account:',
					choices: sourceAccounts.map(sourceAccount => ({title: sourceAccount.id, value: sourceAccount.id}))
				});
				const selectedSourceAccount = sourceAccounts.find(sourceAccount => sourceAccount.id === sourceAccount);
				console.clear();
				logBoundary();
				nestedLog(selectedSourceAccount);
				logBoundary();
				console.log();
				const {useSelectedSourceAccount} = await prompts({
					type: 'confirm',
					name: 'useSelectedSourceAccount',
					message: 'Would you like to select this as your source account Id?',
					initial: false
				});

				if (useSelectedSourceAccount) {
					selectedSourceAccountId = sourceAccount;
				}
			} while (!selectedSourceAccountId);
		}
	}

	return selectedSourceAccountId;
};

const getTargetAccountId = async () => {
	console.clear();
	let promptTargetAccountId = true;
	const targetAccounts = await transferWise.accounts.get();
	if (config.get('transferWise.account.target.id')) {
		console.log(`You currently have a target account Id set (${config.get('transferWise.account.target.id')}).`);
		const prepopulatedTargetAccount = targetAccounts.find(targetAccount => targetAccount.id === config.get('transferWise.account.target.id'));

		if (!prepopulatedTargetAccount) {
			console.log('I could not find your selected target account Id among your transferWise accounts. Proceeding to overwrite your selected target account Id.');
		} else {
			let overwriteResponse;
			do {
				// eslint-disable-next-line no-await-in-loop
				overwriteResponse = await prompts({
					type: 'select',
					name: 'action',
					message: `Do you want to overwrite this value (${config.get('transferWise.account.target.id')})?`,
					choices: [
						{title: 'Yes', value: 'overwrite'},
						{title: 'No', value: 'keep'},
						{title: 'View target account information', value: 'show'}
					],
					initial: 1
				});

				if (overwriteResponse.action === 'show') {
					console.clear();
					logBoundary();
					nestedLog(prepopulatedTargetAccount);
					logBoundary();
					console.log();
				}
			} while (overwriteResponse.action === 'show');

			promptTargetAccountId = overwriteResponse.action === 'overwrite';
		}
	}

	let selectedTargetAccountId;
	if (promptTargetAccountId) {
		if (targetAccounts.length === 0) {
			console.clear();
			console.log('I could not find any recipient accounts for your TransferWise account. Please set up a recipient account first and then try again.');
			process.exit(1);
		} else if (targetAccounts.length === 1) {
			console.clear();
			console.log(`I only found one recipient account for your TransferWise account:`);

			logBoundary();
			nestedLog(targetAccounts[0]);
			logBoundary();

			const {useTargetAccount} = await prompts({
				type: 'confirm',
				name: 'useTargetAccount',
				message: 'Is this the correct recipient account to use?',
				initial: true
			});

			if (useTargetAccount) {
				console.log('OK! Using recipient account and proceeding.');

				return targetAccounts[0].id;
			} else {
				console.log('Understood. Please set up the correct recipient account first and then try again.');
				process.exit(1);
			}
		} else {
			do {
				console.clear();
				const {targetAccountId} = await prompts({
					type: 'select',
					name: 'targetAccountId',
					message: 'Select a target account Id to see more information about the recipient account:',
					choices: targetAccounts.map(targetAccount => ({title: targetAccount.id, value: targetAccount.id})),
					format: (val, _vals) => parseInt(val)
				});
				const selectedTargetAccount = targetAccounts.find(targetAccount => targetAccount.id === targetAccountId);
				console.clear();
				logBoundary();
				nestedLog(selectedTargetAccount);
				logBoundary();
				console.log();
				const {useSelectedTargetAccount} = await prompts({
					type: 'confirm',
					name: 'useSelectedTargetAccount',
					message: 'Would you like to select this as your target account Id?',
					initial: false
				});

				if (useSelectedTargetAccount) {
					selectedTargetAccountId = targetAccountId;
				}
			} while (!selectedTargetAccountId);
		}
	}

	return selectedTargetAccountId;
};

(async () => {
	const apiKey = await getTransferWiseApiKey();
	if (apiKey) {
		config.set('transferWise.api.key', apiKey);
	}

	// Get user's TransferWise profile Id
	const profileId = await getProfileId();
	if (profileId) {
		config.set('transferWise.profile.id', profileId);
	}

	const sourceAccountId = await getSourceAccountId();
	if (sourceAccountId) {
		config.set('transferWise.account.source.id', sourceAccountId);
	}

	const targetAccountId = await getTargetAccountId();
	if (targetAccountId) {
		config.set('transferWise.account.target.id', targetAccountId);
	}
})();

// eslint-disable-next-line max-lines-per-function
(async () => {
	return;

	// Obtain user's TransferWise source account Id
	// eslint-disable-next-line no-unreachable
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
