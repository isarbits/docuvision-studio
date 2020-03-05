import { elastic } from 'config';
import { StudioClient } from '../api/client';
import { indexDocument } from '../elastic/indices/document';
import { indexPage } from '../elastic/indices/page';
import { indexAllWords } from '../elastic/indices/word';
import { Docuvision } from '../interfaces';
import '../lib/errors';
import { hashFile } from '../lib/hash';
import { Progress, walkPaths } from '../lib/utils';
import { log, logError } from '../logging/es-log';

export type PollResponse = Omit<Docuvision.GetDocumentResponse, 'body'> & {
    body?: any;
    failed?: boolean;
    duration?: number;
    message?: string;
    stack?: string;
    uploadFailure?: any;
};

const studioClient = new StudioClient();

const handleUploadFailure = (uploadFailure: Docuvision.GetDocumentResponse): PollResponse => {
    let ret = {};
    if (uploadFailure?.body) {
        ret = { ...uploadFailure, failed: true };
    } else if (uploadFailure instanceof Error) {
        ret = { message: uploadFailure.message, stack: uploadFailure.stack, failed: true };
    } else {
        ret = { uploadFailure, failed: true };
    }
    return ret;
};

const indexFile = async (file: string): Promise<PollResponse> => {
    const md5 = await hashFile(file);
    if (await studioClient.documentExists(elastic.index, md5)) {
        return null;
    }

    const start = Date.now();
    const response = await studioClient.upload(file, { waitForCompletion: true }).catch(handleUploadFailure) as PollResponse;
    response.duration = Date.now() - start;

    const document = await indexDocument(file, response);

    if (!response?.failed && document.document) {
        if (document.document?.pages?.length) {
            const toIndex = [];
            for (const page of document.document.pages) {
                toIndex.push(indexPage(document, page));

                if (elastic.indexWords) {
                    toIndex.push(indexAllWords(document, page));
                }
            }
            await Promise.all(toIndex);
        }
    }

    return response;
};

export const indexAllFiles = async (paths: string[], pingClient = true) => {
    void pingClient;
    // if (!(await esClient.client.ping().catch(() => null))) {
    //     console.error(`Elasticsearch is unreachable (${elastic.node})`);
    //     process.exit(1);
    // }
    // if (pingClient && !(await docuvisionClient.reachable())) {
    //     console.error(`Docuvision is unreachable (${docuvision.host})`);
    //     process.exit(1);
    // }

    // await Promise.all([
    //     esClient.indicesCreate({ index: elastic.index }).catch(() => null),
    //     esClient.indicesCreate({ index: `${elastic.index}_page` }).catch(() => null),
    //     esClient.indicesCreate({ index: `${elastic.index}_word` }).catch(() => null),
    // ]);

    const promises: Promise<void>[] = [];

    const progress = new Progress();

    console.log(`\nStarted ${new Date().toUTCString()}`);

    for (const file of walkPaths(paths)) {
        progress.total++;
        progress.pending++;
        progress.print();

        const reqStart = Date.now();
        const result = indexFile(file)
            .then(r => {
                progress.pending--;

                if (r === null) {
                    progress.skippedExisting++;
                    return;
                }

                progress.time.each[file] = { time: r.duration };

                if (r.failed) {
                    progress.failed++;
                    progress.time.each[file].failed = true;
                    progress.time.failed.push(r.duration);
                } else {
                    progress.completed++;
                    progress.time.each[file].failed = false;
                    progress.time.completed.push(r.duration);
                }
            })
            .catch(e => {
                progress.pending--;
                progress.failed++;
                progress.time.each[file] = { time: Date.now() - reqStart, failed: true };
                progress.print([`error processing ${file}`, e]);
                logError(e);
            })
            .then(() => progress.print());

        promises.push(result);
    }

    await Promise.all(promises);

    log(JSON.stringify(progress));

    console.log(`\n\nFinished processing in ${(progress.elapsed / 1000).toFixed(2)}s`);
};
