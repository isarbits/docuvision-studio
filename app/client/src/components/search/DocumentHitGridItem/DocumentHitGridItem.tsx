import React from 'react';

export class DocumentHitGridItem extends React.Component<{ bemBlocks: any; result: any }> {
    public render() {
        const { bemBlocks, result } = this.props;
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
    }
}
