const assert = require('assert');
const config = require('../../config');
const crypto = require('crypto');
const sandbox = require('sinon').createSandbox();
const server = require('../../app/server');
const request = require('supertest');

const appLogger = require('../../app/lib/loggers/app');
const requestLogger = require('../../app/lib/loggers/request');

const privateKeyBase64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcGdJQkFBS0NBUUVBM2RJdlh0TVd3RFJ3d0VORlBRb3VXemNpMDAyUVF4Q3E5YnZQWklqdTZ3NDVYWXJOCnIyN3VJUmMrZDhRTVlhQjFPMDQxV082UWMrYkR6VnJzMXpPcWdwWU4vOVdCVGVvaGZaak1JSWd1SFUyZlBhQVQKQXRTVkpsZkZjbnFXbTNKajN5N1lFaENwZW54VDN3aFNPYTgwcnZ0eXptU1JkeTNjZExzanA0c2Fhb3M4NVhWYwpkbk56MzdaSC9UbDVZS3ZuSWxLK2dGRGlpTjdyalVOWWRTNnFib2NwUVN3TVlSclc2OVdBTTVDSEtielpSU3NNCnZ2SzZQSnFBTzQ1R2NSM2xrQmRqaG9kSkM3enJjZW9NSjJQdTdFWnRRNzAvTHd3ZzNmNlUrdGViTXJVY0w4Z3QKOXlzZkNOa0p0dmZFdHhXd3RSdG9KNHl6WnpYMVVZZjFPT0lzcHdJREFRQUJBb0lCQVFDODdjZHhBV053UTNvQgpGNHJDYVlpQUlsN2tFRDBlRWZVNnBVTUlRdVVUaVNMcy9Fc2g3OTZjaXBxbkVYRG1PZTkvbXFZdlg4bmpIWnFKCnJyYm91Rld6TWJFc3hLR0VSalZPTHpVMVJDZmF4NEVvME0xQWJPVzRLYXUvVEpBNFI5NnVlY3lJM200ckovZWIKa0EvUWw5ek1hTmdvMkZsWlk5TlFEUkJhSkUxVWpqczRqTE5zd0RqVDN4UnRra1EwaEIrU2dmRkRrTFM4bjd6cwp4TkxZemNXZ2paZEJDdXJJOEs5WjNybmxCUnFGS0Y4WnNXMThlYktXeTZMRUdqRlVHOWo0a3ppVmFUOUlZWmdaCnJDc1lNKzEwbzlodzd1TWtVeVlCK04yTlVHQUtqMy81WUVPZ2JudXhlZ3BVQlUzbks2eUNEMmRMOStJWXZwa1UKdERwZjcwQ1JBb0dCQVBSdmxaQzVKc3Rwb2pJSW92Z1NvT1J0Tys1d2c1d1RNcU9GYU8rM2RrbWYrMldxbGZPbgpjSkZxN0tQZDlsQ05qenprTkRtZ3BNSHppdTRZKzZPMnV3Tm92RTFvZVlxb0RiKzdockdscnVhRXV6OTNUTTZNCjhpT3k2SlVqQWR6bmNiSml5bmZGYjBrTDl2dm0rNGhOdW1HQzQ4aWVlWE9FSUpjY1JLa0MzZ05wQW9HQkFPaFEKdFNPbGkxWHd2UHBLOGFBeTU1Y3VCK0t5cTBIektoYkRTUWJYRDU3Vm1tc0FlajJRREJ6K3gyamVFMVJFcG1sYgpQaUJXYVhSNWFIYXRxUVlWVC84eVQ3MUJnR2tjRitzbFhwekg2S2hCZEJZMU9wNjExdVA2NU9rTFJTUks0NjFxCm13NkxrL0d3WUZzTGJleklhY3grYUxuL0ZVM01nYnBwekFiN0ZIMlBBb0dCQU5mMG9iSnNNbDh5bzQ4SzNGakoKdElZOEQ5LzRYZjZOWTRiZS9qZ1Q0WmpvbENaZFVRQWtwYXFFU2kvNGtYN1hvbjVNcSt0aUIwNG55azNUbXJjbwpZUStCQUNSdnNqb1RnWm9zcHJMYXk2eDBCaTdyU3R1TjRQd3pPNU5QaTN6TXFrSE5VRTREQy9BQWR5UlZEVk4rClFMV1grNEVxcWVpcUNsVVhMMzRXdjJsSkFvR0JBSnNZYnFZYXVoZ28vWEU0SVhJcktmUUROaDZCMjlYT3FuWEIKOEhvUmtBc2hYZE03NFdCQ1QrUDNzRmR4azRQNXhRT25kNldOS3lBb2diWmhuK3RBeFVTQmFUelhnd3dwUmtxbAppekd1UU1RNzFtMlJJYzZkWlphVWhNaVV6cGM1TENFMWY4bEpJLzhDR29JTjhsaFhRRkxXdmNJVzZ6a2laQ1Y0CnhrNk94NUkvQW9HQkFNSzYyWTc0M1p4aDZGamtUQ0JSVU5hV2xSNUIwRnZXY1htR3FHUUVaYUJVMDRUMEpDOTgKTHdaaHdtNzF0T3hVYjJmV1B2a0hUVFk4T0pSWkpGRXVNb2Q4cmpiOHBtSEFXL2RjN3NrR05iOEhsdUZxaHpIRgpOeTBLUk1YNlpaQ2VvS2w3V3JJelhzMmxOY0VVWjVGWFZXQkJicWtUVFBJNWZHZWY4eGxKMk14cgotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
const privateKey = Buffer.from(privateKeyBase64, 'base64');

