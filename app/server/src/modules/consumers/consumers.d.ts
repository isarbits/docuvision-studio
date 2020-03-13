import { Job, JobId, Queue } from 'bull';

import Docuvision from '../docuvision/docuvision.d';

export interface WorkerInterface<T> {
    readonly jobName: string;
    readonly queue: Queue;
    readonly work: (job: Job<T>) => Promise<any>;
}

export interface Tree {
    [key: string]: Tree;
}

export interface IndexObject {
    id: string;
    parentId: JobId;
    createdAt: Date;
    error: any;
    processingTime: number;
    upload?: {
        path: string;
        folder: string;
        filename: string;
        extension: string;
        size: number;
        md5: string;
        folderTree?: Tree;
        folderParts?: string[];
    };
}

export interface IndexDocument extends IndexObject {
    document: Docuvision.Document;
}

export interface IndexPage extends IndexObject {
    document: Omit<Docuvision.Document, 'pages'>;
    page: Docuvision.Page;
}

export interface IndexWord extends IndexObject {
    document: Omit<Docuvision.Document, 'pages'>;
    page: Omit<Docuvision.Page, 'words'>;
    word: Docuvision.Word & {
        index: number;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
}

export interface AppProc {
    cpu: number;
    memory: number;
}

export interface AppInfo {
    monit: AppProc;
    name: string;
    pid: number;
    instanceId: number;
    pm_id: number;
}
