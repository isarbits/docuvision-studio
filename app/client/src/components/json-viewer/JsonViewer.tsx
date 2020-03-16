import React from 'react';
import { JSONViewer, JSON } from './lib/json-viewer';
import './lib/json-viewer.css';

interface Props {
    json: JSON;
}

export class JsonViewer extends React.Component<Props> {
    public ref = React.createRef<HTMLPreElement>();

    componentWillUpdate() {
        if (!this?.ref?.current) {
            return null;
        }
        const jsonView = new JSONViewer(this.ref.current);
        jsonView.showJSON(this.props.json);
    }

    public render() {
        return <pre ref={this.ref}>Loading</pre>;
    }
}
