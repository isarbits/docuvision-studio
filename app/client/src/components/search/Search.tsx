import React from 'react';
import { WordCorrelation } from '../aggregators/word-correlation/WordCorrelation';
import { SearchBase } from './search-base/SearchBase';

interface State {
    view?: string;
    query?: string;
}

export class Search extends React.Component<{}, State> {
    public state: any = { query: null };

    public setBaseQuery = (body: any) => {
        // get the ndjson body and replace page with word index
        const getLastQuery = (lastQuery, json) => {
            if (/^\{"query/.test(json)) {
                return json.replace(/"page\.words\.text"/g, '"word.text"');
            }
            return lastQuery;
        };

        const filters = body.split('\n').reduce(getLastQuery, '');

        if (!filters) {
            return this.setState({ query: null });
        }

        const query = JSON.parse(filters);

        query.size = 0;
        query.aggregations = {
            documents: {
                terms: {
                    field: 'document.filename.keyword',
                },
                aggregations: {
                    co_occurances: {
                        significant_text: {
                            field: 'word.text',
                            filter_duplicate_text: true,
                            min_doc_count: 1,
                        },
                    },
                },
            },
        };

        this.setState({ query });
    };

    private renderApp = () => {
        const { query, view } = this.state;

        if (view !== 'visualize') {
            return null;
        }

        return <WordCorrelation query={query} />;
    };

    private changeViewHandler = (name: string) => this.setState({ view: name });

    public render() {
        return (
            <>
                <SearchBase onQuery={this.setBaseQuery} changeView={this.changeViewHandler}>
                    {this.renderApp()}
                </SearchBase>
            </>
        );
    }
}