const privateKeyBadBase64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBMHVwV3JoZ3J4TzM5WmZMU3VLQldWWFVvMHJRQTdaSlNzRVBZSFhTekdSV0c2RmZmCkdZWU8rNUhKMFQ5cHRVc2dJbzA3MG81T0JyUlNNWTBaeG9xWnpIOWh3c2FkYjdaSmdPKzVDUEZ5NDJXOWJuRXIKUG5NZnJzUG90REFDcUEyd3ovY1Z6cEZJbWRKcDRPVmNyVDdkOVU5ZG5nb3Z4S1JKRWtWUzRRWmV0M3ZSVkhBSgpGc1Q5ekhWTVpGenFIenUzQncvdU1qeW1vN2VDSnJqeFdQYThMZnJvSC9YdDZIUy9YVzFpMmYwL0FkRzJQcTZKCmRWZDdmK29xdFF2TWVkbU9RZmJFT0U1RS81aWZOZFVzUElDK0loVC9xdGsxVlQ1bEdyaUxFVFl2VDVJaU0reEgKcUp4VXVFSUVMeCswcDBTa3pLREIyQTZzd2c4UTdzZ3MyZ1dCVXdJREFRQUJBb0lCQVFDZUhxaVZJL0hNVlU4ZgpXd2UyK2gwL08vSTY1RSs5eTNES1RGSjg0cnhTRmQxcDJsYWJYL0Zqa0V4bzNzMTA2TGxTcmVjblZ5QVB6cWZBCkZqUTRzRGZWSTdvNnQ0UFgrQ1RxME0wN2N5ZmFhcSsxV0lvKzZ6ZlpZVzNYaUJhMXZtM0x1MFZSODRFbU1LVEgKd2F2VkJjaUkyOU1uWkNPam5EWmJ5RFQyRmp4eitMWVJWRXhSMHp6aUVtSWlVU0x4RzFYRGYrYmNKcGxTRVJPVQpINnpiUkp6bnVPd2dnTjZ4OFNzeExBMTVwdnhnOEtCS0E0Z3FiSmgyOTN3OUJUYXlwRFo1ZU4yRFZRNVM4dFhWCk16Tk9nb1ZlQlA5ODBQbzJCWXpwaHVtL3NkRXB4czJvZS9YWmRhbGZQbXMrL1Q4S2NwelBQd25yalU4NndYcVoKdUwrNkJZNkJBb0dCQVBseHNVNVhRNC9tUWFHSUdYNlhzbXNtdWN2Y3hWNW0zT2lnd2lBeFczdHdNUThTQ2Z6VwpzTVZWOHRzdlBPRE9wUkJFRFIwNDdPNk5iaHJiTEVOSnR6RWpsNk84SWlZbEN4MWhuaWcrem9JblNXbXdtRlFyCmhGKzBPdXpCWG5NTW5CYmsvMU95TFg5R29aeEhsdlVkSkFBWjYyRVNLeTR1TW9VWm15OTVuNXh4QW9HQkFOaDEKYXRwNnBZTmhYQ1Fpb1E1RmYyR3UxQmI1aThNVGJjRlRMVEF0bEpVbUlrZk00OWFnbUY2a0s5dnhRY09qTEU3NAp0c3VPWjJqRW9nVGRZMHlmV2hGdTZHVjRiYU40WEdaV296bEE5czN6OG1LdEtEcVBDam5YMmFqZGR4RU1WYnRjCjRaVC8reVdlR3FhbTNBV0IwdWhCN3lxU0h5RVVzN0J2WTBFWkYyd0RBb0dBQXhZNEZuc1g5L0RtZ1FRNUpJcm0KQjFOc1d5eDVPTWpYRlAzZ1NSdXpRUnpMVHA5dmhqUjE3WXM1dlNLaGd6cXJhajhkVm00ODZGclJzUDFqVjlYUwpzWVg2TzJsNWxyVkFwUFZ2U3BvMFhnSDBjNTFlMVRQUXFJcUhiQ1NjY1pvSFdIVXUvNjhseHZ4dHhZeFJQdWxFClo4ZnFWTUl2ekp0L3ZvdnBrclhUbHRFQ2dZQUVtcXJGTHVxcVdyM00vdmVTQ0NSbmZZS0JZcGw0Y3NkWTMxNE0Kc2t1QXlLamVBaHV1aXdmeXEyZExiRnhMdndMSVF6NFFJbDFNdXpIL0RINTZPTUYvc1c0OENrMjZ0bXF3dXBNSwpPcm1GTS9VcDZDajg1ZUgvelBtU1AvT3laeUxEczN3UTRVa0VTZEtqVE5WTlFLK3R4UWxEVEl4ZzljSEV0UG5WCmZxVWk1UUtCZ1FDZEZab1ZXNmN5L1NzTTNucTBjUk9CTm84bTk2MVZseUk4ejVVbjhheHBjdnl2M1FhaUEwMDUKN1NBVFJaQis3b1J6bVZsNFlLd20zcHNHcklrTStOVFFLRmZqUUV0cWY4QzBFWjM0KzFnQjRDY21nTVpiZzBJeQp3UHdOYWVBbkpPR2hhOWt3b2JoQXZOY1ZjYWlFc0V3eFNiVkxtUUJyQXc3cTNiQkxabklQTUE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
const privateKeyBad = Buffer.from(privateKeyBadBase64, 'base64');

const getSignature = (rawBody, key = privateKey) => {
    const sign = crypto.createSign('sha1WithRSAEncryption');
    sign.update(rawBody);
    return sign.sign(key, 'base64');
};

describe('app/server.js', () => {
    describe('failure points', () => {
        describe('authorizationMiddleware.verifyEventSignature', () => {
            let appErrorLoggerStub, requestInfoLoggerStub;

            before(() => {
                appErrorLoggerStub = sandbox.stub(appLogger, 'error');
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
            it('should return a 404 if an invalid route is called', async () => {

            });
        });
    
        describe('/balance-deposit', () => {
            describe('failure points', () => {
                describe('validationMiddleware.balanceAccountEvent', () => {
                    it('should route to the failure middleware if AJV validation fails', () => {
                        
                    });
                });
                
                describe('transferWiseMiddleware.getTargetAccount', () => {
    
                });
                
                describe('transferWiseMiddleware.createQuote', () => {
    
                });
                
                describe('transferWiseMiddleware.createTransfer', () => {
    
                });
                
                describe('transferWiseMiddleware.fundTransfer', () => {
    
                });
                
                describe('logMiddleware.logBalanceAccountEvent', () => {
    
                });
            });
        });
    });
});