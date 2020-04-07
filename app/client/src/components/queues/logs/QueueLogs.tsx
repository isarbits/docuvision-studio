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
    public state: State = { disconnect: false, logs: [] };
    private logRef = React.createRef<HTMLDivElement>();
    private dummyRef = React.createRef<HTMLDivElement>();
    private socket: WebSocket = null as any;

    constructor(props, state) {
        super(props, state);

        this.setupSubscriber = this.setupSubscriber.bind(this);
    }

    componentDidMount() {
        EventBus.on('queue-reconnect', this.setupSubscriber);
        this.setupSubscriber();
    }

    componentDidUpdate() {
        this.autoScroll();
    }

    componentWillUnmount() {
        EventBus.off('queue-reconnect', this.setupSubscriber);
        this.socket && this.socket.close();
    }

    private setupSubscriber = () => {
        this.socket && this.socket.close();
        this.socket = subscribe(
            'queue-logs',
            data => {
                if (!this?.props?.types?.length || this.props.types.includes(data.type)) {
                    this.setState(p => ({ logs: [...p.logs, data].slice(0, 100) }));
                }
            },
            (err, evnt) => {
                EventBus.emit('queue-disconnect', { err, evnt });
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

        if (div.scrollTop >= div.scrollHeight - div.offsetHeight - 180) {
            dummy.scrollIntoView();
        }
    };

    private renderLogLines = () => {
        const { logs } = this.state;

        if (!logs?.length) {
            return <p>Nothing yet</p>;
        }

        const toggleData = (data: any) => (event: React.SyntheticEvent<HTMLSpanElement>) => {
            const logDiv = event?.currentTarget?.parentElement;
            if (!logDiv) {
                return;
            }
            if (logDiv.classList.contains('is-visible')) {
                logDiv.querySelector('.data').remove();
            } else {
                const pre = document.createElement('pre');
                pre.classList.add('ml-3', 'my-1', 'data');
                pre.innerText = JSON.stringify(data, null, 2);
                logDiv.appendChild(pre);
            }
            logDiv.classList.toggle('is-visible');
        };

        return logs.map((log, index) => (
            <div className="entry" key={`${index}`}>
                <span onClick={toggleData(log.data)}>{log.message}</span>
            </div>
        ));
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
