/* eslint-disable max-lines-per-function */
const assert = require('assert');
const transferWiseMiddleware = require('../../../app/middleware/transferWise');
const transferWise = require('../../../app/lib/transferWise');
const {promisify} = require('util');
const sandbox = require('sinon').createSandbox();

describe('app/middleware/transferWise.js', () => {
    describe('getTargetAccount', () => {
        const getTargetAccount = promisify(transferWiseMiddleware.getTargetAccount);
        let getAccountStub;

        before(() => {
            getAccountStub = sandbox.stub(transferWise.accounts, 'get');
        });

        afterEach(() => {
            sandbox.reset();
        });

        after(() => {
            sandbox.restore();
        });

        it('should return an error when it the TransferWise API call promise rejects', async () => {
            const apiError = new Error('Failure during TransferWise API call');
            getAccountStub.rejects(apiError);

            const req = {};
            const error = await getTargetAccount(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledOnce(getAccountStub);
            assert.deepEqual(req, {});
        });

        it('should return an error when an error is thrown errors during the TransferWise API call', async () => {
            const apiError = new Error('Failure during TransferWise API call');
            getAccountStub.throws(apiError);

            const req = {};
            const error = await getTargetAccount(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledOnce(getAccountStub);
            assert.deepEqual(req, {});
        });

        it('should return an error when the TransferWise API call succeeds but the chosen target account Id is not found among the results', async () => {
            const accounts = [
                {id: 1234},
                {id: 2345},
                {id: 3456},
                {id: 4567}
            ];
            getAccountStub.resolves(accounts);

            const req = {};
            const error = await getTargetAccount(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Chosen target account not found');
            sandbox.assert.calledOnce(getAccountStub);
            assert.deepEqual(req, {targetAccount: undefined});
        });

        it('should succeed when the chosen target account is found amon the API call results', async () => {
            const accounts = [
                {id: 1234},
                {id: 2345},
                {id: 14141},
                {id: 3456},
                {id: 4567}
            ];
            getAccountStub.resolves(accounts);

            const req = {};
            const error = await getTargetAccount(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledOnce(getAccountStub);
            assert.deepEqual(req, {targetAccount: {id: 14141}});
        });
    });
});
