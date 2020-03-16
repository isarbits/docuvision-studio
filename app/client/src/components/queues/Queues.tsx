import React from 'react';
import { QueueChart } from './chart/QueueChart';
import { QueueLogs } from './logs/QueueLogs';
import { EventBus } from '../../net/event-bus';
import './queues.scss';

interface State {
    seconds: number;
    disconnect: boolean;
}

export class Queues extends React.Component<{}, State> {
    public state = {
        seconds: 60,
        disconnect: false,
    };

    constructor(props, state) {
        super(props, state);

        this.disconnected = this.disconnected.bind(this);
    }

    componentDidMount() {
        EventBus.on('queue-disconnect', this.disconnected);
    }

    componentWillUnmount() {
        EventBus.off('queue-disconnect', this.disconnected);
    }

    private changeTime = (evnt: React.SyntheticEvent<HTMLSelectElement>) => {
        const seconds = Number(evnt?.currentTarget?.value) ?? 60;
        this.setState({ seconds });
    };

    private disconnected = () => {
        this.setState({ disconnect: true });
    };

    private emitReconnect = () => {
        this.setState({ disconnect: false });
        EventBus.emit('queue-reconnect');
    };

    public render() {
        return (
            <section className="queues">
                <h3>Jobs</h3>

                <div className="charts">
                    {this.state.disconnect && (
                        <div className="mb-2">
                            <span style={{ marginRight: '0.5rem' }}>Connection failed</span>
                            <button data-small onClick={this.emitReconnect}>
                                Reconnect
                            </button>
                        </div>
                    )}
                    <div className="flex-row">
                        <select defaultValue={this.state.seconds} onChange={this.changeTime}>
                            <option value={60}>Last minute</option>
                            <option value={60 * 5}>Last 5 minutes</option>
                            <option value={60 * 30}>Last 30 minutes</option>
                            <option value={60 * 60}>Last hour</option>
                        </select>
                    </div>
                    <br />
                    <br />

                    <QueueChart label="Active Jobs:" historySeconds={this.state.seconds} />
                </div>
                <QueueLogs />
            </section>
        );
    }
}
