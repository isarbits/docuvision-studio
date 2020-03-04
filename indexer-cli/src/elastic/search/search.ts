import { Client, RequestParams } from '@elastic/elasticsearch';
import { Params, SearchConfig, SearchResponse } from './search.d';

export class Search<TModel = any> {
    public defaultIndex: string;
    public client: Client;
    public writeQueue: Promise<any>[] = [];

    constructor(config: SearchConfig) {
        const { index, ...clientConfig } = config;
        this.client = new Client(clientConfig);
        this.defaultIndex = index;
    }

    public count(params?: Params<RequestParams.Count>): Promise<{ body: { count: number } }> {
        return this.client.count({ index: this.defaultIndex, ...params });
    }

    public bulk<T = TModel>(params: Params<RequestParams.Bulk>): Promise<SearchResponse<T>> {
        const req = this.client.bulk.bind(this.client, { index: this.defaultIndex, ...params });
        return this.bufferedWrite(req);
    }

    public create<T = TModel>(params: Params<RequestParams.Create>): Promise<SearchResponse<T>> {
        const req = this.client.create.bind(this.client, { index: this.defaultIndex, ...params });
        return this.bufferedWrite(req);
    }

    public delete(params: Params<RequestParams.Delete>): Promise<SearchResponse> {
        return this.client.delete({ index: this.defaultIndex, ...params });
    }

    public deleteByQuery(params: Params<RequestParams.DeleteByQuery>): Promise<SearchResponse> {
        return this.client.deleteByQuery({ index: this.defaultIndex, ...params });
    }

    public exists(params: Params<RequestParams.Exists>): Promise<SearchResponse<boolean>> {
        return this.client.exists({ index: this.defaultIndex, ...params });
    }

    public update<T = TModel>(params: Params<RequestParams.Update>): Promise<SearchResponse<T>> {
        return this.client.update({ index: this.defaultIndex, ...params });
    }

    public updateByQuery<T = TModel>(params?: Params<RequestParams.UpdateByQuery>): Promise<SearchResponse<T>> {
        return this.client.updateByQuery({ index: this.defaultIndex, ...params });
    }

    public index<T = TModel>(params: Params<RequestParams.Index>): Promise<SearchResponse<T>> {
        const req = this.client.index.bind(this.client, { index: this.defaultIndex, ...params });
        return this.bufferedWrite(req);
    }

    public search<T = TModel>(params?: Params<RequestParams.Search>): Promise<SearchResponse<T>> {
        return this.client.search({ index: this.defaultIndex, ...params });
    }

    public indicesClose(params?: Params<RequestParams.IndicesClose>): Promise<SearchResponse> {
        return this.client.indices.close({ index: this.defaultIndex, ...params });
    }

    public indicesCreate<T = TModel>(params?: RequestParams.IndicesCreate): Promise<SearchResponse<T>> {
        return this.client.indices.create(params);
    }

    public indicesDelete(params?: Params<RequestParams.IndicesDelete>): Promise<SearchResponse> {
        return this.client.indices.delete({ index: this.defaultIndex, ...params });
    }

    public indicesDeleteAlias(params: Params<RequestParams.IndicesDeleteAlias>): Promise<SearchResponse> {
        return this.client.indices.deleteAlias({ index: this.defaultIndex, ...params });
    }

    public indicesExists(params?: Params<RequestParams.IndicesExists>): Promise<SearchResponse<boolean>> {
        return this.client.indices.exists({ index: this.defaultIndex, ...params });
    }

    public indicesExistsAlias(params: Params<RequestParams.IndicesExistsAlias>): Promise<SearchResponse<boolean>> {
        return this.client.indices.existsAlias({ index: this.defaultIndex, ...params });
    }

    public indicesGet(params?: Params<RequestParams.IndicesGet>): Promise<SearchResponse> {
        return this.client.indices.get({ index: this.defaultIndex, ...params });
    }

    public indicesGetAlias(params?: Params<RequestParams.IndicesGetAlias>): Promise<SearchResponse> {
        return this.client.indices.getAlias({ index: this.defaultIndex, ...params });
    }

    public indicesGetMapping(params?: Params<RequestParams.IndicesGetMapping>): Promise<SearchResponse> {
        return this.client.indices.getMapping({ index: this.defaultIndex, ...params });
    }

    public indicesGetSettings(params?: Params<RequestParams.IndicesGetSettings>): Promise<SearchResponse> {
        return this.client.indices.getSettings({ index: this.defaultIndex, ...params });
    }

    public indicesOpen(params?: Params<RequestParams.IndicesOpen>): Promise<SearchResponse> {
        return this.client.indices.open({ index: this.defaultIndex, ...params });
    }

    public indicesPutAlias<T = TModel>(params: Params<RequestParams.IndicesPutAlias>): Promise<SearchResponse<T>> {
        return this.client.indices.putAlias({ index: this.defaultIndex, ...params });
    }

    public indicesPutMapping<T = TModel>(params: Params<RequestParams.IndicesPutMapping>): Promise<SearchResponse<T>> {
        return this.client.indices.putMapping({ index: this.defaultIndex, ...params });
    }

    public indicesPutSettings<T = TModel>(params: Params<RequestParams.IndicesPutSettings>): Promise<SearchResponse<T>> {
        return this.client.indices.putSettings({ index: this.defaultIndex, ...params });
    }

    public indicesRefresh(params?: Params<RequestParams.IndicesRefresh>): Promise<SearchResponse> {
        return this.client.indices.refresh({ index: this.defaultIndex, ...params });
    }

    public indicesReloadSearchAnalyzers(params?: Params<RequestParams.IndicesReloadSearchAnalyzers>): Promise<SearchResponse> {
        return this.client.indices.reloadSearchAnalyzers({ index: this.defaultIndex, ...params });
    }

    public indicesUpdateAliases<T = TModel>(params: Params<RequestParams.IndicesUpdateAliases>): Promise<SearchResponse<T>> {
        return this.client.indices.updateAliases({ index: this.defaultIndex, ...params });
    }

    private async bufferedWrite<T = any>(req: () => Promise<T>): Promise<T> {
        if (this.writeQueue.length >= 50) {
            await Promise.all(this.writeQueue.splice(0, 100));
        }
        const launched = req();
        this.writeQueue.push(launched);
        return launched;
    }
}
