const convict = require('convict');
const package = require('../package.json');

const config = convict({
	appName: {
		doc: 'The application name',
		format: String,
		default: package.name
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
	}
});

config.validate({allowed: 'strict'});

module.exports = config;