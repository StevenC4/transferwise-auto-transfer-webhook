const logger = require('../lib/loggers/transferWise');

module.exports.logBalanceAccountEvent = (req, _res, next) => {
    if (config.get('logs.transferWise.log')) {
        logger.info({
            event: req.body,
            quote: req.quote,
            transfer: req.transfer,
            transferStatus: req.transferStatus
        });
    }   
    next();
};