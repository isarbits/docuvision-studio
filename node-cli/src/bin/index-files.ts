import { docuvision, elastic } from 'config';
import * as fs from 'fs';
import * as path from 'path';
import { Client as DocuClient } from '../docuvision/docuvision';
import { DocuvisionClient } from '../interfaces';
import '../lib/errors';
import { hashFile } from '../lib/hash';
import { Progress, walkPaths } from '../lib/utils';
import { Search } from '../search/search';
import * as chokidar from 'chokidar';

const index = elastic.index || 'docuvision';

const search = new Search({
    node: elastic.node,
    index,
});

const docuvisionClient = new DocuClient({
    host: docuvision.host,
    apiKey: docuvision.apiKey,
});

const idExists = async (id: string) => {
    const { body } = await search.count({
        body: {
            query: {
                term: {
                    id,
                },
            },
        },
    });
    return 0 !== body.count;
};

const uploadAndWaitForCompletion = async (file: string): Promise<DocuvisionClient.GetDocumentResponse> => {
    const upload = await docuvisionClient.upload({ file });
    return await docuvisionClient.pollForCompletion(upload.body.id, docuvision.pollTimeout);
};

const indexFile = async (file: string): Promise<DocuvisionClient.GetDocumentResponse & { duration: number; failed?: boolean }> => {
    const hash = await hashFile(file);
    if (await idExists(hash)) {
        return null;
    }

    const start = Date.now();
    const response: DocuvisionClient.GetDocumentResponse & { failed?: boolean } = await uploadAndWaitForCompletion(file).catch(uploadFailure => {
        if (uploadFailure?.body) {
            return { ...uploadFailure, failed: true };
        } else if (uploadFailure instanceof Error) {
            return { message: uploadFailure.message, stack: uploadFailure.stack, failed: true };
        }
        return { uploadFailure, failed: true };
    });
    const duration = Date.now() - start;

    const document = {
        id: hash,
        createdAt: new Date(),
        error: null,
        document: null,
        processingTime: duration,
        upload: {
            path: file,
            folder: path.dirname(file),
            filename: path.basename(file),
            extension: path.extname(file),
            size: fs.statSync(file).size,
        },
    };

    if (response.failed) {
        document.error = response;
    } else if (response?.body?.errors?.length) {
        document.error = response.body;
        response.failed = true;
    } else {
        document.document = response.body;
    }

    await search.index({ body: document });

    if (!response?.failed && document.document) {
        const { pages, ...doc } = document.document as DocuvisionClient.Document;

        if (pages?.length) {
            await Promise.all(
                pages.map(page => {
                    const body = {
                        ...document,
                        document: doc,
                        page,
                    };
                    return search.index({ index: `${index}_page`, body }).catch(console.error);
                }),
            );
        }
    }

    return { ...response, duration };
};

export const indexAllFiles = async (paths: string[]) => {
    if (!(await search.client.ping().catch(() => null))) {
        console.error(`Elasticsearch is unreachable (${elastic.node})`);
        process.exit(1);
    }
    if (!(await docuvisionClient.reachable())) {
        console.error(`Docuvision is unreachable (${docuvision.host})`);
        process.exit(1);
    }

    await Promise.all([search.indicesCreate({ index }).catch(() => null), search.indicesCreate({ index: `${index}_page` }).catch(() => null)]);

    const promises: Promise<void>[] = [];

    const progress = new Progress();

    console.log(`Started ${new Date().toUTCString()}`);

    for (const file of walkPaths(paths)) {
        await new Promise(res => setTimeout(res, 100));
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
            })
            .then(() => progress.print());

        promises.push(result);
    }

    await Promise.all(promises);

    console.log(`\n\nFinished processing in ${(progress.elapsed / 1000).toFixed(2)}s`);
};

// folders.foreach(...watch)
export const watchFolderAndIndex = (folder: string) => {
    console.log(`Starting folderwatcher ${folder}`);

    // blacklist .gitignore - if the folder is created by docker the watcher fails
    const fsWatcher = chokidar.watch(folder, { ignored: '/data/.gitignore' });

    let working = false;
    const fileQueue = [];
    let debounceTimer;

    const getDebounced = () =>
        new Promise(res => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => res(clearTimeout(debounceTimer)), 100);
        });

    const fsChangeHandler = async (_op: string, file: string) => {
        if (file) {
            fileQueue.push(path.join(folder, file));
        }

        await getDebounced();

        if (!working) {
            working = true;
            // osx emits "rename" _op event on every file change (delete, create, rename)
            // so as a workaround, we simply queue every "change", remove dupes, and assert the file exists
            const pending = [...new Set(fileQueue.splice(0, fileQueue.length))].filter(filename => fs.existsSync(filename));
            if (pending.length) {
                await indexAllFiles(pending);
            }
            working = false;

            // if events were fired while we were processing, just re-fire
            if (fileQueue.length) {
                fsWatcher.emit('all', 'change', null);
            }
        }
    };

    fsWatcher.on('all', fsChangeHandler);
    // also launch once on start
    fsWatcher.emit('all', 'change', '/');
};

export const dev = {
    index,
    search,
    docuvisionClient,
    idExists,
    uploadAndWaitForCompletion,
    indexFile,
};
