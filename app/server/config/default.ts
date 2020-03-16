import { resolve } from 'path';
import { config as dotenv } from 'dotenv';
dotenv();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const apiPrefix = process.env.API_PREFIX || 'v1';
const host = process.env.HOST || 'http://localhost';
const port = Number(process.env.PORT || 8100);
const apiBaseUri = `${host}:${port}/${apiPrefix}`;

const serverHost = 'http://localhost:8100/v1';
const pm2AppName = 'workers';
const standalone = !process.env.PM2_HOME;
const workerIsClusterMaster = !standalone && process.env.name === pm2AppName && process.env.INSTANCE_ID === '0';

const config = {
    app: 'Docuvision Studio Backend',
    apiPrefix,
    host,
    port,
    apiBaseUri,
    externalWorkers: process.env.EXTERNAL_WORKERS === 'true',
    paths: {
        projectRoot: resolve(__dirname, '..'),
        tempPath: resolve(__dirname, '..', 'tmp'),
        publicDir: process.env.PATHS_PUBLIC_DIR || resolve(__dirname, '../../../client/build'),
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
        pm2AppName,
        serverHost: process.env.WORKERS_SERVER_HOST || serverHost,
        cluster: {
            port: Number(process.env.WORKERS_CLUSER_PORT || 8101),
            max: Number(process.env.WORKERS_CLUSER_MAX ?? 5),
            min: Math.max(1, Number(process.env.WORKERS_CLUSER_MIN ?? 1)),
            autoScale: process.env.WORKERS_CLUSER_AUTO_SCALE === 'true' && workerIsClusterMaster,
            ioMax: Number(process.env.WORKERS_CLUSER_IO_MAX || 200),
            waitMax: Number(process.env.WORKERS_CLUSER_WAIT_MAX || 5000),
            memMax: process.env.WORKERS_CLUSER_MEM_MAX || '1 GB',
            cpuMax: Math.min(Number(process.env.WORKERS_CLUSER_CPU_MAX || 80), 100),
        },
    }
};

module.exports = config;
