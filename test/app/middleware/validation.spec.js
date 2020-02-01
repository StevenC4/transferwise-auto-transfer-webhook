const assert = require('assert');
const config = require('../../../config');
const logger = require('../../../app/lib/loggers/transferWise');
const {promisify} = require('util');
const sandbox = require('sinon').createSandbox();
const validationMiddleware = require('../../../app/middleware/validation');
const validator = require('../../../app/lib/validator');

describe('app/middleware/validation.js', () => {
    describe('balanceAccountEvent', () => {
        let balanceAccountEvent = promisify(validationMiddleware.balanceAccountEvent);
        let loggerStub, validatorStub;
        let shouldLog;

        before(() => {
            loggerStub = sandbox.stub(logger, 'info');
            validatorStub = sandbox.stub(validator, 'validate');
            shouldLog = config.get('logs.transferWise.log');
        });

        afterEach(() => {
            sandbox.reset();
            config.set('logs.transferWise.log', shouldLog);
        });

        after(() => {
            sandbox.restore();
        });

        it('should return an error if it fails validation from the validator library - logging', async () => {
            config.set('logs.transferWise.log', true);
            validatorStub.returns(false);
            const req = {
                body: 'test body'
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Invalid event format');
            assert.strictEqual(error.errors, null);
            sandbox.assert.calledWith(loggerStub, 'test body');
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', 'test body');
            assert.deepStrictEqual(req, expectedReq);
        });

        it(`should return an error if the body's profile_id does not match the user's selected profile Id`, async () => {
            validatorStub.returns(true);
            const req = {
                body: {
                    data: {
                        resource: {
                            profile_id: 34251
                        }
                    }
                }
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Wrong profile id: 34251');
            assert.strictEqual(error.errors, undefined);
            sandbox.assert.notCalled(loggerStub);
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', expectedReq.body);
            assert.deepStrictEqual(req, expectedReq);
        });

        it(`should return an error if the body's resource_id does not match the user's selected source borderless account Id`, async () => {
            validatorStub.returns(true);
            const req = {
                body: {
                    data: {
                        resource: {
                            id: 13715,
                            profile_id: 15243
                        }
                    }
                }
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Incorrect source borderless account id: 13715');
            sandbox.assert.notCalled(loggerStub);
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', expectedReq.body);
            assert.deepStrictEqual(req, expectedReq);
        });

        it(`should return an error if the post-transaction balance amount is less than the amount being deposited`, async () => {
            validatorStub.returns(true);
            const req = {
                body: {
                    data: {
                        amount: 50,
                        post_transaction_balance_amount: 49,
                        resource: {
                            id: 24816,
                            profile_id: 15243
                        }
                    }
                }
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Amount (50) cannot be greater than post_transaction_balance_amount (49)');
            sandbox.assert.notCalled(loggerStub);
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', expectedReq.body);
            assert.deepStrictEqual(req, expectedReq);
        });

        it(`should succeed if the event meets all validation and amount is equal to post-transaction balance amount`, async () => {
            validatorStub.returns(true);
            const req = {
                body: {
                    data: {
                        amount: 50,
                        post_transaction_balance_amount: 50,
                        resource: {
                            id: 24816,
                            profile_id: 15243
                        }
                    }
                }
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.notCalled(loggerStub);
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', expectedReq.body);
            assert.deepStrictEqual(req, expectedReq);
        });

        it(`should succeed if the event meets all validation and amount is less than post-transaction balance amount`, async () => {
            validatorStub.returns(true);
            const req = {
                body: {
                    data: {
                        amount: 50,
                        post_transaction_balance_amount: 51,
                        resource: {
                            id: 24816,
                            profile_id: 15243
                        }
                    }
                }
            };
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await balanceAccountEvent(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.notCalled(loggerStub);
            sandbox.assert.calledWith(validatorStub, 'events/balanceAccount.json#', expectedReq.body);
            assert.deepStrictEqual(req, expectedReq);
        });
    });
});
