const assert = require('assert');
const authorizationMiddleware = require('../../../app/middleware/authorization');
const logger = require('../../../app/lib/loggers/app');
const {promisify} = require('util');
const sandbox = require('sinon').createSandbox();
const crypto = require('crypto');

describe('app/middleware/authorization.js', () => {
    describe('verifyEventSignature', () => {
        const verifyEventSignature = promisify(authorizationMiddleware.verifyEventSignature);
        let loggerErrorStub;

        before(() => {
            loggerErrorStub = sandbox.stub(logger, 'error');
        });

        afterEach(() => {
            sandbox.resetHistory();
        });

        after(() => {
            sandbox.restore();
        });

        it('should fail if there is no X-Signature header present on the request', async () => {
            const cryptoCreateVerifyStub = sandbox.stub(crypto, 'createVerify');
            const req = {header: _headerName => undefined};
            const error = await verifyEventSignature(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'No X-Signature header present');
            sandbox.assert.notCalled(cryptoCreateVerifyStub);
            sandbox.assert.notCalled(loggerErrorStub);
            cryptoCreateVerifyStub.restore();
        });
    });
});
