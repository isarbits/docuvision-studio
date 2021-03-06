import { RequestParams } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

const WRITE_POOL_SIZE = 150; // default is 200

@Injectable()
export class SearchService {
    private indexWriteQueue: { [index: string]: Promise<any>[] } = {};

    constructor(private readonly elasticsearchService: ElasticsearchService) {
        this.initializeIndices();
    }

    search<T = any>(params: RequestParams.Search<T>) {
        return this.elasticsearchService.search(params);
    }

    count(params: RequestParams.Count) {
        return this.elasticsearchService.count(params);
    }

    bulk(params: RequestParams.Bulk) {
        return this.bufferedWrite(params.index, () => this.elasticsearchService.bulk(params));
    }

    deleteByQuery(params: RequestParams.DeleteByQuery) {
        return this.elasticsearchService.deleteByQuery(params);
    }

    indexExists(params: RequestParams.IndicesExists) {
        return this.elasticsearchService.indices.exists(params);
    }

    exists(params: RequestParams.Exists) {
        return this.elasticsearchService.exists(params);
    }

    index(params: RequestParams.Index) {
        return this.bufferedWrite(params.index, () => this.elasticsearchService.index(params));
    }

    indicesCreate(params: RequestParams.IndicesCreate) {
        return this.bufferedWrite(params.index, () => this.elasticsearchService.indices.create(params));
    }

    countWriteQueue(): Promise<number> {
        return this.elasticsearchService.cat
            .thread_pool({ thread_pool_patterns: 'write' }) // eslint-disable-line @typescript-eslint/camelcase
            .then(({ body }) => body.split('\n').reduce((total, node) => total + +(node.split(' ')[3] ?? 0), 0));
    }

    private async bufferedWrite<T = any>(index: string, req: () => Promise<T>): Promise<T> {
        if (this.indexWriteQueue[index]?.length >= WRITE_POOL_SIZE) {
            await Promise.all(this.indexWriteQueue[index].splice(0, this.indexWriteQueue[index].length));
        }

        const launched = req();
        this.indexWriteQueue[index] = this.indexWriteQueue[index] || [];
        this.indexWriteQueue[index].push(launched);

        return launched;
    }

    private initializeIndices(): Promise<any> {
        const indices = [{ index: 'logs' }, { index: 'docuvision' }, { index: 'docuvision_page' }, { index: 'docuvision_word' }];

        const createFromSettings = (data) => this.elasticsearchService.indices.create(data).catch(() => null);

        return Promise.all(indices.map(createFromSettings));
    }
}
