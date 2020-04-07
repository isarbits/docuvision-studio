import { PageHit } from '../page-search/PageHit';
import {
    DataSearch,
    MultiList,
    ReactiveBase,
    ReactiveList,
    SelectedFilters,
} from '@appbaseio/reactivesearch';
import React from 'react';
import { elasticHost } from '../../../config';

import './search-base.scss';
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
    index?: 'docuvision' | 'docuvision_page' | 'docuvision_word';
    onQuery?: (query: any) => void;
    changeView?: (name: string) => void;
}

interface State {
    view: string;
}

export class SearchBase extends React.Component<Props, State> {
    public state: State = {
        view: 'page_list',
    };

    private defaultRenderPages = (res: RenderResults) => {
        if (res.loading) {
            return null;
        }
        if (res.error) {
            return `Error fetching data: ${res.error.message} ${JSON.stringify(res.error)}`;
        }

        return (res.data || []).map(page => <PageHit key={page._id} page={page} />) || null;
    };

    private changeView = (name: string) => () => {
        this.setState({ view: name });
        if (typeof this.props.changeView === 'function') {
            this.props.changeView(name);
        }
    };

    public render() {
        return (
            <>
                <ReactiveBase
                    app="docuvision_page"
                    url={elasticHost}
                    className="page-search-content-container flex"
                    transformRequest={e => {
                        if (typeof this?.props?.onQuery === 'function') {
                            this.props.onQuery(e.body);
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
                            componentId="FilenameComponent"
                            dataField="document.filename.keyword"
                            renderNoResults={() => <p>No Results Found!</p>}
                            title="Filename"
                            react={{ and: 'QueryComponent' }}
                        />
                    </div>
                    <div className="page-search-content flex-column flex-grow">
                        <div className="page-search-header flex-column">
                            <DataSearch
                                componentId="QueryComponent"
                                placeholder="Search pages..."
                                dataField={['document.filename', 'page.words.text']}
                                react={{ and: 'FilenameComponent' }}
                            />
                        </div>

                        {typeof this.props.changeView === 'function' && (
                            <div className="app-selector pa-2 border-b-grey-light flex">
                                <button
                                    className="small clear mr-2 px-1 clickable"
                                    data-selected={this.state.view === 'page_list'}
                                    onClick={this.changeView('page_list')}
                                >
                                    Page List
                                </button>
                                <button
                                    className="small clear mr-2 px-1 clickable"
                                    data-selected={this.state.view === 'visualize'}
                                    onClick={this.changeView('visualize')}
                                >
                                    Visualize
                                </button>
                            </div>
                        )}

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
                                react={{ and: ['QueryComponent', 'FilenameComponent'] }}
                                renderNoResults={() => <div className="pa-2"> Nothing found </div>}
                                renderResultStats={stats => (
                                    <div className="stats-summary pa-2 fg-grey text-size-3">
                                        {stats.numberOfResults} results ({stats.time} ms)
                                    </div>
                                )}
                                render={
                                    this.props.children
                                        ? () => this.props.children
                                        : this.defaultRenderPages
                                }
                            />
                        </div>
                    </div>
                </ReactiveBase>
            </>
        );
    }
}
