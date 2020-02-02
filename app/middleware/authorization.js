const config = require('../../config');
const crypto = require('crypto');

const publicKey = Buffer.from(config.get('transferWise.publicKey'), 'base64');
const logger = require('../lib/loggers/app');

module.exports.verifyEventSignature = (req, _res, next) => {
	let error;
	const signature = req.header('X-Signature');

	if (!signature) {
		error = new Error('No X-Signature header present');
		error.statusCode = 401;
	} else {
		const verifier = crypto.createVerify('sha1WithRSAEncryption');
		verifier.update(req.rawBody);
		const verified = verifier.verify(publicKey, signature, 'base64');

		if (!verified) {
			error = new Error('Failed public key verification');
			logger.error({body: req.body, rawBody: req.rawBody, signature, publicKey: publicKey.toString()});
			error.statusCode = 401;
		}
	}

	return next(error);
};
