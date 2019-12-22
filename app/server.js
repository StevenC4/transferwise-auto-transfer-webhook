const bodyParser = require('body-parser');
const config = require('../config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const logger = require('./lib/loggers/app');
const requestLogger = require('./middleware/requestLogger');
const routes = require('./routes');

const app = express();

app.use(cors(config.get('cors')));
app.use(helmet()); // Provides some xss protections and hides headers from the client
app.use(requestLogger)
app.use(bodyParser.json());
app.set('trust proxy', config.get('express.trustProxy'));

app.use(routes);

// Default - catch all requests that do not match the route and 
app.use((req, res, _next) => {
    logger.error('Invalid route called', {
        ip: req.ip,
        ips: req.ips,
        method: req.method,
        originalUrl: req.originalUrl
    });
    res.status(404);
    res.send();
});

app.use((err, _req, res, _next) => {
    logger.error('An error occurred', {
        err,
        errorMessage: err.message
    });
    res.status(500);
    res.send();
});

module.exports = app;
