const assert = require('assert');
const config = require('../../config');
const crypto = require('crypto');
const sandbox = require('sinon').createSandbox();
const server = require('../../app/server');
const transferWise = require('../../app/lib/transferWise');
const request = require('supertest');

const appLogger = require('../../app/lib/loggers/app');
const requestLogger = require('../../app/lib/loggers/request');

const privateKeyBase64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcGdJQkFBS0NBUUVBM2RJdlh0TVd3RFJ3d0VORlBRb3VXemNpMDAyUVF4Q3E5YnZQWklqdTZ3NDVYWXJOCnIyN3VJUmMrZDhRTVlhQjFPMDQxV082UWMrYkR6VnJzMXpPcWdwWU4vOVdCVGVvaGZaak1JSWd1SFUyZlBhQVQKQXRTVkpsZkZjbnFXbTNKajN5N1lFaENwZW54VDN3aFNPYTgwcnZ0eXptU1JkeTNjZExzanA0c2Fhb3M4NVhWYwpkbk56MzdaSC9UbDVZS3ZuSWxLK2dGRGlpTjdyalVOWWRTNnFib2NwUVN3TVlSclc2OVdBTTVDSEtielpSU3NNCnZ2SzZQSnFBTzQ1R2NSM2xrQmRqaG9kSkM3enJjZW9NSjJQdTdFWnRRNzAvTHd3ZzNmNlUrdGViTXJVY0w4Z3QKOXlzZkNOa0p0dmZFdHhXd3RSdG9KNHl6WnpYMVVZZjFPT0lzcHdJREFRQUJBb0lCQVFDODdjZHhBV053UTNvQgpGNHJDYVlpQUlsN2tFRDBlRWZVNnBVTUlRdVVUaVNMcy9Fc2g3OTZjaXBxbkVYRG1PZTkvbXFZdlg4bmpIWnFKCnJyYm91Rld6TWJFc3hLR0VSalZPTHpVMVJDZmF4NEVvME0xQWJPVzRLYXUvVEpBNFI5NnVlY3lJM200ckovZWIKa0EvUWw5ek1hTmdvMkZsWlk5TlFEUkJhSkUxVWpqczRqTE5zd0RqVDN4UnRra1EwaEIrU2dmRkRrTFM4bjd6cwp4TkxZemNXZ2paZEJDdXJJOEs5WjNybmxCUnFGS0Y4WnNXMThlYktXeTZMRUdqRlVHOWo0a3ppVmFUOUlZWmdaCnJDc1lNKzEwbzlodzd1TWtVeVlCK04yTlVHQUtqMy81WUVPZ2JudXhlZ3BVQlUzbks2eUNEMmRMOStJWXZwa1UKdERwZjcwQ1JBb0dCQVBSdmxaQzVKc3Rwb2pJSW92Z1NvT1J0Tys1d2c1d1RNcU9GYU8rM2RrbWYrMldxbGZPbgpjSkZxN0tQZDlsQ05qenprTkRtZ3BNSHppdTRZKzZPMnV3Tm92RTFvZVlxb0RiKzdockdscnVhRXV6OTNUTTZNCjhpT3k2SlVqQWR6bmNiSml5bmZGYjBrTDl2dm0rNGhOdW1HQzQ4aWVlWE9FSUpjY1JLa0MzZ05wQW9HQkFPaFEKdFNPbGkxWHd2UHBLOGFBeTU1Y3VCK0t5cTBIektoYkRTUWJYRDU3Vm1tc0FlajJRREJ6K3gyamVFMVJFcG1sYgpQaUJXYVhSNWFIYXRxUVlWVC84eVQ3MUJnR2tjRitzbFhwekg2S2hCZEJZMU9wNjExdVA2NU9rTFJTUks0NjFxCm13NkxrL0d3WUZzTGJleklhY3grYUxuL0ZVM01nYnBwekFiN0ZIMlBBb0dCQU5mMG9iSnNNbDh5bzQ4SzNGakoKdElZOEQ5LzRYZjZOWTRiZS9qZ1Q0WmpvbENaZFVRQWtwYXFFU2kvNGtYN1hvbjVNcSt0aUIwNG55azNUbXJjbwpZUStCQUNSdnNqb1RnWm9zcHJMYXk2eDBCaTdyU3R1TjRQd3pPNU5QaTN6TXFrSE5VRTREQy9BQWR5UlZEVk4rClFMV1grNEVxcWVpcUNsVVhMMzRXdjJsSkFvR0JBSnNZYnFZYXVoZ28vWEU0SVhJcktmUUROaDZCMjlYT3FuWEIKOEhvUmtBc2hYZE03NFdCQ1QrUDNzRmR4azRQNXhRT25kNldOS3lBb2diWmhuK3RBeFVTQmFUelhnd3dwUmtxbAppekd1UU1RNzFtMlJJYzZkWlphVWhNaVV6cGM1TENFMWY4bEpJLzhDR29JTjhsaFhRRkxXdmNJVzZ6a2laQ1Y0CnhrNk94NUkvQW9HQkFNSzYyWTc0M1p4aDZGamtUQ0JSVU5hV2xSNUIwRnZXY1htR3FHUUVaYUJVMDRUMEpDOTgKTHdaaHdtNzF0T3hVYjJmV1B2a0hUVFk4T0pSWkpGRXVNb2Q4cmpiOHBtSEFXL2RjN3NrR05iOEhsdUZxaHpIRgpOeTBLUk1YNlpaQ2VvS2w3V3JJelhzMmxOY0VVWjVGWFZXQkJicWtUVFBJNWZHZWY4eGxKMk14cgotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
const privateKey = Buffer.from(privateKeyBase64, 'base64');

