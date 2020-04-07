import * as chokidar from 'chokidar';
import * as fs from 'fs';
import { indexAllFiles } from './index-files';

export const watchFolderAndIndex = (folder: string) => {
    if (process.env.ISWIN) {
        console.warn('Polling enabled on windows - may result in performance issues');
    }

    // blacklist .gitignore - if the folder is created by docker the watcher fails
    const fsWatcher = chokidar.watch(folder, {
        usePolling: !!process.env.ISWIN,
        ignored: '/data/.gitignore',
    });

    const fileQueue = [];
    let working = false;
    let debounceTimer;

    const getDebounced = () =>
        new Promise((res) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => res(clearTimeout(debounceTimer)), 100);
        });

    const isFile = (filename) => fs.existsSync(filename) && fs.statSync(filename).isFile();

    const fsChangeHandler = async (_op: string, file: string) => {
        if (file) {
            fileQueue.push(file);
        }

        await getDebounced();

        if (!working) {
            working = true;

            const pending = [...new Set(fileQueue.splice(0, fileQueue.length))].filter(isFile);

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

    console.log(`Started folderwatcher: ${folder}`);

    // also launch once on start
    fsWatcher.emit('all', 'change', '/');
};
