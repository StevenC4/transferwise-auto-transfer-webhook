const convict = require('convict');

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
	express: {
		trustProxy: {
			doc: 'The app.set("trust proxy") value',
			format: Boolean,
			default: true
		}
	},
	log: {
		app: {
			dir: {
				doc: 'The directory for the app log',
				format: String,
				default: 'log'
			},
			filename: {
				doc: 'The file name for the app log',
				format: String,
				default:'app.log'
			}
		},
		request: {
			dir: {
				doc: 'The directory for the request log',
				format: String,
				default: 'log'
			},
			filename: {
				doc: 'The file name for the request log',
				format: String,
				default: 'request.log'
			}
		}
	},
	port: {
		doc: 'The port on which the server will listen',
		format: 'port',
		default: 8121
	},
	transferWise: {
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
		publicKey: {
			doc: 'The transferwise public key, base64 encoded',
			format: String,
			default: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF2Tzh2WFYrSmtzQnpaQVk2R2hTTwpYZG9UQ2ZoWGFhaVorcUFidGFEQml1MkFHa0dWcG1FeWdGbVdQNExpOW01K05pODVCaFZ2Wk9vZE05ZXBnVzNGCmJBNVExU2V4dkFGMVBQalg0SnBNc3Rhay9RaEFnbDFxTVNxRWV2TDhjbVVlVGdjTXVWV0NKbWxnZTloN0IxQ1MKRDRydGxpbUdab3pHMzlyVUJEZzZRdDJLK1A0d0JmTGJsTDBrNEM0WVVkTG5wR1lFREl0aCtpOFhzUnBGbG9neApDQUZ5SDkra25Zc0RiUjQzVUo5c2h0YzQyWWJkNDBBZmloajhLbllLWHpjaHlRNDJhQzhhWi9oNWh5WjI4eVZ5Ck9qM1ZvczBWZEJJcy9nQXlKLzR5eVFGQ1hZdGU2NEk3c3NybGJHUmFjbzRuS0YzSG1hTmh4d3lLeUphZnoxOWUKSHdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t'
		}
	}
});

config.validate({allowed: 'strict'});

module.exports = config;