import { RequestParams } from '@elastic/elasticsearch';
import { StudioClient } from '../api/client';
import { Params, SearchResponse } from '../interfaces';
import '../lib/errors';

const studioClient = new StudioClient();

export const search = async (queryString: string, paging?: Params<RequestParams.Search>): Promise<SearchResponse> => {
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

    const res = await studioClient.search('docuvision_page', query);

    const { total, hits } = res.body.hits;
    hits.forEach(({ _source: { document, error } }) => console.log(JSON.stringify(error || document, null, 2)));
    console.log(`showing ${hits.length} of ${total} results`);

    return res;
};
