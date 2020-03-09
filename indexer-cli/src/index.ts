#!/usr/bin/env node

import { indexAllFiles } from './bin/index-files';
import { watchFolderAndIndex } from './bin/watch';

let args = process.argv.slice(3);

switch (process.argv[2]) {
    case 'index':
        if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
            console.error('usage: npm run index [-h | --help | -w | --watch] FILES_OR_FOLDERS...');
            process.exit(Number(args.length === 0));
        }
        if (args.includes('-w') || args.includes('--watch')) {
            args = args.filter(a => !/-w|--watch/.test(a));
            if (args.length > 1) {
                console.error('Watch mode only supports 1 folder at this time');
                process.exit(1);
            }
            process.on('SIGTERM', () => process.exit(0));
            watchFolderAndIndex(args[0]);
        } else {
            indexAllFiles(args);
        }

        break;

    case '-h':
    case '--help':
    case 'help':
    default:
        console.error(`usage: npm run search [index | find] [-h | --help] ...`);
        break;
}
