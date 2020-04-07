import { createHash } from 'crypto';
import { createReadStream } from 'fs';

export const hashFile = (file: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        const fileStream = createReadStream(file);

        fileStream.on('error', reject);

        hash.once('readable', () => resolve(hash.read().toString('hex')));

        fileStream.pipe(hash);
    });
};

export const hashBuffer = (file: Buffer): Promise<string> => {
    return new Promise((resolve) => {
        const hash = createHash('md5');

        hash.once('readable', () => resolve(hash.read().toString('hex')));

        hash.write(file);
        hash.end();
    });
};
