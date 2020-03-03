#!/usr/bin/env node
import { RequestParams } from '@elastic/elasticsearch';
import { indexAllFiles } from './bin/index-files';
import { search } from './bin/search-indexed';
import { watchFolderAndIndex } from './bin/watch';
import { Client } from './docuvision/docuvision';
import { Params } from './interfaces';

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

    case 'find':
        if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
            console.error('usage: npm run search [-h | --help | size=SIZE | from=from | -v] SEARCH_TERMS');
            process.exit(Number(args.length === 0));
        }

        const params: Params<RequestParams.Search> = { _source_exclude: ['document.pages.words', 'page.words'] };

        const searchTerms = [];
        for (const arg of args) {
            if (/^size=/.test(arg)) {
                const size = Number(arg.replace('size=', ''));
                if (Number.isNaN(size)) {
                    console.error(`expected SIZE to be a number:'${arg.replace('size=', '')}'`);
                    process.exit(1);
                }
                params.size = size;
            } else if (/^from=/.test(arg)) {
                const from = Number(arg.replace('from=', ''));
                if (Number.isNaN(from)) {
                    console.error(`expected FROM to be a number: '${arg.replace('from=', '')}'`);
                    process.exit(1);
                }
                params.from = from;
            } else if (/-v|--verbose/.test(arg)) {
                delete params._source_exclude;
            } else {
                searchTerms.push(arg);
            }
        }

        search(searchTerms.join(' '), params);
        break;

    // this will be removed from the demo app
    case 'apikey':
        if (args.length !== 3) {
            console.error('Super secret thing: email password name');
            process.exit(1);
        }
        const client = new Client();
        client['createKey'](...(args as [string, string, string]))
            .then(({ body }) => console.log(body))
            .catch(({ response }) => console.error(response.body || response.text))
            .then(() => process.exit(0));
        break;

    case '-h':
    case '--help':
    case 'help':
    default:
        console.error(`usage: npm run search [index | find] [-h | --help] ...`);
        break;
}
