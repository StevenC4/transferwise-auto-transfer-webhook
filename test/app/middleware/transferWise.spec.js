/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
const assert = require('assert');
const config = require('../../../config');
const logger = require('../../../app/lib/loggers/transferWise');
const {promisify} = require('util');
const proxyquire = require('proxyquire');
const sandbox = require('sinon').createSandbox();
const transferWise = require('../../../app/lib/transferWise');
let transferWiseMiddleware;

describe('app/middleware/transferWise.js', () => {
    const uuid = 'sample-uuid-value-12354';

    after(() => {
        sandbox.restore();
    });

    describe('getTargetAccount', () => {
        const uuidv4 = sandbox.stub().returns(uuid);
        transferWiseMiddleware = proxyquire('../../../app/middleware/transferWise', {
            'uuid/v4': uuidv4
        });
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
            assert.deepStrictEqual(req, {});
        });

        it('should return an error when an error is thrown errors during the TransferWise API call', async () => {
            const apiError = new Error('Failure during TransferWise API call');
            getAccountStub.throws(apiError);

            const req = {};
            const error = await getTargetAccount(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledOnce(getAccountStub);
            assert.deepStrictEqual(req, {});
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
            assert.deepStrictEqual(req, {targetAccount: undefined});
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
            assert.deepStrictEqual(req, {targetAccount: {id: 14141}});
        });
    });

    describe('createQuote', () => {
        const uuidv4 = sandbox.stub().returns(uuid);
        transferWiseMiddleware = proxyquire('../../../app/middleware/transferWise', {
            'uuid/v4': uuidv4
        });
        const createQuote = promisify(transferWiseMiddleware.createQuote);
        let createQuoteStub, logStub;
        let createQuoteParams, req;
        let shouldLog;

        before(() => {
            shouldLog = config.get('logs.transferWise.log');
            createQuoteStub = sandbox.stub(transferWise.quote, 'create');
            logStub = sandbox.stub(logger, 'info');
        });

        beforeEach(() => {
            req = {
                body: {
                    data: {
                        amount: 1234.56,
                        currency: 'EUR'
                    }
                },
                targetAccount: {
                    currency: 'USD'
                }
            };
            createQuoteParams = {
                profile: 15243,
                rateType: 'FIXED',
                source: 'EUR',
                sourceAmount: 1234.56,
                target: 'USD',
                type: 'BALANCE_PAYOUT'
            };
        });

        afterEach(() => {
            sandbox.reset();
            config.set('logs.transferWise.log', shouldLog);
        });

        after(() => {
            sandbox.restore();
        });

        it('should return an error when the TransferWise API call returns a rejected promise', async () => {
            const apiError = new Error('There was an error when calling the create quote API');
            createQuoteStub.rejects(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await createQuote(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(createQuoteStub, createQuoteParams);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should return an error when the TransferWise API call throws an expection', async () => {
            const apiError = new Error('There was an error when calling the create quote API');
            createQuoteStub.throws(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await createQuote(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(createQuoteStub, createQuoteParams);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and not log the output', async () => {
            const quote = 'quote placeholder';
            createQuoteStub.resolves(quote);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.quote = quote;
            const error = await createQuote(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(createQuoteStub, createQuoteParams);
            sandbox.assert.notCalled(logStub);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and log the output', async () => {
            config.set('logs.transferWise.log', true);
            const quote = 'quote placeholder';
            createQuoteStub.resolves(quote);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.quote = quote;
            const error = await createQuote(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(createQuoteStub, createQuoteParams);
            sandbox.assert.calledWith(logStub, {quote});
            assert.deepStrictEqual(req, expectedReq);
        });
    });

    describe('createTransfer', () => {
        const uuidv4 = sandbox.stub();
        transferWiseMiddleware = proxyquire('../../../app/middleware/transferWise', {
            'uuid/v4': uuidv4
        });
        const createTransfer = promisify(transferWiseMiddleware.createTransfer);
        let createTransferStub, logStub;
        let createTransferParams, req;
        let shouldLog;

        before(() => {
            uuidv4.returns(uuid);
            shouldLog = config.get('logs.transferWise.log');
            createTransferStub = sandbox.stub(transferWise.transfer, 'create');
            logStub = sandbox.stub(logger, 'info');
        });

        beforeEach(() => {
            req = {
                quote: {
                    id: 543
                }
            };
            createTransferParams = {
                customerTransactionId: uuid,
                details: {
                    reference: 'Other',
                    sourceOfFunds: 'Other',
                    transferPurpose: 'Other'
                },
                quote: 543,
                targetAccount: 14141
            };
        });

        afterEach(() => {
            sandbox.reset();
            config.set('logs.transferWise.log', shouldLog);
        });

        after(() => {
            sandbox.restore();
        });

        it('should return an error when the TransferWise API call returns a rejected promise', async () => {
            const apiError = new Error('There was an error when calling the create transfer API');
            createTransferStub.rejects(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await createTransfer(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(createTransferStub, createTransferParams);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should return an error when the TransferWise API call throws an expection', async () => {
            const apiError = new Error('There was an error when calling the create transfer API');
            createTransferStub.throws(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await createTransfer(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(createTransferStub, createTransferParams);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and not log the output', async () => {
            const transfer = 'transfer placeholder';
            createTransferStub.resolves(transfer);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.transfer = transfer;
            const error = await createTransfer(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(createTransferStub, createTransferParams);
            sandbox.assert.notCalled(logStub);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and log the output', async () => {
            config.set('logs.transferWise.log', true);
            const transfer = 'transfer placeholder';
            createTransferStub.resolves(transfer);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.transfer = transfer;
            const error = await createTransfer(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(createTransferStub, createTransferParams);
            sandbox.assert.calledWith(logStub, {transfer});
            assert.deepStrictEqual(req, expectedReq);
        });
    });

    describe('fundTransfer', () => {
        const uuidv4 = sandbox.stub();
        transferWiseMiddleware = proxyquire('../../../app/middleware/transferWise', {
            'uuid/v4': uuidv4
        });
        const fundTransfer = promisify(transferWiseMiddleware.fundTransfer);
        let profileId, req, transferId;
        let fundTransferStub, logStub;
        let shouldLog;

        before(() => {
            uuidv4.returns(uuid);
            shouldLog = config.get('logs.transferWise.log');
            fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
            logStub = sandbox.stub(logger, 'info');
        });

        beforeEach(() => {
            profileId = 15243;
            transferId = 'test transfer id';
            req = {
                transfer: {
                    id: transferId
                }
            };
        });

        afterEach(() => {
            sandbox.reset();
            config.set('logs.transferWise.log', shouldLog);
        });

        after(() => {
            sandbox.restore();
        });

        it('should return an error when the TransferWise API call returns a rejected promise', async () => {
            const apiError = new Error('There was an error when calling the create transfer API');
            fundTransferStub.rejects(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await fundTransfer(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(fundTransferStub, profileId, transferId);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should return an error when the TransferWise API call throws an expection', async () => {
            const apiError = new Error('There was an error when calling the create transfer API');
            fundTransferStub.throws(apiError);
            const expectedReq = JSON.parse(JSON.stringify(req));
            const error = await fundTransfer(req, {}).catch(err => err);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error, apiError);
            sandbox.assert.calledWith(fundTransferStub, profileId, transferId);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and not log the output', async () => {
            const transferStatus = 'transfer status placeholder';
            fundTransferStub.resolves(transferStatus);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.transferStatus = transferStatus;
            const error = await fundTransfer(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(fundTransferStub, profileId, transferId);
            sandbox.assert.notCalled(logStub);
            assert.deepStrictEqual(req, expectedReq);
        });

        it('should succeed and log the output', async () => {
            config.set('logs.transferWise.log', true);
            const transferStatus = 'transfer status placeholder';
            fundTransferStub.resolves(transferStatus);
            const expectedReq = JSON.parse(JSON.stringify(req));
            expectedReq.transferStatus = transferStatus;
            const error = await fundTransfer(req, {}).catch(err => err);
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(fundTransferStub, profileId, transferId);
            sandbox.assert.calledWith(logStub, {transferStatus});
            assert.deepStrictEqual(req, expectedReq);
        });
    });
});
