const express = require('express');
const router = express.Router();
const authorizationMiddleware = require('./middleware/authorization');
const transferWiseMiddleware = require('./middleware/transferWise');
const validationMiddleware = require('./middleware/validation');

router.post('/balance-deposit', [
    authorizationMiddleware.verifyEventSignature,
    validationMiddleware.balanceAccountEvent,
    transferWiseMiddleware.createQuote,
    transferWiseMiddleware.createTransfer,
    transferWiseMiddleware.fundTransfer,
    (req, res, next) => {
        console.log(req.body);
        next();
    },
    (req, res, next) => res.send()
]);

router.post('/transfer-update', [
    authorizationMiddleware.verifyEventSignature,
    (req, res, next) => res.send()
]);

module.exports = router;
