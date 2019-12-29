const config = require('../../config');
const crypto = require('crypto');

const publicKey = Buffer.from(config.get('transferWise.publicKey'), 'base64');

module.exports.verifyEventSignature = (req, _res, next) => {
    let error;
    const signature = req.header('X-Signature');
    
    const verifier = crypto.createVerify('sha1WithRSAEncryption');
    verifier.update(Buffer.from(JSON.stringify(req.body)));
    const verified = verifier.verify(publicKey, signature, 'base64');

    if (!verified) {
        error = new Error('Failed public key verification');
        error.statusCode = 401;
    }

    return next(error);
};
