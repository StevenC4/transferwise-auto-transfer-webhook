const transfer = require('../../../../app/lib/transferWise/transfer');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../../app/lib/transferWise');
const validator = require('../../../../app/lib/validator');

/* eslint-disable max-lines-per-function */
describe('app/lib/transferWise/transfer', () => {
    describe('create', () => {
        let consoleErrorStub, sendRequestStub, validatorStub;

        before(() => {
            consoleErrorStub = sandbox.stub(console, 'error');
            sendRequestStub = sandbox.stub(transferWise, '_sendRequest');
            validatorStub = sandbox.stub(validator, 'validate');
        });

        afterEach(() => {
            sandbox.reset();
        });

        after(() => {
            sandbox.restore();
        });

        it('should not call _sendRequest if validation fails', async () => {
            validatorStub.returns(false);
            let error, transferResponse;
            try {
                transferResponse = await transfer.create('body');
            } catch (err) {
                error = err;
            }
            assert.strictEqual(transferResponse, undefined);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Invalid request body');
            assert.strictEqual(error.validationErrors, null);
            sandbox.assert.calledWith(validatorStub, 'apiRequestBodies/createTransfer.json#', 'body');
            sandbox.assert.calledWith(consoleErrorStub, null);
            sandbox.assert.notCalled(sendRequestStub);
        });

        it('should call _sendRequest if validation passes', async () => {
            validatorStub.returns(true);
            sendRequestStub.resolves('response');
            let error, transferResponse;
            try {
                transferResponse = await transfer.create('body');
            } catch (err) {
                error = err;
            }
            assert.strictEqual(transferResponse, 'response');
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(validatorStub, 'apiRequestBodies/createTransfer.json#', 'body');
            sandbox.assert.calledWith(sendRequestStub, 'POST', '/v1/transfers', 'body');
        });
    });

    describe('fund', () => {
        let sendRequestStub;

        before(() => {
            sendRequestStub = sandbox.stub(transferWise, '_sendRequest');
        });

        afterEach(() => {
            sandbox.reset();
        });

        after(() => {
            sandbox.restore();
        });

        it('should call _sendRequest', async () => {
            sendRequestStub.resolves('response');
            let error, transferResponse;
            try {
                transferResponse = await transfer.fund('profile_id', 'transfer_id');
            } catch (err) {
                error = err;
            }
            assert.strictEqual(transferResponse, 'response');
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(sendRequestStub, 'POST', '/v3/profiles/profile_id/transfers/transfer_id/payments');
        });
    });
});
