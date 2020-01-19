const config = require('../../../config');
const logger = require('../lib/loggers/transferWise');

module.exports.logBalanceAccountEvent = (req, _res, next) => {
    if (config.get('logs.webhook.transferWise.log')) {
        logger.info({
            balanceAccountEvent: {
                event: req.body,
                quote: req.quote,
                transfer: req.transfer,
                transferStatus: req.transferStatus
            }
        });
    }
    next();
};