const privateKeyBadBase64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBMHVwV3JoZ3J4TzM5WmZMU3VLQldWWFVvMHJRQTdaSlNzRVBZSFhTekdSV0c2RmZmCkdZWU8rNUhKMFQ5cHRVc2dJbzA3MG81T0JyUlNNWTBaeG9xWnpIOWh3c2FkYjdaSmdPKzVDUEZ5NDJXOWJuRXIKUG5NZnJzUG90REFDcUEyd3ovY1Z6cEZJbWRKcDRPVmNyVDdkOVU5ZG5nb3Z4S1JKRWtWUzRRWmV0M3ZSVkhBSgpGc1Q5ekhWTVpGenFIenUzQncvdU1qeW1vN2VDSnJqeFdQYThMZnJvSC9YdDZIUy9YVzFpMmYwL0FkRzJQcTZKCmRWZDdmK29xdFF2TWVkbU9RZmJFT0U1RS81aWZOZFVzUElDK0loVC9xdGsxVlQ1bEdyaUxFVFl2VDVJaU0reEgKcUp4VXVFSUVMeCswcDBTa3pLREIyQTZzd2c4UTdzZ3MyZ1dCVXdJREFRQUJBb0lCQVFDZUhxaVZJL0hNVlU4ZgpXd2UyK2gwL08vSTY1RSs5eTNES1RGSjg0cnhTRmQxcDJsYWJYL0Zqa0V4bzNzMTA2TGxTcmVjblZ5QVB6cWZBCkZqUTRzRGZWSTdvNnQ0UFgrQ1RxME0wN2N5ZmFhcSsxV0lvKzZ6ZlpZVzNYaUJhMXZtM0x1MFZSODRFbU1LVEgKd2F2VkJjaUkyOU1uWkNPam5EWmJ5RFQyRmp4eitMWVJWRXhSMHp6aUVtSWlVU0x4RzFYRGYrYmNKcGxTRVJPVQpINnpiUkp6bnVPd2dnTjZ4OFNzeExBMTVwdnhnOEtCS0E0Z3FiSmgyOTN3OUJUYXlwRFo1ZU4yRFZRNVM4dFhWCk16Tk9nb1ZlQlA5ODBQbzJCWXpwaHVtL3NkRXB4czJvZS9YWmRhbGZQbXMrL1Q4S2NwelBQd25yalU4NndYcVoKdUwrNkJZNkJBb0dCQVBseHNVNVhRNC9tUWFHSUdYNlhzbXNtdWN2Y3hWNW0zT2lnd2lBeFczdHdNUThTQ2Z6VwpzTVZWOHRzdlBPRE9wUkJFRFIwNDdPNk5iaHJiTEVOSnR6RWpsNk84SWlZbEN4MWhuaWcrem9JblNXbXdtRlFyCmhGKzBPdXpCWG5NTW5CYmsvMU95TFg5R29aeEhsdlVkSkFBWjYyRVNLeTR1TW9VWm15OTVuNXh4QW9HQkFOaDEKYXRwNnBZTmhYQ1Fpb1E1RmYyR3UxQmI1aThNVGJjRlRMVEF0bEpVbUlrZk00OWFnbUY2a0s5dnhRY09qTEU3NAp0c3VPWjJqRW9nVGRZMHlmV2hGdTZHVjRiYU40WEdaV296bEE5czN6OG1LdEtEcVBDam5YMmFqZGR4RU1WYnRjCjRaVC8reVdlR3FhbTNBV0IwdWhCN3lxU0h5RVVzN0J2WTBFWkYyd0RBb0dBQXhZNEZuc1g5L0RtZ1FRNUpJcm0KQjFOc1d5eDVPTWpYRlAzZ1NSdXpRUnpMVHA5dmhqUjE3WXM1dlNLaGd6cXJhajhkVm00ODZGclJzUDFqVjlYUwpzWVg2TzJsNWxyVkFwUFZ2U3BvMFhnSDBjNTFlMVRQUXFJcUhiQ1NjY1pvSFdIVXUvNjhseHZ4dHhZeFJQdWxFClo4ZnFWTUl2ekp0L3ZvdnBrclhUbHRFQ2dZQUVtcXJGTHVxcVdyM00vdmVTQ0NSbmZZS0JZcGw0Y3NkWTMxNE0Kc2t1QXlLamVBaHV1aXdmeXEyZExiRnhMdndMSVF6NFFJbDFNdXpIL0RINTZPTUYvc1c0OENrMjZ0bXF3dXBNSwpPcm1GTS9VcDZDajg1ZUgvelBtU1AvT3laeUxEczN3UTRVa0VTZEtqVE5WTlFLK3R4UWxEVEl4ZzljSEV0UG5WCmZxVWk1UUtCZ1FDZEZab1ZXNmN5L1NzTTNucTBjUk9CTm84bTk2MVZseUk4ejVVbjhheHBjdnl2M1FhaUEwMDUKN1NBVFJaQis3b1J6bVZsNFlLd20zcHNHcklrTStOVFFLRmZqUUV0cWY4QzBFWjM0KzFnQjRDY21nTVpiZzBJeQp3UHdOYWVBbkpPR2hhOWt3b2JoQXZOY1ZjYWlFc0V3eFNiVkxtUUJyQXc3cTNiQkxabklQTUE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
const privateKeyBad = Buffer.from(privateKeyBadBase64, 'base64');

