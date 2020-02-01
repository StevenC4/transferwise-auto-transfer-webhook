/* eslint-disable max-lines-per-function */
const assert = require('assert');
const logger = require('../../../app/lib/loggers/request');
const {promisify} = require('util');
const requestLoggerMiddleware = promisify(require('../../../app/middleware/requestLogger'));
const sandbox = require('sinon').createSandbox();

describe('app/middleware/requestLoggerMiddleware.js', () => {
    let loggerInfoStub;

    before(() => {
        loggerInfoStub = sandbox.stub(logger, 'info');
    });

    afterEach(() => {
        sandbox.resetHistory();
    });

    after(() => {
        sandbox.restore();
    });

    // Should this test the actual function? Or should it test the registering of the function? Maybe both?
    it('should log the request when the response object triggers an on finish event', async () => {
        let onFinishFunction;
        const on = (_event, func) => onFinishFunction = func;
        const onSpy = sandbox.spy(on);
        const req = {
            hostname: 'hostname',
            ip: '8.8.8.8',
            ips: ['8.8.8.8'],
            method: 'GET',
            originalUrl: 'original url',
        };
        const res = {
            on: onSpy,
            statusCode: 200
        };
        const error = await requestLoggerMiddleware(req, res).catch(err => err);
        assert.strictEqual(error, undefined);
        sandbox.assert.notCalled(loggerInfoStub);
        sandbox.assert.calledWith(onSpy, 'finish', sandbox.match.func);
        onFinishFunction();
        sandbox.assert.calledWith(loggerInfoStub, {
            hostname: 'hostname',
            ip: '8.8.8.8',
            ips: ['8.8.8.8'],
            method: 'GET',
            originalUrl: 'original url',
            statusCode: 200
        });

    });
});
