require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    app: 'search',
    host: process.env.HOST || 'http://localhost:8100/v1',
    apiKey: process.env.DOCUVISION_APIKEY,
    paths: {
        generatedFiles: process.env.PATHS_GENERATED_FILES || '/generated-files',
    },
    elastic: {
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        index: process.env.ELASTICSEARCH_INDEX || 'docuvision',
        logIndex: process.env.ELASTICSEARCH_LOG_INDEX || 'logs',
        indexWords: process.env.ELASTICSEARCH_INDEX_WORDS === 'true',
    },
    docuvision: {
        host: process.env.DOCUVISION_HOST || 'https://app.docuvision.io/api',
        pollTimeout: process.env.DOCUVISION_POLL_TIMEOUT,
    },
};
