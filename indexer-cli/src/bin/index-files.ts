import { elastic } from 'config';
import { StudioClient } from '../api/client';
import { Docuvision } from '../docuvision';
import '../lib/errors';
import { hashFile } from '../lib/hash';
import { Progress, walkPaths } from '../lib/utils';

export type PollResponse = Omit<Docuvision.GetDocumentResponse, 'body'> & {
    body?: any;
    failed?: boolean;
    duration?: number;
    message?: string;
    stack?: string;
    uploadFailure?: any;
};

const studioClient = new StudioClient();

// const handleUploadFailure = (uploadFailure: Docuvision.GetDocumentResponse): PollResponse => {
//     let ret = {};
//     if (uploadFailure?.body) {
//         ret = { ...uploadFailure, failed: true };
//     } else if (uploadFailure instanceof Error) {
//         ret = { message: uploadFailure.message, stack: uploadFailure.stack, failed: true };
//     } else {
//         ret = { uploadFailure, failed: true };
//     }
//     return ret;
// };

const indexFile = async (file: string): Promise<PollResponse> => {
    const md5 = await hashFile(file);
    if (await studioClient.documentExists(elastic.index, md5)) {
        return null;
    }

    return studioClient.upload(file);

    // const start = Date.now();
    // const response = (
    //     await studioClient.upload(file).catch(handleUploadFailure)) as PollResponse;
    // response.duration = Date.now() - start;

    // return null;
    // const document = await indexDocument(file, response);

    // if (!response?.failed && document.document) {
    //     if (document.document?.pages?.length) {
    //         const toIndex = [];
    //         for (const page of document.document.pages) {
    //             toIndex.push(indexPage(document, page));

    //             if (elastic.indexWords) {
    //                 toIndex.push(indexAllWords(document, page));
    //             }
    //         }
    //         await Promise.all(toIndex);
    //     }
    // }

    // return response;
};

export const indexAllFiles = async (paths: string[]) => {
    const promises: Promise<void>[] = [];

    const progress = new Progress();

    console.log(`\nStarted ${new Date().toUTCString()}`);

    for (const file of walkPaths(paths)) {
        progress.total++;
        progress.pending++;
        progress.print();

        const result = indexFile(file)
            .then(() => {
                progress.total--;
            })
            .catch(e => {
                progress.print([`error processing ${file}`, e]);
            })
            .then(() => progress.print());

        promises.push(result);
    }

    await Promise.all(promises);

    console.log(`\n\nFinished processing in ${(progress.elapsed / 1000).toFixed(2)}s`);
};
