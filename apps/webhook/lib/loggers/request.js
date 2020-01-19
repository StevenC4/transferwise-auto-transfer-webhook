const config = require('../../../../config');
const {createLogger, format, transports} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: {
        service: 'transferwise-webhook'
    },
    transports: []
});

if (config.get('env') !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple(),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        )
    }));
} else {
    logger.add(new DailyRotateFile({
        filename: config.get('logs.request.filename'),
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '31d'
    }));
}

module.exports = logger;
