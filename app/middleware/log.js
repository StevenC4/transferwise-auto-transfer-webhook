const logger = require('../lib/loggers/app');

module.exports.logBalanceAccountEvent = (req, _res, next) => {
    logger.info({
        event: req.body,
        quote: req.quote,
        transfer: req.transfer,
        transferStatus: req.transferStatus
    });
    next();
};