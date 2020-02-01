const accounts = require('../../../../app/lib/transferWise/accounts');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../../app/lib/transferWise');

describe('app/lib/transferWise/accounts', () => {
    describe('get', () => {
        let sendRequestStub;

        before(() => {
            sendRequestStub = sandbox.stub(transferWise, '_sendRequest')
        });

        afterEach(() => {
            sandbox.reset();
        });

        after(() => {
            sandbox.restore();
        });

        it('should call _sendRequest', async () => {
            const response = 'response'
            sendRequestStub.resolves(response);
            const accountsResponse = await accounts.get().catch(err => err);
            assert.strictEqual(accountsResponse, response);
            sandbox.assert.calledWith(sendRequestStub, 'GET', '/v1/accounts');
        });
    });
});
