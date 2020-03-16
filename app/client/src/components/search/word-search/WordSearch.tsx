import React from 'react';
import { ReactiveBase, CategorySearch } from '@appbaseio/reactivesearch';
import { elasticHost } from '../../../config';

export class WordSearch extends React.Component<{}> {
    public render() {
        return (
            <ReactiveBase app="docuvision_word" url={elasticHost} themePreset="dark">
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
            </ReactiveBase>
        );
    }
}
