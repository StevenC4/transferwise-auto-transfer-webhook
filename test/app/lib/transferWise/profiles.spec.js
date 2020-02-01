const profiles = require('../../../../app/lib/transferWise/profiles');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../../app/lib/transferWise');

describe('app/lib/transferWise/profiles', () => {
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
            const profilesResponse = await profiles.get().catch(err => err);
            assert.strictEqual(profilesResponse, response);
            sandbox.assert.calledWith(sendRequestStub, 'GET', '/v1/profiles');
        });
    });
});
