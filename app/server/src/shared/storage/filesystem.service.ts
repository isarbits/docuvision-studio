import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { StorageInterface } from './storage.interface';

@Injectable()
export class FileSystemService implements StorageInterface {
    getFile(filename: string, options?: any) {
        return fs.promises.readFile(filename, options);
    }

    putFile(filename: string, body: Buffer | fs.ReadStream, options?: any) {
        fs.mkdirSync(path.dirname(filename), { recursive: true });

        return fs.promises
            .writeFile(filename, body, options)
            .then(() => true)
            .catch(error => {
                console.error(error);
                return false;
            });
    }

    listFiles(path: string) {
        return fs.promises.readdir(path);
    }

    getFileInfo(path: string) {
        return fs.promises.stat(path);
    }
}

export const FileSystemStatic = new FileSystemService();
