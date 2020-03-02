import { Search } from '../search/search';
import { elastic } from 'config';

const logger = new Search({
    node: elastic.node,
    index: 'indexer_logs',
});

const logToElastic = (level: string, data: string) => {
    return logger.index({ body: { level, data } }).catch(console.error);
};

export const log = (data: string) => logToElastic('default', data);
export const error = (data: string) => logToElastic('error', data);
export const logError = (error: Error) =>
    logToElastic(
        'error',
        JSON.stringify(
            error instanceof Error
                ? {
                      message: error?.message,
                      name: error?.name,
                      stack: error?.stack?.split('\n'),
                  }
                : error,
        ),
    );
