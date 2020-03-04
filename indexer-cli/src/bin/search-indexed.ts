import { RequestParams } from '@elastic/elasticsearch';
import { elastic } from 'config';
import { DocuvisionClient, Params, SearchResponse } from '../interfaces';
import '../lib/errors';
import { SearchManager } from '../elastic/search/search-manager';

const esClient = SearchManager.getClient({
    index: elastic.index,
    node: elastic.node,
});

export const search = async (queryString: string, paging?: Params<RequestParams.Search>): Promise<SearchResponse> => {
    const { body: exists } = await esClient.indicesExists();
    if (!exists) {
        console.error(`index '${esClient.defaultIndex}' not found`);
        console.error(`Either configure to use an existing index, or index files to the '${esClient.defaultIndex}' index`);
        console.error(`Try 'npm run search index --help' for more info`);
        process.exit(0);
    }

    const query = { ...paging };
    if (queryString) {
        query.body = {
            query: {
                query_string: {
                    query: queryString,
                },
            },
        };
    }

    const res = await esClient.search<{ document?: DocuvisionClient.Document; error: any }>({
        index: `${esClient.defaultIndex}_page`,
        ...query,
    });

    const { total, hits } = res.body.hits;
    hits.forEach(({ _source: { document, error } }) => console.log(JSON.stringify(error || document, null, 2)));
    console.log(`showing ${hits.length} of ${total} results`);

    return res;
};

export const dev = { esClient };
