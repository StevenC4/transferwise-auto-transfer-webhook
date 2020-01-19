const Ajv = require('ajv');
const balanceAccountEventSchema = require('../schemas/transferWise/events/balanceAccount.json.js');
const createQuoteApiRequestSchema = require('../schemas/transferWise/apiRequestBodies/createQuote.json.js');
const createTransferApiRequestSchema = require('../schemas/transferWise/apiRequestBodies/createTransfer.json.js');
const eventSchema = require('../schemas/transferWise/events/event.json.js');

const ajv = new Ajv({
    allErrors: true,
    extendRefs: true,
    missingRefs: 'fail',
    schemaId: "$id",
    schemas: [
        eventSchema,
        balanceAccountEventSchema,
        createQuoteApiRequestSchema,
        createTransferApiRequestSchema
    ]
});

require('ajv-merge-patch/keywords/merge')(ajv);

module.exports = ajv;
