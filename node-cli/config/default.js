require('dotenv').config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    app: 'search',
    paths: {
        generatedFiles: process.env.PATHS_GENERATED_FILES || '/generated-files',
    },
    elastic: {
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        index: process.env.ELASTICSEARCH_INDEX || 'docuvision',
    },
    docuvision: {
        host: process.env.DOCUVISION_HOST || 'https://app.docuvision.io/api',
        apiKey: process.env.DOCUVISION_APIKEY,
        pollTimeout: process.env.DOCUVISION_POLL_TIMEOUT,
    },
};
