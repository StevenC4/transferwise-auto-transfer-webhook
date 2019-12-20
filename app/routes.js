const express = require('express');
const router = express.Router();
const authorizationMiddleware = require('./middleware/authorization');
const validationMiddleware = require('./middleware/validation');

router.post('/balance-deposit', [
    authorizationMiddleware.verifyEventSignature,
    validationMiddleware.balanceAccountEvent,
    (req, res, next) => res.send()
]);

router.post('/transfer-update', [
    authorizationMiddleware.verifyEventSignature,
    (req, res, next) => res.send()
]);

module.exports = router;
