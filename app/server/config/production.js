const path = require('path');

module.exports = {
    paths: {
        staticDir: path.resolve(__dirname, '../app/'),
    },
    logging: {
        logLevel: 'default:all;debug:none;' + process.env.LOG_LEVELS ?? '',
    }
};
