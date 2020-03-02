import React from 'react';
import { DocuvisionPageHit, DocuvisionPageResult, EsTypeOf } from '../../mappings/interfaces';

export class PageHitListItem extends React.Component<{
    bemBlocks: any;
    result: DocuvisionPageResult;
}> {
    public render() {
        const { bemBlocks, result } = this.props;
        const source: DocuvisionPageHit = { ...result._source, ...result.highlight };

        const onClick = div => div.currentTarget.toggleAttribute('expanded');
        const deleteDocument = (id: string) => () => {
            if (
                window.confirm(
                    'Are you sure you want to remove this document? This cannot be undone.',
                )
            ) {
                window
                    .fetch(`/v1/documents/${id}`, { method: 'DELETE' })
                    .then(() => window.location.reload())
                    .catch(console.error);
            }
        };

        const imagePath = ((result._source.id as EsTypeOf) as string).replace('_', '/') + '.jpg';

        return (
            <div
                className="document-search-result"
                style={{ position: 'relative', display: 'flex' }}
                id={result._id}
            >
                <div>
                    <div
                        className="img-container"
                        style={{
                            backgroundImage: `url("/generated-files/${imagePath}")`,
                        }}
                    />
                </div>
                <div
                    className={bemBlocks.item().mix(bemBlocks.container('item'))}
                    data-qa="hit"
                    onClick={onClick}
                >
                    <div className={bemBlocks.item('details')}>
                        <h2
                            className={bemBlocks.item('title')}
                            dangerouslySetInnerHTML={{
                                __html: source?.upload?.filename as EsTypeOf,
                            }}
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
                                    (source?.page.fullText &&
                                        (source?.page.fullText as EsTypeOf)) ||
                                    `<pre>${JSON.stringify((source as any)?.error, null, 2)}</pre>`,
                            }}
                        />
                    </div>
                </div>
                {result?._source?.document?.id && (
                    <button
                        className="delete-indexed"
                        onClick={deleteDocument(result._source.document.id as EsTypeOf)}
                    >
                        Delete
                    </button>
                )}
            </div>
        );
    }
}
