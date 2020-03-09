import { resolve } from 'path';
import { config as dotenv } from 'dotenv';
dotenv();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const apiPrefix = process.env.API_PREFIX || 'v1';
const host = process.env.HOST || 'http://localhost';
const port = Number(process.env.PORT || 8100);
const apiBaseUri = `${host}:${port}/${apiPrefix}`;
const serverHost = 'http://localhost:8100/v1';

const config = {
    app: 'Docuvision Studio Backend',
    serverHost,
    apiPrefix,
    host,
    port,
    apiBaseUri,
    transportPort: Number(process.env.TRANSPORT_PORT ?? 4000),
    paths: {
        projectRoot: resolve(__dirname, '..'),
        tempPath: resolve(__dirname, '..', 'tmp'),
        staticDir: process.env.PATHS_STATIC_DIR || resolve(__dirname, '../../../client/build'),
        assetsDir: process.env.PATHS_ASSETS_DIR || resolve(__dirname, '../static'),
    },
    logging: {
        logLevel: 'default:all;' + (process.env.LOG_LEVELS ?? ''),
    },
    elasticsearch: {
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        indices: {
            document: process.env.ELASTICSEARCH_INDICES_DOCUMENT || 'docuvision',
            page: process.env.ELASTICSEARCH_INDICES_PAGE || 'docuvision_page',
            word: process.env.ELASTICSEARCH_INDICES_WORD || 'docuvision_word',
        }
    },
    docuvision: {
        host: process.env.DOCUVISION_HOST || 'https://app.docuvision.io/api',
        apiKey: process.env.DOCUVISION_APIKEY,
        pollTimeout: process.env.DOCUVISION_POLL_TIMEOUT,
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
    workers: {
        cluster: {
            max: Number(process.env.WORKERS_CLUSER_MAX ?? 10),
            min: Number(process.env.WORKERS_CLUSER_MAX ?? 0),
            autoScale: process.env.WORKERS_CLUSER_MAX ? !!process.env.WORKERS_CLUSER_MAX : true,
        },
        serverHost: process.env.WORKER_SERVER_HOST || apiBaseUri,
    }
};

module.exports = config;
