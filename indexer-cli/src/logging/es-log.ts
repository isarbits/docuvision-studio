import { Search } from '../elastic/search/search';
import { elastic } from 'config';

const logger = new Search({
    node: elastic.node,
    index: elastic.logIndex,
});

const logToElastic = (level: string, data: string) => {
    const body = { level, data, created: Date.now() };
    if (level === 'error') console.log(body);
    return logger.index({ body }).catch(console.error);
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
