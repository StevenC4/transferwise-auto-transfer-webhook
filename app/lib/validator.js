const Ajv = require('ajv');
const balanceAccountEventSchema = require('../schemas/transferWise/events/balanceAccount.json');
const createQuoteApiRequestSchema = require('../schemas/transferWise/apiRequestBodies/createQuote.json');
const createTransferApiRequestSchema = require('../schemas/transferWise/apiRequestBodies/createTransfer.json');
const eventSchema = require('../schemas/transferWise/events/event.json');

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
