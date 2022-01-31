var winston = require('winston');

function getLogger(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //using filename in log statements
    return winston.loggers.add('logger', {
        console: {
            level: 'debug',
            colorize: true,
            label: path
        },
        file: {
            level: 'info',
            filename: './logs/all.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false,
            label: path
        }
    });

}

module.exports = getLogger;