import * as fs from 'fs';
import * as path from 'path';

/**
 * walk directory and list all files
 *
 * @param {string}  dir    Path to search
 * @param {number}  depth  Max depth (default is recursive)
 *                         Depth = 1 will not recurse into subdirectories
 */
export const walk = function*(dir: string, depth = -1) {
    if (depth === 0) {
        return;
    }

    if (!fs.existsSync(dir)) {
        return [];
    }

    if (fs.statSync(dir).isFile()) {
        yield dir;
        return;
    }

    for (const filename of fs.readdirSync(dir)) {
        const filePath = path.join(dir, filename);
        const stats = fs.statSync(filePath);
        if (!stats.isDirectory()) {
            yield filePath;
        } else {
            yield* walk(filePath, depth - 1);
        }
    }
};

export const walkPaths = function*(paths: string[]) {
    for (const dir of paths) {
        yield* walk(dir);
    }
};

export class Progress {
    started: number;
    pending: number;
    completed: number;
    skippedExisting: number;
    failed: number;
    total: number;
    time: {
        completed: number[];
        failed: number[];
        each: { [filename: string]: { time?: number; failed?: boolean } };
    };
    _first?: boolean;

    constructor() {
        this.started = Date.now();
        this.pending = 0;
        this.completed = 0;
        this.failed = 0;
        this.skippedExisting = 0;
        this.total = 0;
        this.time = {
            completed: [],
            failed: [],
            each: {},
        };
        this._first = false;
    }

    avg(arr: number[]) {
        return (arr.reduce((t, v) => t + v / 1000, 0) / arr.length || 0).toFixed(2);
    }

    print(errors: string[] = null) {
        const finished = this.completed + this.failed;
        const pct = finished ? Math.floor((100 * finished) / this.total) : 0;
        const lines = [
            `\x1b[K\rProcessing...    : ${pct}%`,
            `\x1b[K\rtotal            : ${this.total}`,
            `\x1b[K\rpending          : ${this.pending}`,
            `\x1b[K\rskipped existing : ${this.skippedExisting}`,
            `\x1b[K\rcompleted        : ${this.completed}`,
            `\x1b[K\rfailed           : ${this.failed}`,
            `\x1b[K\rAvg fail time    : ${this.avg(this.time.failed)}s`,
            `\x1b[K\rAvg success time : ${this.avg(this.time.completed)}s`,
            `\x1b[K\rElapsed          : ${(this.elapsed / 1000).toFixed(2)}s`,
        ];

        if (this._first && !errors) {
            // Move curser up lines.length - 1 times
            process.stdout.write(`\x1b[A`.repeat(lines.length - 1));
        }
        this._first = true;

        if (errors) {
            for (const e of ['\n', ...errors, '\n']) {
                console.log(e);
            }
        }

        // Print out lines (\x1b[K\r will clear current line)
        process.stdout.write(lines.join('\n'));
    }

    get elapsed() {
        return Date.now() - this.started;
    }
}

async function* deleteNextDocuments(docuvisionClient) {
    let docs = await docuvisionClient.listDocuments().then(docs => docs.body.data);
    while (docs.length) {
        yield docs.length;
        await Promise.all(docs.map(doc => docuvisionClient.deleteDocument({ docId: doc.id })));
        docs = await docuvisionClient.listDocuments().then(docs => docs.body.data);
    }
}

export const deleteAllDocuments = async docuvisionClient => {
    for await (const count of deleteNextDocuments(docuvisionClient)) {
        console.log(`deleting ${count}`);
    }
};
