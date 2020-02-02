const logger = require('../lib/loggers/request');

module.exports = (req, res, next) => {
	res.on('finish', () => {
		logger.info({
			hostname: req.hostname,
			ip: req.ip,
			ips: req.ips,
			method: req.method,
			originalUrl: req.originalUrl,
			statusCode: res.statusCode
		});
	})
	next();
};
