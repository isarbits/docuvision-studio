import React from 'react';
import { SearchBase } from './search-base/SearchBase';

export class Search extends React.Component<{}> {
    // renderAggregateApp = (body: any) => {
    //     // get the ndjson body and replace page with word index
    //     const query = JSON.parse(body.split('\n')[1].replace(/"page\.words\.text"/g, '"word.text"'));

    //     // https://observablehq.com/@xianwu/simple-force-directed-graph-network-graph
    //     query.aggregations = {
    //         my_sample: {
    //             sampler: {
    //                 shard_size: 100,
    //             },
    //             aggregations: {
    //                 keywords: {
    //                     significant_text: { field: 'word.text' },
    //                 },
    //             },
    //         },
    //     };
    //     console.log(JSON.stringify(query));
    // };

    public render() {
        // return <SearchBase onQuery={this.renderAggregateApp} />;
        return <SearchBase />;
    }
}
