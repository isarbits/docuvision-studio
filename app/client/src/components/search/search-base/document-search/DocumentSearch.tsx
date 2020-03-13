import React from 'react';
import { ReactiveBase, CategorySearch } from '@appbaseio/reactivesearch';
import { elasticHost } from '../../../../config';

export class DocumentSearch extends React.Component<{}> {
    public render() {
        return (
            <ReactiveBase app="docuvision" url={elasticHost} themePreset="dark">
                <CategorySearch
                    componentId="SearchSensor"
                    dataField={['group_venue', 'group_city']}
                    categoryField="group_topics"
                />
                <CategorySearch
                    componentId="searchbox"
                    dataField="model"
                    categoryField="brand.keyword"
                    placeholder="Search for cars"
                />
                {/*<SingleRange
                componentId="ratingsfilter"
                dataField="rating"
                title="Filter by ratings"
                data={[
                    { start: 4, end: 5, label: '4 stars and up' },
                    { start: 3, end: 5, label: '3 stars and up' },
                ]}
                defaultValue="4 stars and up"
            />*/}
            </ReactiveBase>
        );
    }
}
