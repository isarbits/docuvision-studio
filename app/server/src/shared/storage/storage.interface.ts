import { ReadStream } from 'fs';

type PathLike = string;
type FileData = Buffer | ReadStream;
type FileInfo = {
    filename?: PathLike;
    location?: PathLike;
    [key: string]: any;
};
type SyncOrPromise<T> = T | Promise<T>;

export interface StorageInterface {
    getFile: (filename: PathLike, options?: any) => SyncOrPromise<FileData>;
    putFile: (filename: PathLike, body: FileData, options?: any) => SyncOrPromise<boolean>;
    listFiles: (path: PathLike) => SyncOrPromise<string[] | FileInfo[]>;
    getFileInfo: (path: PathLike) => SyncOrPromise<string[] | FileInfo>;
}
