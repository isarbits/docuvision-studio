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
