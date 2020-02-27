import React, { Component } from 'react';
import {
    ActionBar,
    ActionBarRow,
    DynamicRangeFilter,
    GroupedSelectedFilters,
    // HierarchicalMenuFilter,
    HitsStats,
    // InputFilter,
    Layout,
    LayoutBody,
    LayoutResults,
    NoHits,
    // NumericRefinementListFilter,
    Pagination,
    // RangeFilter,
    RefinementListFilter,
    ResetFilters,
    SearchBox,
    SearchkitManager,
    SearchkitProvider,
    SideBar,
    SortingSelector,
    TopBar,
    ViewSwitcherHits,
    ViewSwitcherToggle,
} from 'searchkit';
import './index.scss';
import { DocuvisionHit, DocuvisionResult, EsTypeOf } from './mappings/interfaces';

const host = '/';
const searchkit = new SearchkitManager(host);

const DocHitsGridItem = (props: any) => {
    const { bemBlocks, result } = props;
    let url = 'http://www.imdb.com/title/' + result._source.imdbId;
    const source = { ...result._source, ...result.highlight };
    return (
        <div className={bemBlocks.item().mix(bemBlocks.container('item'))} data-qa="hit">
            <a href={url} target="_blank" rel="noopener noreferrer">
                <div
                    data-qa="title"
                    className={bemBlocks.item('title')}
                    dangerouslySetInnerHTML={{ __html: source.title }}
                ></div>
            </a>
        </div>
    );
};

const DocHitsListItem = (props: { bemBlocks: any; result: DocuvisionResult }) => {
    const { bemBlocks, result } = props;
    const source: DocuvisionHit = { ...result._source, ...result.highlight };

    const onClick = div => div.currentTarget.toggleAttribute('expanded');
    const deleteDocument = (id: string) => () => {
        if (
            window.confirm('Are you sure you want to remove this document? This cannot be undone.')
        ) {
            window
                .fetch(`/_doc/${id}`, { method: 'DELETE' })
                .then(() => window.location.reload())
                .catch(console.error);
        }
    };

    return (
        <div style={{ position: 'relative' }} id={result._id}>
            <div
                className={bemBlocks.item().mix(bemBlocks.container('item'))}
                data-qa="hit"
                onClick={onClick}
            >
                <div className={bemBlocks.item('details')}>
                    <h2
                        className={bemBlocks.item('title')}
                        dangerouslySetInnerHTML={{ __html: source?.upload?.filename as EsTypeOf }}
                    />
                    <h3 className={bemBlocks.item('subtitle')}>
                        <strong style={{ color: source?.document?.status ? 'green' : 'red' }}>
                            {source?.document?.status || 'failed'}
                        </strong>
                        &nbsp;
                        <span>{source?.createdAt}</span>&nbsp;&nbsp;
                        <span>{source.upload.folder}</span>&nbsp;|&nbsp;
                        <span>{source.upload.size} B</span>
                        {source?.document?.pageCount ? (
                            <>
                                &nbsp;|&nbsp;
                                <span>
                                    {source.document.pageCount} page
                                    {+source.document.pageCount !== 1 ? 's' : null}
                                </span>
                            </>
                        ) : null}
                    </h3>

                    <div
                        className={bemBlocks.item('text')}
                        dangerouslySetInnerHTML={{
                            __html:
                                ((source?.document?.pages as any)?.length && source?.document?.pages[0].fullText) ||
                                `<pre>${JSON.stringify(source?.error, null, 2)}</pre>`,
                        }}
                    />
                </div>
            </div>
            <button
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    position: 'absolute',
                    bottom: '40px',
                    right: 0,
                    zIndex: 2,
                    cursor: 'pointer',
                }}
                onClick={deleteDocument(result._id)}
            >
                Delete
            </button>
        </div>
    );
};

class App extends Component {
    public state = { rerender: false };

    render() {
        return (
            <SearchkitProvider searchkit={searchkit}>
                <Layout>
                    <TopBar>
                        <div className="my-logo">Docuvision Studio</div>
                        <SearchBox
                            autofocus={true}
                            searchOnChange={true}
                            prefixQueryFields={[
                                'document.filename^1',
                                'document.pages.fullText^2',
                                'document.pages.words',
                            ]}
                        />
                    </TopBar>

                    <LayoutBody>
                        <SideBar>
                            <RefinementListFilter
                                id="extensions"
                                title="Extensions"
                                field="upload.extension.keyword"
                                size={10}
                            />
                            <RefinementListFilter
                                id="status"
                                title="Status"
                                field="document.status.keyword"
                                size={10}
                            />
                            <DynamicRangeFilter
                                field="document.pageCount"
                                showHistogram={true}
                                id="pageCount"
                                title="Pages"
                            />
                        </SideBar>
                        <LayoutResults>
                            <ActionBar>
                                <ActionBarRow>
                                    <HitsStats
                                        translations={{
                                            'hitstats.results_found': '{hitCount} results found',
                                        }}
                                    />
                                    <ViewSwitcherToggle />
                                    <SortingSelector
                                        options={[
                                            { label: 'Relevance', field: '_score', order: 'desc' },
                                            {
                                                label: 'Newest',
                                                field: 'createdAt',
                                                order: 'desc',
                                            },
                                            {
                                                label: 'Oldest',
                                                field: 'createdAt',
                                                order: 'asc',
                                            },
                                        ]}
                                    />
                                </ActionBarRow>

                                <ActionBarRow>
                                    <GroupedSelectedFilters />
                                    <ResetFilters />
                                </ActionBarRow>
                            </ActionBar>
                            <ViewSwitcherHits
                                hitsPerPage={12}
                                highlightFields={['document.filename', 'document.pages.fullText', 'document.pages.words']}
                                hitComponents={[
                                    {
                                        key: 'list',
                                        title: 'List',
                                        itemComponent: DocHitsListItem,
                                        defaultOption: true,
                                    },
                                    {
                                        key: 'grid',
                                        title: 'Grid',
                                        itemComponent: DocHitsGridItem,
                                    },
                                ]}
                                scrollTo="body"
                            />
                            <NoHits suggestionsField={'id'} />
                            <Pagination showNumbers={true} />
                        </LayoutResults>
                    </LayoutBody>
                </Layout>
            </SearchkitProvider>
        );
    }
}

export default App;
