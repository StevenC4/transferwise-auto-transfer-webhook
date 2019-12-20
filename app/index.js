const http = require('http');
const config = require('../config');
const server = require('./server');
const port = config.get('port');

/**
 * Create HTTP server
 */
console.log(`Starting ${config.get('appName')} on port ${port} in ${config.get('env')} environment`);

const httpServer = http.createServer(server);

const gracefulShutdown = async () => {
	console.log('Commencing Shutdown, Closing Server to new requests');
	await new Promise(resolve => httpServer.close(resolve));
	console.log('All requests completed');
};

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(port);
httpServer.on('error', onError);
httpServer.on('listening', onListening);
process.on('SIGTERM', () => {
	// setTimeout(gracefulShutdown, 18000, 'shutdownTimer');
	setTimeout(gracefulShutdown, 0, 'shutdownTimer');
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
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

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = httpServer.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	console.log('Listening on ' + bind);
}
