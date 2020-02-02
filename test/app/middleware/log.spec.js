/* eslint-disable max-lines-per-function */
const assert = require('assert');
const config = require('../../../config');
const logger = require('../../../app/lib/loggers/transferWise');
const logMiddleware = require('../../../app/middleware/log');
const {promisify} = require('util');
const sandbox = require('sinon').createSandbox();

describe('app/middleware/log.js', () => {
	describe('logBalanceAccountEvent', () => {
		const logBalanceAccountEvent = promisify(logMiddleware.logBalanceAccountEvent);
		let loggerInfoStub;
		let expectedReq, req;
		let shouldLog;

		before(() => {
			loggerInfoStub = sandbox.stub(logger, 'info');
			shouldLog = config.get('logs.transferWise.log');
		});

		beforeEach(() => {
			req = {
				body: 'event body',
				quote: 'transferwise quote',
				transfer: 'transferwise transfer',
				transferStatus: 'transferwise transfer status'
			};
			expectedReq = JSON.parse(JSON.stringify(req));
		});

		afterEach(() => {
			sandbox.resetHistory();
			config.set('logs.transferWise.log', shouldLog);
		});

		after(() => {
			sandbox.restore();
		});

		it('should not log the output when the config is not set to do so', async () => {
			const error = await logBalanceAccountEvent(req, {}).catch(err => err);
			assert.strictEqual(error, undefined);
			sandbox.assert.notCalled(loggerInfoStub);
			assert.deepStrictEqual(req, expectedReq);
		});

		it('should log the output when the config is set to do so', async () => {
			config.set('logs.transferWise.log', true);
			const error = await logBalanceAccountEvent(req, {}).catch(err => err);
			assert.strictEqual(error, undefined);
			sandbox.assert.calledWith(loggerInfoStub, {
				balanceAccountEvent: {
					event: 'event body',
					quote: 'transferwise quote',
					transfer: 'transferwise transfer',
					transferStatus: 'transferwise transfer status'
				}
			});
			assert.deepStrictEqual(req, expectedReq);
		});
	});
});
