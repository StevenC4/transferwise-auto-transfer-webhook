const express = require('express');
const router = express.Router();
const logMiddleware = require('./middleware/log');
const transferWiseMiddleware = require('./middleware/transferWise');
const validationMiddleware = require('./middleware/validation');

router.post('/balance-deposit', [
	validationMiddleware.balanceAccountEvent,
	transferWiseMiddleware.getTargetAccount,
	transferWiseMiddleware.createQuote,
	transferWiseMiddleware.createTransfer,
	transferWiseMiddleware.fundTransfer,
	logMiddleware.logBalanceAccountEvent,
	(_req, res, _next) => res.status(200).send()
]);

module.exports = router;
