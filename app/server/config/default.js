const path = require('path');

require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    app: 'Docuvision Studio Backend',
    apiPrefix: 'v1',
    port: Number(process.env.PORT || 8100),
    transportPort: Number(process.env.TRANSPORT_PORT || 4000),
    paths: {
        projectRoot: path.resolve(__dirname, '..'),
        tempPath: path.resolve(__dirname, '..', 'tmp'),
        staticDir: path.resolve(__dirname, '../../../client/build'),
        assetsDir: path.resolve(__dirname, '../static'),
    },
    logging: {
        logLevel: 'default:all;' + process.env.LOG_LEVELS ?? '',
    },
    elasticsearch: {
        node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
    }
};
