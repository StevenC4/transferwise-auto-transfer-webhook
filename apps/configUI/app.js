const bodyParser = require('body-parser');
const config = require('../../config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const logger = require('./lib/loggers/app');
const requestLogger = require('./middleware/requestLogger');

const app = express();
app.customFields = {
    name: config.get('apps.configUI.name'),
    port: config.get('apps.configUI.port')
};

app.use(cors(config.get('cors')));
app.use(helmet());
app.set('trust proxy', config.get('express.trustProxy'));

app.use(bodyParser.json());

app.use(requestLogger)

// app.use(routes);

// Default - catch all requests that do not match the route and
app.use((_req, _res, next) => {
    const error = new Error('Invalid route called');
    error.statusCode = 404;
    next(error);
});

app.use((err, req, res, _next) => {
    const code = err.statusCode || 200;
    logger.error('An error occurred', {
        ip: req.ip,
        ips: req.ips,
        method: req.method,
        originalUrl: req.originalUrl,
        err,
        errorMessage: err.message,
        stackTrace: err.stack
    });
    res.status(code).send();
});

module.exports = app;
