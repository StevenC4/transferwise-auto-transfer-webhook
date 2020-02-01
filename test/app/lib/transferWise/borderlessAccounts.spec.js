const borderlessAccounts = require('../../../../app/lib/transferWise/borderlessAccounts');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../../app/lib/transferWise');

describe('app/lib/transferWise/borderlessAccounts', () => {
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
            const borderlessAccountsResponse = await borderlessAccounts.get(91827).catch(err => err);
            assert.strictEqual(borderlessAccountsResponse, response);
            sandbox.assert.calledWith(sendRequestStub, 'GET', '/v1/borderless-accounts?profileId=91827');
        });
    });
});
