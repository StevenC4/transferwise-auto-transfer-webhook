const {promisify} = require('util');
const authorizationMiddleware = require('../../../app/middleware/authorization');

describe('app/middleware/authorization.js', () => {
    describe('verifyEventSignature', () => {
        const verifyEventSignature = promisify(authorizationMiddleware);

        it('should fail if there is no X-Signature header present on the request', async () => {
            const req = {};
            const error = await verifyEventSignature(req, {}).catch(error => error);
        });
    });
});