const validBody = {
    data: {
        resource: {
            id: 24816,
            type: 'balance-account',
            profile_id: 15243
        },
        amount: 1234,
        currency: 'EUR',
        post_transaction_balance_amount: 5555,
        occurred_at: '2020-02-03T15:31:05.013224Z',
        transaction_type: 'credit'
    },
    subscription_id: '51efc396-51c7-4173-bb71-c5ce5edaf43e',
    event_type: 'balances#credit',
    schema_version: '1.2.3',
    sent_at: '2020-02-03T15:31:05.013224Z'
};

const getSignature = (rawBody, key = privateKey) => {
    const sign = crypto.createSign('sha1WithRSAEncryption');
    sign.update(rawBody);
    return sign.sign(key, 'base64');
};

describe('app/server.js', () => {
    describe('failure points', () => {
        describe('authorizationMiddleware.verifyEventSignature', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should fail if there is no X-Signature header', async () => {
                await request(server)
                    .get('/balance-deposit')
                    .set('Accept', 'application/json')
                    .expect(401);
                sandbox.assert.notCalled(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(requestInfoLoggerStub);
                sandbox.assert.calledWith(requestInfoLoggerStub, {
                    hostname: '127.0.0.1',
                    ip: '::ffff:127.0.0.1',
                    ips: [],
                    method: 'GET',
                    originalUrl: '/balance-deposit',
                    statusCode: 401
                });
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match((error) => {
                    assert.strictEqual(error.ip, '::ffff:127.0.0.1');
                    assert.deepStrictEqual(error.ips, []);
                    assert.strictEqual(error.method, 'GET');
                    assert.strictEqual(error.originalUrl, '/balance-deposit');
                    assert.notStrictEqual(error.err, undefined);
                    assert.strictEqual(error.err.message, 'No X-Signature header present');
                    assert.strictEqual(error.errorMessage, 'No X-Signature header present');
                    assert.notStrictEqual(error.stackTrace, undefined);
                    return true;
                }));
            });

            it('should fail if the public key verification fails', async () => {
                const body = {
                    a: 1,
                    b: 'two',
                    c: 3.92
                };
                const rawBody = JSON.stringify(body);
                const signature = getSignature(rawBody, privateKeyBad);
                await request(server)
                    .post('/balance-deposit')
                    .send(rawBody)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('X-Signature', signature)
                    .expect(401);
                sandbox.assert.notCalled(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(requestInfoLoggerStub);
                sandbox.assert.calledWith(requestInfoLoggerStub, {
                    hostname: '127.0.0.1',
                    ip: '::ffff:127.0.0.1',
                    ips: [],
                    method: 'POST',
                    originalUrl: '/balance-deposit',
                    statusCode: 401
                });
                sandbox.assert.calledTwice(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub.firstCall, {
                    body,
                    rawBody,
                    signature,
                    publicKey: Buffer.from(config.get('transferWise.publicKey'), 'base64').toString()
                });
                sandbox.assert.calledWith(appErrorLoggerStub.secondCall, 'An error occurred', sandbox.match((error) => {
                    assert.strictEqual(error.ip, '::ffff:127.0.0.1');
                    assert.deepStrictEqual(error.ips, []);
                    assert.strictEqual(error.method, 'POST');
                    assert.strictEqual(error.originalUrl, '/balance-deposit');
                    assert.notStrictEqual(error.err, undefined);
                    assert.strictEqual(error.err.message, 'Failed public key verification');
                    assert.strictEqual(error.errorMessage, 'Failed public key verification');
                    assert.notStrictEqual(error.stackTrace, undefined);
                    return true;
                }));
            });
        });

        describe('invalid route handler', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should return a 404 if an invalid route is called', async () => {
                const rawBody = '{"a":1,"b":2.00,"c":"123"}';
                await request(server)
                    .post('/invalid-route')
                    .send(rawBody)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(rawBody))
                    .expect(404);
                sandbox.assert.notCalled(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(requestInfoLoggerStub);
                sandbox.assert.calledWith(requestInfoLoggerStub, {
                    hostname: '127.0.0.1',
                    ip: '::ffff:127.0.0.1',
                    ips: [],
                    method: 'POST',
                    originalUrl: '/invalid-route',
                    statusCode: 404
                });
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match((error) => {
                    assert.strictEqual(error.ip, '::ffff:127.0.0.1');
                    assert.deepStrictEqual(error.ips, []);
                    assert.strictEqual(error.method, 'POST');
                    assert.strictEqual(error.originalUrl, '/invalid-route');
                    assert.notStrictEqual(error.err, undefined);
                    assert.strictEqual(error.err.message, 'Invalid route called');
                    assert.strictEqual(error.errorMessage, 'Invalid route called');
                    assert.notStrictEqual(error.stackTrace, undefined);
                    return true;
                }));
            });
        });
    
        describe('validationMiddleware.balanceAccountEvent', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should route to the failure middleware if AJV validation fails', async () => {
                const body = JSON.stringify({a: 1, b: 2, c: 3});
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.notCalled(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Invalid event format');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });

            it('should route to the failure middleware if the profile_id in the event does not match the profile id that the user specified', async () => {
                const body = JSON.stringify({
                    ...validBody,
                    data: {
                        ...validBody.data,
                        resource: {
                            ...validBody.data.resource,
                            profile_id: 13715
                        }
                    }
                });
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.notCalled(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Wrong profile id: 13715');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });

            it('should route to the failure middleware if the resource id does not match the account id selected by the user', async () => {
                const body = JSON.stringify({
                    ...validBody,
                    data: {
                        ...validBody.data,
                        resource: {
                            ...validBody.data.resource,
                            id: 34251
                        }
                    }
                });
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Incorrect source borderless account id: 34251');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });

            it('should route to the failure middleware if the resource id does not match the account id selected by the user', async () => {
                const body = JSON.stringify({
                    ...validBody,
                    data: {
                        ...validBody.data,
                        amount: 1234,
                        post_transaction_balance_amount: 123
                    }
                });
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Amount (1234) cannot be greater than post_transaction_balance_amount (123)');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });
        });
        
        describe('transferWiseMiddleware.getTargetAccount', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should return an error if the api call throws an error', async () => {
                const body = JSON.stringify(validBody);
                const apiError = new Error('Error while calling get accounts');
                getAccountsStub.throws(apiError);
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(getAccountsStub);
                sandbox.assert.notCalled(createQuoteStub);
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Error while calling get accounts');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });

            it('should return an error if the list of accounts from the api call does not include the target account specified by the user', async () => {
                const body = JSON.stringify(validBody);
                getAccountsStub.resolves([
                    {id: 1234},
                    {id: 2345},
                    {id: 3456}
                ]);
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(getAccountsStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Chosen target account not found');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });
        });
        
        describe('transferWiseMiddleware.createQuote', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should return an error if the api call throws an error', async () => {
                const apiError = new Error('Error calling create quote API');
                const body = JSON.stringify(validBody);
                getAccountsStub.resolves([
                    {id: 1234},
                    {
                        id: 14141,
                        currency: 'USD'
                    },
                    {id: 3456}
                ]);
                createQuoteStub.throws(apiError);
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(getAccountsStub);
                sandbox.assert.calledOnce(createQuoteStub);
                sandbox.assert.calledWith(createQuoteStub, {
                    profile: 15243,
                    rateType: 'FIXED',
                    source: 'EUR',
                    sourceAmount: 1234,
                    target: 'USD',
                    type: 'BALANCE_PAYOUT'
                });
                sandbox.assert.notCalled(createTransferStub);
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Error calling create quote API');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });
        });
        
        describe('transferWiseMiddleware.createTransfer', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should return an error if the api call throws an error', async () => {
                const apiError = new Error('Error calling create transfer API');
                const body = JSON.stringify(validBody);
                getAccountsStub.resolves([
                    {id: 1234},
                    {
                        id: 14141,
                        currency: 'USD'
                    },
                    {id: 3456}
                ]);
                createQuoteStub.resolves({id: 'quote id'});
                createTransferStub.throws(apiError);
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(getAccountsStub);
                sandbox.assert.calledOnce(createQuoteStub);
                sandbox.assert.calledWith(createQuoteStub, {
                    profile: 15243,
                    rateType: 'FIXED',
                    source: 'EUR',
                    sourceAmount: 1234,
                    target: 'USD',
                    type: 'BALANCE_PAYOUT'
                });
                sandbox.assert.calledOnce(createTransferStub);
                sandbox.assert.calledWith(createTransferStub, sandbox.match(params => {
                    assert.notStrictEqual(params.customerTransactionId, undefined);
                    assert.deepStrictEqual(params.details, {
                        reference: 'Other',
                        sourceOfFunds: 'Other',
                        transferPurpose: 'Other'
                    });
                    assert.strictEqual(params.quote, 'quote id');
                    assert.strictEqual(params.targetAccount, 14141);
                    return true;
                }));
                sandbox.assert.notCalled(fundTransferStub);
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Error calling create transfer API');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });
        });
        
        describe('transferWiseMiddleware.fundTransfer', () => {
            let appErrorLoggerStub, createQuoteStub, createTransferStub, fundTransferStub, getAccountsStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
                createQuoteStub = sandbox.stub(transferWise.quote, 'create');
                createTransferStub = sandbox.stub(transferWise.transfer, 'create');
                fundTransferStub = sandbox.stub(transferWise.transfer, 'fund');
                getAccountsStub = sandbox.stub(transferWise.accounts, 'get');
                requestInfoLoggerStub = sandbox.stub(requestLogger, 'info');
            });

            afterEach(() => {
                sandbox.reset();
            });

            after(() => {
                sandbox.restore();
            });

            it('should return an error if the api call throws an error', async () => {
                const apiError = new Error('Error calling fund transfer API');
                const body = JSON.stringify(validBody);
                getAccountsStub.resolves([
                    {id: 1234},
                    {
                        id: 14141,
                        currency: 'USD'
                    },
                    {id: 3456}
                ]);
                createQuoteStub.resolves({id: 'quote id'});
                createTransferStub.resolves({id: 'transfer id'});
                fundTransferStub.throws(apiError);
                await request(server)
                    .post('/balance-deposit')
                    .send(body)
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('X-Signature', getSignature(body))
                    .expect(200);
                sandbox.assert.calledOnce(getAccountsStub);
                sandbox.assert.calledOnce(createQuoteStub);
                sandbox.assert.calledWith(createQuoteStub, {
                    profile: 15243,
                    rateType: 'FIXED',
                    source: 'EUR',
                    sourceAmount: 1234,
                    target: 'USD',
                    type: 'BALANCE_PAYOUT'
                });
                sandbox.assert.calledOnce(createTransferStub);
                sandbox.assert.calledWith(createTransferStub, sandbox.match(params => {
                    assert.notStrictEqual(params.customerTransactionId, undefined);
                    assert.deepStrictEqual(params.details, {
                        reference: 'Other',
                        sourceOfFunds: 'Other',
                        transferPurpose: 'Other'
                    });
                    assert.strictEqual(params.quote, 'quote id');
                    assert.strictEqual(params.targetAccount, 14141);
                    return true;
                }));
                sandbox.assert.calledOnce(fundTransferStub);
                sandbox.assert.calledWith(fundTransferStub, 15243, 'transfer id');
                sandbox.assert.calledOnce(appErrorLoggerStub);
                sandbox.assert.calledWith(appErrorLoggerStub, 'An error occurred', sandbox.match(error => {
                    assert.strictEqual(error.errorMessage, 'Error calling fund transfer API');
                    return true;
                }));
                sandbox.assert.calledOnce(requestInfoLoggerStub);
            });
        });
        
        describe('logMiddleware.logBalanceAccountEvent', () => {

        });
    });
});