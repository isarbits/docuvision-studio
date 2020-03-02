import { StorageInterface } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import { log } from '../logging/es-log';

class FileSystemStorage implements StorageInterface {
    public getFile(filename: string) {
        return fs.promises.readFile(filename);
    }

    public putFile(filename: string, body: Buffer, options?: any) {
        log(filename);
        fs.mkdirSync(path.dirname(filename), { recursive: true });

        return fs.promises
            .writeFile(filename, body, options)
            .then(() => true)
            .catch(error => {
                console.error(error);
                return false;
            });
    }

    public listFiles(path: string) {
        return fs.promises.readdir(path);
    }

    public getFileInfo(path: string) {
        return fs.promises.stat(path);
    }
}

export const FileSystemStorageStatic = new FileSystemStorage();
