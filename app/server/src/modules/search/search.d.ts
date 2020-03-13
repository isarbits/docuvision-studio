import { ClientOptions, RequestEvent } from '@elastic/elasticsearch';

import Docuvision from '../docuvision/docuvision.d';

declare namespace Search {
    interface Tree {
        [key: string]: Tree;
    }

    interface IndexObject {
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

    interface IndexDocument extends IndexObject {
        document: Docuvision.Document;
    }

    interface IndexPage extends IndexObject {
        document: Omit<Docuvision.Document, 'pages'>;
        page: Docuvision.Page;
    }

    interface IndexWord extends IndexObject {
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

    type Params<T> = Omit<T, 'index'> & { index?: string };

    interface SearchConfig extends ClientOptions {
        index?: string;
    }

    type SearchResponse<T = any, TModel = SearchResult<T>> = RequestEvent<TModel>;

    interface SearchResult<T> {
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
}

export = Search;
