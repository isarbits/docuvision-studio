import { IPieChartOptions, IChartistData, ILineChartOptions } from 'chartist';
import 'chartist/dist/scss/chartist.scss';
import React from 'react';
import { default as ChartistGraph } from 'react-chartist';
import { subscribe } from '../../../net/socket';
import { EventBus } from '../../../net/event-bus';
import './queue-chart.scss';

interface QueueTrend {
    m: number;
    b: number;
}

interface QueueData {
    current: JobCounts;
    history: JobCounts[];
    rates: {
        active: QueueTrend[];
        completed: QueueTrend[];
        failed: QueueTrend[];
        delayed: QueueTrend[];
        waiting: QueueTrend[];
    };
}

interface JobCounts {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
}

interface State {
    chartData?: { [state: string]: IChartistData };
    pieData?: IChartistData;
    rates?: {
        active?: QueueTrend[];
        completed?: QueueTrend[];
        failed?: QueueTrend[];
        delayed?: QueueTrend[];
        waiting?: QueueTrend[];
    };
}

interface Props {
    label: string;
    historySeconds?: number;
    lineOptions?: ILineChartOptions;
    pieOptions?: IPieChartOptions;
}

export class QueueChart extends React.Component<Props, State> {
    public state: State = {};
    private socket: WebSocket = null as any;
    private stateToIndex = {
        active: 0,
        completed: 1,
        failed: 2,
        delayed: 3,
        waiting: 4,
    };
    private historyToIndex = {
        3600: 0,
        1800: 1,
        300: 2,
        60: 3,
    };

    constructor(props, state) {
        super(props, state);

        this.setupSubscriber = this.setupSubscriber.bind(this);
    }

    componentDidMount() {
        EventBus.on('queue-reconnect', this.setupSubscriber);
        this.setupSubscriber();
    }

    componentWillUnmount() {
        EventBus.off('queue-reconnect', this.setupSubscriber);
        this.socket && this.socket.close();
    }

    private setupSubscriber = () => {
        this.socket && this.socket.close();
        this.socket = subscribe(
            'queue-stats',
            (data) => this.convertToChart(data),
            (err, evnt) => {
                EventBus.emit('queue-disconnect', { err, evnt });
            },
        );
    };

    // private addRateToChart = (rate): number[] => {
    //     const length = this.props.historySeconds || 60;

    //     const m = rate.m;
    //     const b = rate.b;

    //     return Array.from(Array(length).keys()).map((x, _, a) => (m * x) + (a.length - b));
    // }

    private convertToChart = (data: QueueData) => {
        const { rates, history, current } = data;
        if (current === null) {
            return null;
        }

        const length = this.props.historySeconds || 60;

        let dataByStateName = history
            .slice(0, length)
            .reverse()
            .reduce((arrays, counts) => {
                Object.entries(counts).forEach(([key, value]) => {
                    const i = this.stateToIndex[key];
                    arrays[i] = [...(arrays[i] || []), value];
                });

                return arrays;
            }, [] as number[][]);

        const diff = length - history.length;
        if (diff > 0) {
            dataByStateName = dataByStateName.map((q) => [...Array(diff).fill(null), ...q]);
        }

        const chartData = {};
        const labels = Array.from(Array(length).keys());

        Object.keys(this.stateToIndex).forEach((state) => {
            chartData[state] = {
                labels,
                series: [
                    dataByStateName[this.stateToIndex[state]],
                    // this.addRateToChart(rates[state][this.historyToIndex[length]])
                ],
            };
        });

        const pieData = Object.entries(current).reduce(
            (pie, [name, value]) => {
                pie.labels.push(`${name} ${value}`);
                pie.series.push(value);
                return pie;
            },
            {
                labels: [] as string[],
                series: [] as number[],
            },
        );

        this.setState({ chartData, pieData, rates });
    };

    private renderPieLabels = () => {
        if (!this.state?.pieData?.labels) {
            return null;
        }
        const sorted = this.state.pieData.labels.sort(
            (a, b) => +b.split(' ')[1] - +a.split(' ')[1],
        ) as string[];

        return sorted.map((label, i) => <span key={i}>{label}</span>);
    };

    public render() {
        const { chartData, pieData, rates } = this.state;

        if (!chartData || !pieData || !rates) {
            return <p>No data</p>;
        }

        const getRate = (queue) => {
            const length = this.props.historySeconds || 60;
            return (queue[this.historyToIndex[length]].m || 0).toFixed(1);
        };

        const options: ILineChartOptions = this.props.lineOptions || {
            axisX: {
                showGrid: false,
                showLabel: false,
            },
            axisY: {
                onlyInteger: true,
            },
            showPoint: false,
            lineSmooth: false,
        };

        const pieOpts: IPieChartOptions = this.props.pieOptions || {
            showLabel: false,
            chartPadding: 0,
        };

        return (
            <section className="queue-chart">
                <div className="chart-container flex-column">
                    <label>Active</label>
                    <small>i/o rate: {getRate(rates.active)}</small>
                    <ChartistGraph type="Line" data={chartData.active} options={options} />
                </div>
                <div className="chart-container flex-column">
                    <label>Waiting</label>
                    <small>i/o rate: {getRate(rates.waiting)}</small>
                    <ChartistGraph type="Line" data={chartData.waiting} options={options} />
                </div>
                <div className="chart-container flex-column">
                    <label>Failed</label>
                    <small>i/o rate: {getRate(rates.failed)}</small>
                    <ChartistGraph type="Line" data={chartData.failed} options={options} />
                </div>
                <div className="chart-container flex-row">
                    <ChartistGraph type="Pie" data={pieData} options={pieOpts} />
                    <div className="labels">{this.renderPieLabels()}</div>
                </div>
            </section>
        );
    }
}
