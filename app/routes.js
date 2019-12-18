const config = require('../config');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();

const publicKey = Buffer.from(config.get('transferWise.publicKey'), 'base64').toString();

const verifyEventSignature = (req, res, next) => {
    const verifier = crypto.createVerify('sha1WithRSAEncryption');
    const signature = req.headers['X-Signature'];
    verifier.update(req.body);
    const verified = verifier.verify(publicKey, signature, 'base64');

    if (!verified) {
        const error = new Error('Failed public key verification');
        error.statusCode = 401;
        next(error);
    }
};

router.post('/balance-deposit', verifyEventSignature, (req, res, next) => res.send());
router.post('/transfer-update', verifyEventSignature, (req, res, next) => res.send());

module.exports = router;
