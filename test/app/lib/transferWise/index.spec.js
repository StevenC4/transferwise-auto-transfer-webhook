const assert = require('assert');
const proxyquire = require('proxyquire');
const sandbox = require('sinon').createSandbox();
let transferWise;

/* eslint-disable max-lines-per-function */
describe('app/lib/transferWise/index.js', () => {
    describe('_sendRequest', () => {
        let fetchStub;

        before(() => {
            fetchStub = sandbox.stub();
            transferWise = proxyquire('../../../../app/lib/transferWise', {
                'isomorphic-fetch': fetchStub
            });
        });

        afterEach(() => {
            sandbox.reset();
        });

        after(() => {
            sandbox.restore();
        });

        it('should throw an error if fetch rejects with an error', async () => {
            const fetchError = new Error('Error making http request');
            fetchStub.rejects(fetchError);
            const method = 'GET';
            const path = 'test-path';
            const body = { /* eslint-disable id-length */
                a: 1,   
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.strictEqual(response, undefined);
            assert.strictEqual(error, fetchError);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
        });

        it('should throw an error if fetch throws an error', async () => {
            const fetchError = new Error('Error making http request');
            fetchStub.throws(fetchError);
            const method = 'GET';
            const path = 'test-path';
            const body = { /* eslint-disable id-length */
                a: 1,
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.strictEqual(response, undefined);
            assert.strictEqual(error, fetchError);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
        });

        it('should throw an error if decoding the json response rejects with an error', async () => {
            const jsonError = new Error('Error decoding json response');
            const jsonStub = sandbox.stub().rejects(jsonError);
            fetchStub.resolves({
                json: jsonStub
            });
            const method = 'GET';
            const path = 'test-path';
            const body = { /* eslint-disable id-length */
                a: 1,
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.strictEqual(response, undefined);
            assert.strictEqual(error, jsonError);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
            sandbox.assert.calledOnce(jsonStub);
        });

        it('should throw an error if decoding the json response throws an error', async () => {
            const jsonError = new Error('Error decoding json response');
            const jsonStub = sandbox.stub().throws(jsonError);
            fetchStub.resolves({
                json: jsonStub
            });
            const method = 'GET';
            const path = 'test-path';
            const body = { /* eslint-disable id-length */
                a: 1,
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.strictEqual(response, undefined);
            assert.strictEqual(error, jsonError);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
            sandbox.assert.calledOnce(jsonStub);
        });

        it('should throw an error if decoding the json yields a non-ok response', async () => {
            const jsonStub = sandbox.stub().resolves({metadata: 'here'});
            fetchStub.resolves({
                json: jsonStub,
                ok: false
            });
            const method = 'GET';
            const path = 'test-path';
            const body = { /* eslint-disable id-length */
                a: 1,
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.strictEqual(response, undefined);
            assert.notStrictEqual(error, undefined);
            assert.strictEqual(error.message, 'Error calling the TransferWise API');
            assert.deepStrictEqual(error.apiError, {metadata: 'here'});
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
            sandbox.assert.calledOnce(jsonStub);
        });

        it('should return a response when no errors occur', async () => {
            const jsonStub = sandbox.stub().resolves({body: 'body'});
            fetchStub.resolves({
                json: jsonStub,
                ok: true
            });
            const method = 'GET';
            const path = 'test-path';
            const body = {
                a: 1,
                b: 2,
                c: 3
            };
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path, body);
            } catch (err) {
                error = err;
            }
            assert.deepStrictEqual(response, {body: 'body'});
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key',
                    'Content-Type': 'application/json'
                },
                body: '{"a":1,"b":2,"c":3}'
            });
            sandbox.assert.calledOnce(jsonStub);
        });
        
        it('should return a response when no errors occur and a body is not provided', async () => {
            const jsonStub = sandbox.stub().resolves({body: 'body'});
            fetchStub.resolves({
                json: jsonStub,
                ok: true
            });
            const method = 'GET';
            const path = 'test-path';
            let error, response;
            try {
                response = await transferWise._sendRequest(method, path);
            } catch (err) {
                error = err;
            }
            assert.deepStrictEqual(response, {body: 'body'});
            assert.strictEqual(error, undefined);
            sandbox.assert.calledWith(fetchStub, 'http://transferwise-base-url.test/test-path', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test API key'
                }
            });
            sandbox.assert.calledOnce(jsonStub);
        });
    });
});