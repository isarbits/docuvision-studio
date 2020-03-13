import React from 'react';
import { subscribe } from '../../../net/socket';
import { EventBus } from '../../../net/event-bus';
import './queue-logs.scss';

type LogTypes = 'completed' | 'failed' | 'error';

interface QueueLog {
    type: LogTypes;
    message: string;
    data: any;
}

interface State {
    logs: QueueLog[];
    disconnect: boolean;
}

interface Props {
    types?: string[];
    onDisconnect?: () => void;
}

export class QueueLogs extends React.Component<Props, State> {
    public state: State = {
        disconnect: false,
        logs: [],
    };

    private logRef = React.createRef<HTMLDivElement>();
    private dummyRef = React.createRef<HTMLDivElement>();

    private socket: WebSocket = null as any;

    componentDidMount() {
        EventBus.on('queue-reconnect', 'QueueLogs:componentDidMount', () => this.setupSubscriber());
        this.setupSubscriber();
    }

    componentDidUpdate() {
        this.autoScroll();
    }

    componentWillUnmount() {
        EventBus.off('queue-reconnect', 'QueueLogs:componentDidMount');
        this.socket && this.socket.close();
    }

    private setupSubscriber = () => {
        this.socket && this.socket.close();
        this.socket = subscribe(
            'queue-logs',
            data => {
                if (!this?.props?.types?.length || this.props.types.includes(data.type)) {
                    this.setState(p => ({ logs: [...p.logs, data] }));
                }
            },
            (err, evnt) => {
                if (typeof this?.props?.onDisconnect === 'function') {
                    return this.props.onDisconnect();
                }
                console.log(err, evnt);
            },
        );
        this.socket.onopen = () => this.setState({ disconnect: false });
    };

    private autoScroll = () => {
        const div = this?.logRef?.current;
        const dummy = this?.dummyRef?.current;
        if (!div || !dummy) {
            return;
        }

        if (div.scrollTop >= div.scrollHeight - div.offsetHeight - 200) {
            dummy.scrollIntoView();
        }
    };

    private renderLogLines = () => {
        const { logs } = this.state;

        if (!logs?.length) {
            return <p>Nothing yet</p>;
        }

        return logs.map((log, index) => <p key={`${index}`}>{log.message}</p>);
    };

    public render() {
        return (
            <section className="queue-logs">
                <h3>Logs:</h3>
                <div className="logs" ref={this.logRef}>
                    {this.renderLogLines()}
                    <div ref={this.dummyRef} />
                </div>
            </section>
        );
    }
}
