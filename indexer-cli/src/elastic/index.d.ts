import { DocuvisionClient } from 'interfaces';
export * from './search';

export interface Tree {
    [key: string]: Tree;
}

export interface IndexObject {
    id: string;
    createdAt: Date;
    error: any;
    processingTime: number;
    upload: {
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
    document: DocuvisionClient.Document;
}

export interface IndexPage extends IndexObject {
    document: Omit<DocuvisionClient.Document, 'pages'>;
    page: DocuvisionClient.Page;
}

export interface IndexWord extends IndexObject {
    document: Omit<DocuvisionClient.Document, 'pages'>;
    page: Omit<DocuvisionClient.Page, 'words'>;
    word: DocuvisionClient.Word & {
        index: number;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
    };
}
