import { Docuvision } from 'interfaces';
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
