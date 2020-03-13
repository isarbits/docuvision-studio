import { resolve } from 'path';

const config = {
    paths: {
        publicDir: resolve(__dirname, '../app/'),
    },
    logging: {
        logLevel: 'default:all;debug:none;' + (process.env.LOG_LEVELS ?? ''),
    }
};

module.exports = config;
