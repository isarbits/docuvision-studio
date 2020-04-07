import { elastic } from 'config';
import { StudioClient } from '../api/client';
import '../lib/errors';
import { hashFile } from '../lib/hash';
import { walkPaths } from '../lib/utils';

const studioClient = new StudioClient();

const upload = async (file: string) => {
    const md5 = await hashFile(file);

    if (await studioClient.documentExists(elastic.index, md5)) {
        return null;
    }

    return studioClient.upload(file, { ocrEngine: process.env.OCR_ENGINE });
};

export const indexAllFiles = async (paths: string[]) => {
    const promises: Promise<void>[] = [];

    const start = Date.now();

    console.log(`\nStarted ${new Date().toUTCString()}`);

    for (const file of walkPaths(paths)) {
        const result = upload(file)
            .then(() => console.log(`Uploaded ${file}`))
            .catch((error) => {
                console.error(`Error processing ${file}`);
                console.error(error);
            });

        promises.push(result);
    }

    await Promise.all(promises);

    console.log(`Finished processing in ${((Date.now() - start) / 1000).toFixed(2)}s`);
};
