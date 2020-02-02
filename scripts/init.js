/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-depth */
/* eslint-disable dot-location */
const dotenv = require('dotenv');
dotenv.config();
const config = require('../config');
const prompts = require('prompts');
const transferWise = require('../app/lib/transferWise');

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

const promptForId = async (configEntityId, entityName, fetchEntities) => {
	console.clear();

	let shouldPromptForId = true;
	console.log(configEntityId, entityName, fetchEntities);
	const entities = await fetchEntities();

	if (configEntityId) {
		console.log(`You currently have a ${entityName} Id set (${configEntityId})`); // TODO: Dynamically say 'a' or 'an'
		
		const configEntity = entities.find(entity => entity.id === configEntityId);

		if (!configEntity) {
			console.log(`I could not find your selected ${entityName} Id among your transferWise ${entityName}s. Proceeding to overwrite your selected ${entityName} Id.`);
		} else {
			let overwriteResponse;
			do {
				// eslint-disable-next-line no-await-in-loop
				overwriteResponse = await prompts({
					type: 'select',
					name: 'action',
					message: `Do you want to overwrite this ${entityName} Id (${configEntityId})?`,
					choices: [
						{title: 'Yes', value: 'overwrite'},
						{title: 'No', value: 'keep'},
						{title: `View ${entityName} details`, value: 'show'}
					],
					initial: 1
				});

				if (overwriteResponse.action === 'show') {
					console.clear();
					logBoundary();
					nestedLog(configEntity);
					logBoundary();
					console.log();
				}
			} while (overwriteResponse.action === 'show');

			shouldPromptForId = overwriteResponse.action === 'overwrite';
		}
	}

	let selectedEntityId;
	if (shouldPromptForId) {
		if (entities.length === 0) {
			console.clear();
			console.log(`I could not find any ${entityName}s for you. Please set up a ${entityName} first and then try again.`);
			process.exit(1);
		} else if (entities.length === 1) {
			console.clear();
			console.log(`I only found one ${entityName} for you:`);

			logBoundary();
			nestedLog(entities[0]);
			logBoundary();

			const {useEntity} = await prompts({
				type: 'confirm',
				name: 'useEntity',
				message: `Is this the correct ${entityName} to use?`,
				initial: true
			});

			if (useEntity) {
				console.log(`OK! Using the ${entityName} and proceeding.`);

				return entities[0].id;
			} else {
				console.log(`Understood. Please set up the correct ${entityName} first and then try again.`);
				process.exit(1);
			}
		} else {
			do {
				console.clear();
				const {entityId} = await prompts({
					type: 'select',
					name: 'entityId',
					message: `Select a ${entityName} Id to see more details:`,
					choices: entities.map(entity => ({title: entity.id, value: entity.id}))
				});
				const selectedEntity = entities.find(entity => entity.id === entityId);
				console.clear();
				logBoundary();
				nestedLog(selectedEntity);
				logBoundary();
				console.log();
				const {useSelectedEntity} = await prompts({
					type: 'confirm',
					name: 'useSelectedEntity',
					message: `Would you like to select this as your ${entityName} Id?`,
					initial: false
				});

				if (useSelectedEntity) {
					selectedEntityId = entityId;
				}
			} while (!selectedEntityId);
		}
	}

	return selectedEntityId;
};

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

(async () => {
	// Get user's TransferWise API key
	const apiKey = await getTransferWiseApiKey();
	if (apiKey) {
		config.set('transferWise.api.key', apiKey);
	}

	// Get user's TransferWise profile Id
	const profileId = await promptForId(config.get('transferWise.profile.id'), 'profile', transferWise.profiles.get);
	if (profileId) {
		config.set('transferWise.profile.id', profileId);
	}

	// Get user's TransferWise borderless account / source account Id
	const sourceAccountId = await promptForId(config.get('transferWise.account.source.id'), 'borderless account', async () => transferWise.borderlessAccounts.get(config.get('transferWise.profile.id')));
	if (sourceAccountId) {
		config.set('transferWise.account.source.id', sourceAccountId);
	}

	// Get user's TransferWise recipient account / target account Id
	const targetAccountId = await getTargetAccountId(config.get('transferWise.account.target.id'), 'recipient account', transferWise.accounts.get);
	if (targetAccountId) {
		config.set('transferWise.account.target.id', targetAccountId);
	}
})();
