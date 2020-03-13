import { DataSearch, MultiList, ReactiveBase, ReactiveList, SelectedFilters } from '@appbaseio/reactivesearch';
import React from 'react';
import { elasticHost } from '../../../config';

import './search-base.scss';
import { PageHit } from './page-search/PageHit';
import { Hit, Search } from '../../../interfaces/index.d';

type RenderResults = {
    loading?: boolean;
    error?: any;
    data?: Hit<Search.IndexPage>[];
    streamData?: Hit<Search.IndexPage>[];
    promotedData?: Hit<Search.IndexPage>[];
    rawData?: Hit<Search.IndexPage>[];
};

interface Props {
    children?: (res: RenderResults) => React.ReactNode;
    index?: 'docuvision' | 'docuvision_page' | 'docuvision_word';
    onQuery?: (query: any) => void;
}

export class SearchBase extends React.Component<Props, any> {
    private defaultRenderPages = (res: RenderResults) => {
        if (res.loading) {
            return null;
        }
        if (res.error) {
            return res.error;
        }

        return (res.data || []).map(page => <PageHit key={page._id} page={page} />) || null;
    };

    public render() {
        return (
            <>
                <ReactiveBase
                    app="docuvision_page"
                    url={elasticHost}
                    className="page-search-content-container flex"
                    transformRequest={(e) => {
                        if (typeof this?.props?.onQuery === 'function') {
                            // get the ndjson body and replace page with word index
                            const query = e.body.split('\n')[1].replace(/"page\.words\.text"/g, '"word.text"');
                            this.props.onQuery(JSON.parse(query));
                        }
                        return e;
                    }}
                >
                    <div
                        className="page-search-side pa-2"
                        style={{ minWidth: '300px', borderRight: '1px solid grey' }}
                    >
                        <h3 className="my-3 border-b-grey-light">Filters</h3>
                        <MultiList
                            className="multi-list"
                            showSearch={false}
                            showCheckbox={true}
                            componentId="Filename"
                            dataField="document.filename.keyword"
                            renderNoResults={() => <p>No Results Found!</p>}
                            title="Filename"
                            react={{ and: 'SearchBarSensor' }}
                        />
                    </div>
                    <div className="page-search-content flex-column flex-grow">
                        <div className="page-search-header flex-column">
                            <DataSearch
                                componentId="Query"
                                placeholder="Search pages..."
                                dataField={['document.filename', 'page.words.text']}
                            />
                        </div>

                        <div className="app-selector pa-2 border-b-grey-light flex ">
                            <span className="mr-2">Apps:</span>
                            <div
                                className="flex-grow flex-justify-space-around"
                                style={{ maxWidth: '960px' }}
                            >
                                {[...Array(5).keys()].map((name, i) => {
                                    return (
                                        <strong key={i} className="px-1 underline clickable">
                                            {`${name}`.repeat(4)}
                                        </strong>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ minHeight: '35px' }} className="border-b-grey">
                            <SelectedFilters showClearAll={true} clearAllLabel="Clear filters" />
                        </div>

                        <div className="relative flex-grow">
                            <ReactiveList
                                className="reactive-list"
                                componentId="SearchResult"
                                dataField="page"
                                loader="Loading Results.."
                                showResultStats={true}
                                react={{ and: ['SearchBarSensor', 'FilenameSensor'] }}
                                renderNoResults={() => <div className="pa-2"> Nothing found </div>}
                                onData={console.info}
                                renderResultStats={stats => (
                                    <div className="stats-summary pa-2 fg-grey text-size-3">
                                        {stats.numberOfResults} results ({stats.time} ms)
                                    </div>
                                )}
                                render={this.props.children || this.defaultRenderPages}
                            />
                        </div>
                    </div>
                </ReactiveBase>
            </>
        );
    }
}
