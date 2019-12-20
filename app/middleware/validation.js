const Ajv = require('ajv');
const eventSchema = require('../schemas/event.json');
const balanceAccountEventSchema = require('../schemas/balanceAccountEvent.json');

const ajv = new Ajv({
    allErrors: true,
    extendRefs: true,
    missingRefs: 'fail',
    schemaId: "$id",
    schemas: [eventSchema, balanceAccountEventSchema]
});
require('ajv-merge-patch/keywords/merge')(ajv);

console.log(ajv.getSchema('balanceAccountEvent.json#'));

module.exports.balanceAccountEvent = (req, res, next) => {
    let error; 
    
    const isValid = ajv.validate(balanceAccountEventSchema, req.body);
    if (!isValid) {
        console.error(ajv.errors);
        error = new Error('Invalid event format');
    }    

    return next(error);
};
