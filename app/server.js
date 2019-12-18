const bodyParser = require('body-parser');
const config = require('../config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

app.use(cors(config.get('cors')));
app.use(helmet()); // Provides some xss protections and hides headers from the client
app.use(bodyParser.json());
app.set('trust proxy', config.get('express.trustProxy'));

app.use(routes);

module.exports = app;
