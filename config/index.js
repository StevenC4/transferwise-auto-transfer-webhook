const convict = require('convict');
const fs = require('fs');
const path = require('path');

const config = convict({
	appName: {
		doc: 'The application name',
		format: String,
		default: 'transferwise-webhook'
	},
	cors: {
		origin: {
			doc: 'An array of allowed origins',
			format: Array,
			default: []
		},
		methods: {
			doc: 'An array of allowed methods',
			format: Array,
			default: ['GET']
		},
		allowedHeaders: {
			doc: 'An array of allowed headers',
			format: Array,
			default: ['Content-Type']
		}
	},
	env: {
		doc: 'The environment to run this project in',
		format: ['production', 'development'],
		default: 'production',
		env: 'APP_ENV'
	},
	express: {
		trustProxy: {
			doc: 'The app.set("trust proxy") value',
			format: Boolean,
			default: true
		}
	},
	logs: {
		combined: {
			filename:  {
				doc: 'The filename (including path) of the combined logs',
				format: String,
				default: '/var/log/transferwise-webhook/combined.log'
			}
		},
		error: {
			filename:  {
				doc: 'The filename (including path) of the error logs',
				format: String,
				default: '/var/log/transferwise-webhook/error.log'
			}
		},
		request: {
			filename: {
				doc: 'The filename (including the path) of the request logs',
				format: String,
				default: '/var/log/transferwise-webhook/request.log'
			}
		}
	},
	port: {
		doc: 'The port on which the server will listen',
		format: 'port',
		default: 8121
	},
	transferWise: {
		currency: {
			source: {
				doc: 'The source currency for the quote',
				format: String,
				default: '',
				env: 'TRANSFERWISE_SOURCE_CURRENCY'
			},
			target: {
				doc: 'The target currency for the quote',
				format: String,
				default: '',
				env: 'TRANSFERWISE_TARGET_CURRENCY'
			}
		},
		account: {
			target: {
				id: {
					doc: 'The identifier of the target account',
					format: 'integer',
					default: '',
					env: 'TRANSFERWISE_TARGET_ACCOUNT_ID'
				}
			}
		},
		balance: {
			source: {
				id: {
					doc: 'The identifier of the source balance',
					format: 'integer',
					default: '',
					env: 'TRANSFERWISE_SOURCE_BALANCE_ID'
				}
			}
		},
		borderlessAccount: {
			source: {
				id: {
					doc: 'The identifier of the source borderless account',
					format: 'integer',
					default: '',
					env: 'TRANSFERWISE_SOURCE_BORDERLESS_ACCOUNT_ID'
				}
			}
		},
		api: {
			baseUrl: {
				doc: 'The base URL of the transferwise public API',
				format: String,
				default: 'https://api.transferwise.com'
			},
			key: {
				doc: 'A personal transferwise API key',
				format: String,
				default: '',
				env: 'TRANFERWISE_API_TOKEN'
			}
		},
		profile: {
			id: {
				doc: 'The id of your profile',
				format: 'integer',
				default: '',
				env: 'TRANSFERWISE_PROFILE_ID'
			}
		},
		publicKey: {
			doc: 'The transferwise public key, base64 encoded',
			format: String,
			default: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2Tzh2WFYrSmtzQnpaQVk2R2hTTwpYZG9UQ2ZoWGFhaVorcUFidGFEQml1MkFHa0dWcG1FeWdGbVdQNExpOW01K05pODVCaFZ2Wk9vZE05ZXBnVzNGCmJBNVExU2V4dkFGMVBQalg0SnBNc3Rhay9RaEFnbDFxTVNxRWV2TDhjbVVlVGdjTXVWV0NKbWxnZTloN0IxQ1MKRDRydGxpbUdab3pHMzlyVUJEZzZRdDJLK1A0d0JmTGJsTDBrNEM0WVVkTG5wR1lFREl0aCtpOFhzUnBGbG9neApDQUZ5SDkra25Zc0RiUjQzVUo5c2h0YzQyWWJkNDBBZmloajhLbllLWHpjaHlRNDJhQzhhWi9oNWh5WjI4eVZ5Ck9qM1ZvczBWZEJJcy9nQXlKLzR5eVFGQ1hZdGU2NEk3c3NybGJHUmFjbzRuS0YzSG1hTmh4d3lLeUphZnoxOWUKSHdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t'
		}
	}
});

const env = config.get('env');
const envFilePath = path.resolve(__dirname, `${env}.json`);
if (fs.existsSync(envFilePath)) {
	config.loadFile(envFilePath);
}

config.validate({allowed: 'strict'});

module.exports = config;