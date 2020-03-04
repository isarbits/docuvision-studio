import { ClientOptions, RequestEvent } from '@elastic/elasticsearch';

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
