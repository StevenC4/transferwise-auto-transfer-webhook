const quote = require('../../../../app/lib/transferWise/quote');
const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../../app/lib/transferWise');
const validator = require('../../../../app/lib/validator');

describe('app/lib/transferWise/quote', () => {
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
            let quoteResponse, error;
            try {
                quoteResponse = await quote.create('body');
            } catch (err) {
                error = err;
            }
            assert.strictEqual(quoteResponse, undefined);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Invalid request body');
            assert.strictEqual(error.validationErrors, null);
            sandbox.assert.calledWith(validatorStub, 'apiRequestBodies/createQuote.json#', 'body');
            sandbox.assert.calledWith(consoleErrorStub, null);
            sandbox.assert.notCalled(sendRequestStub);
        });

        it('should call _sendRequest if validation passes', async () => {
            validatorStub.returns(true);
            sendRequestStub.resolves('response');
            let quoteResponse, error;
            try {
                quoteResponse = await quote.create('body');
            } catch (err) {
                error = err;
            }
            assert.strictEqual(quoteResponse, 'response');
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(validatorStub, 'apiRequestBodies/createQuote.json#', 'body');
            sandbox.assert.calledWith(sendRequestStub, 'POST', '/v1/quotes', 'body');
        });
    });
});
