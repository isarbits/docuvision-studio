import React from 'react';
import {
    ActionBar,
    ActionBarRow,
    DynamicRangeFilter,
    GroupedSelectedFilters,
    HitsStats,
    Layout,
    LayoutBody,
    LayoutResults,
    NoHits,
    Pagination,
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
import { baseUrl, defaultIndex } from '../../config';
import { PageHitGridItem } from './PageHitGridItem/PageHitGridItem';
import { PageHitListItem } from './PageHitListItem/PageHitListItem';
import './search.scss';

export class Search extends React.Component<{}> {
    public state = {};

    private searchkit = new SearchkitManager(`${baseUrl}/search/${defaultIndex}`);

    public render() {
        return (
            <SearchkitProvider searchkit={this.searchkit}>
                <Layout>
                    <TopBar>
                        <div className="my-logo">Docuvision Studio</div>
                        <SearchBox
                            autofocus={true}
                            searchOnChange={true}
                            placeholder="Search pages"
                            prefixQueryFields={[
                                'document.filename^1',
                                'document.upload.path^1',
                                'document.pages.fullText^2',
                                'document.pages.words^2',
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
                            <RefinementListFilter
                                id="filename"
                                title="Filename"
                                field="document.filename.keyword"
                                size={10}
                            />
                            <DynamicRangeFilter
                                field="document.pageCount"
                                showHistogram={true}
                                id="pageCount"
                                title="Page Count"
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
                                highlightFields={[
                                    'document.filename',
                                    'document.pages.fullText',
                                    'document.pages.words',
                                    'document.upload.path',
                                ]}
                                hitComponents={[
                                    {
                                        key: 'list',
                                        title: 'List',
                                        itemComponent: PageHitListItem,
                                        defaultOption: true,
                                    },
                                    {
                                        key: 'grid',
                                        title: 'Grid',
                                        itemComponent: PageHitGridItem,
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
