import { statSync } from 'fs';
import * as path from 'path';
import { basename, dirname, extname, resolve } from 'path';
import { PollResponse } from '../../bin/index-files';
import { hashFile } from '../../lib/hash';
import { SearchManager } from '../search/search-manager';
import { IndexDocument } from '../index.d';
import { elastic } from 'config';

const esClient = SearchManager.getClient({
    index: elastic.index,
    node: elastic.node,
});

// const buildTreeFromPath = (fullPath: string): Tree => {
//     let tree = {};
//     let root = tree;
//     for (const part of fullPath.split(path.sep)) {
//         if (!part) {
//             continue;
//         }
//         root[`${part}`] = {};
//         root = root[`${part}`];
//     }
//     return tree;
// };

export const indexDocument = async (file: string, uploadResponse: PollResponse): Promise<IndexDocument> => {
    const md5 = await hashFile(file);
    const fullPath = resolve(file);

    const document: IndexDocument = {
        id: md5,
        createdAt: new Date(),
        error: null,
        document: null,
        processingTime: uploadResponse.duration,
        upload: {
            path: fullPath,
            folder: dirname(fullPath),
            filename: basename(fullPath),
            extension: extname(fullPath),
            size: statSync(fullPath).size,
            folderParts: fullPath.split(path.sep).filter(Boolean),
            md5,
        },
    };

    if (uploadResponse.failed) {
        document.error = uploadResponse;
    } else if (uploadResponse?.body?.errors?.length) {
        document.error = uploadResponse.body;
        uploadResponse.failed = true;
    } else {
        document.document = uploadResponse.body;
    }

    await esClient.index({ body: document });

    return document;
};
