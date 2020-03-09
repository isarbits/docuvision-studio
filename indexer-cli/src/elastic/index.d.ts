import { ClientOptions, RequestEvent } from '@elastic/elasticsearch';
import { Docuvision } from '../docuvision';

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

export type Params<T> = Omit<T, 'index'> & { index?: string };

export interface SearchConfig extends ClientOptions {
    index?: string;
}

export type SearchResponse<T = any, TModel = SearchResult<T>> = RequestEvent<TModel>;

export interface SearchResult<T> {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
    hits: {
        total: number;
        hits: {
            _index: string;
            _type: string;
            _id: string;
            _source: T;
            sort: string[];
            _score?: string;
        }[];
        max_score?: any;
    };
}
