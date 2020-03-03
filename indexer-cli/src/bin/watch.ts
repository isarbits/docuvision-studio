import * as chokidar from 'chokidar';
import * as fs from 'fs';
import { docuvision, elastic } from 'config';
import { indexAllFiles } from './index-files';

// folders.foreach(...watch)
export const watchFolderAndIndex = (folder: string) => {
    console.log(`Docuvision: ${docuvision.host}`);
    console.log(`Elastic: ${elastic.node}`);
    if (!!process.env.ISWIN) {
        console.warn('Polling enabled on windows - may result in performance issues');
    }

    // blacklist .gitignore - if the folder is created by docker the watcher fails
    const fsWatcher = chokidar.watch(folder, {
        usePolling: !!process.env.ISWIN,
        ignored: '/data/.gitignore',
    });

    const fileQueue = [];
    let working = false;
    let pingOnce = true;
    let debounceTimer;

    const getDebounced = () =>
        new Promise(res => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => res(clearTimeout(debounceTimer)), 100);
        });

    const fsChangeHandler = async (_op: string, file: string) => {
        if (file) {
            fileQueue.push(file);
        }

        await getDebounced();

        if (!working) {
            working = true;
            // osx emits "rename" _op event on every file change (delete, create, rename)
            // so as a workaround, we simply queue every operation, remove dupes, and assert the file exists
            const pending = [...new Set(fileQueue.splice(0, fileQueue.length))].filter(
                filename => fs.existsSync(filename) && fs.statSync(filename).isFile(),
            );
            if (pending.length) {
                await indexAllFiles(pending, pingOnce);
                pingOnce = false;
            }
            working = false;

            // if events were fired while we were processing, just re-fire
            if (fileQueue.length) {
                fsWatcher.emit('all', 'change', null);
            }
        }
    };

    fsWatcher.on('all', fsChangeHandler);

    console.log(`Started folderwatcher: ${folder}\n`);

    // also launch once on start
    fsWatcher.emit('all', 'change', '/');
};
