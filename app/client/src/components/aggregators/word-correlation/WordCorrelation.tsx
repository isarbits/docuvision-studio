import React from 'react';
import './word-correlation.scss';
import { createNode, Dataset } from './word-correlation';
import { elasticHost } from '../../../config';

type Query = string;

interface Props {
    query: Query;
}

interface State {
    data: Dataset;
}

export class WordCorrelation extends React.Component<Props, State> {
    public state: State = { data: null };
    public container = React.createRef<HTMLDivElement>();

    public componentDidMount() {
        if (this.container.current) {
            this.rebuildGraph();
        }
    }

    public componentDidUpdate(props) {
        if (props.query !== this.props.query) {
            this.rebuildGraph();
        }
    }

    private rebuildGraph = () => {
        fetch(`${elasticHost}/docuvision_word/_search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.props.query),
        })
            .then((response: Response) => {
                if (response.status < 200 || response.status >= 300) {
                    return response.json().then(res => console.error(res));
                }
                response.json().then(results => {
                    const data: Dataset = { nodes: [{ id: 'query', group: 0 }], links: [] };

                    const bucketMax = results.aggregations.documents.buckets.reduce(
                        (a, b) =>
                            Math.max(
                                a,
                                b.co_occurances.buckets.reduce(
                                    (sa, sb) => Math.max(sa, sb.doc_count),
                                    1,
                                ),
                            ),
                        1,
                    );

                    results.aggregations.documents.buckets.forEach((bucket, index) => {
                        const filename = bucket.key;

                        data.nodes.push({ id: filename, group: 0 });
                        data.links.push({ source: 'query', target: filename, value: 1 });

                        bucket.co_occurances.buckets.forEach(({ key, doc_count }) => {
                            const nodeSize = Math.round(5 + 15 * (doc_count / bucketMax));
                            const groupId = `${index + 1}_${key}`;

                            data.nodes.push({
                                name: key,
                                id: groupId,
                                group: index + 1,
                                value: nodeSize,
                            });

                            data.links.push({
                                source: filename,
                                target: groupId,
                                value: doc_count,
                            });
                        });
                    });

                    this.setState({ data });
                    createNode(this.container.current, data);
                });
            })
            .catch(console.error);
    };

    public render() {
        return <div id="d3WordCorrelation" ref={this.container}></div>;
    }
}
