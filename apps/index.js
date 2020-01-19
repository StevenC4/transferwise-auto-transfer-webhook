const http = require('http');
const config = require('../config');
const webhookApp = require('./webhook/server');

/**
 * Create HTTP server
 */

const httpServers = [webhookApp].map(expressApp => {
	const {name, port} = expressApp.customFields;

	console.log(`Starting ${name} on port ${port} in ${config.get('env')} environment`);

	const httpServer = http.createServer(expressApp);
	httpServer.listen(port);
	httpServer.on('error', onError(port));
	httpServer.on('listening', onListening(httpServer));

	return httpServer;
});

const gracefulShutdown = async () => {
	console.log('Commencing Shutdown, Closing Server to new requests');
	await Promise.all(httpServers.map(httpServer => new Promise(resolve => httpServer.close(resolve))));
	console.log('All requests completed');
};

process.on('SIGTERM', () => {
	// setTimeout(gracefulShutdown, 18000, 'shutdownTimer'); // TODO: Uncomment this
	setTimeout(gracefulShutdown, 0, 'shutdownTimer');
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(port) {
	return error => {
		if (error.syscall !== 'listen') {
			throw error;
		}
	
		const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	
		// Handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES': {
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			} case 'EADDRINUSE': {
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			} default: {
				throw error;
			}
		}
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(httpServer) {
	return () => {
		const addr = httpServer.address();
		const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
		console.log('Listening on ' + bind);
	};
}
