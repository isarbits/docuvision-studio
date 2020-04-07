import { InjectQueue } from '@nestjs/bull';
import { Inject, NotFoundException, Optional } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobCounts, JobOptions, JobStatusClean, Queue } from 'bull';

import { findLineByLeastSquares } from '../../providers/linear-best-fit';
import { GeneratorService } from '../../shared/generator/generator.service';
import { EventsService } from '../events/events.service';

export const DISABLE_QUEUE_STATS = 'DISABLE_QUEUE_STATS';
const HISTORY_SECONDS = 60 * 60;

interface TrendLine {
    m: number;
    b: number;
}

export const RateIntervals = {
    ONE_HOUR: 0,
    HALF_HOUR: 1,
    FIVE_MINS: 2,
    ONE_MINUTE: 3,
};

export interface QueueInfo {
    current: JobCounts;
    history?: JobCounts[];
    rates: {
        completed: TrendLine[];
        waiting: TrendLine[];
        active: TrendLine[];
        delayed: TrendLine[];
        failed: TrendLine[];
    };
}

export class QueuesService {
    constructor(
        @InjectQueue('processing') private readonly processingQueue: Queue,
        @InjectQueue('messages') private readonly messagesQueue: Queue,
        private readonly generatorService: GeneratorService,
        private readonly eventsService: EventsService,
        @Optional() @Inject(DISABLE_QUEUE_STATS) private readonly disableQueueStats: boolean = false,
        @Optional() private readonly queueInfo: QueueInfo,
    ) {
        this.queueInfo = { current: null, history: [], rates: {} as any };
    }

    publish<T = any>(queueName: string, name: string, data: T, opts?: JobOptions) {
        const queue = this.getQueueByName(queueName);
        return queue.add(name, data, { jobId: this.generatorService.uuid(), ...opts });
    }

    getJob(queueName: string, jobId: string) {
        const queue = this.getQueueByName(queueName);
        return queue.getJob(jobId);
    }

    empty(queueName: string) {
        const queue = this.getQueueByName(queueName);
        return Promise.all<any>([
            ...['completed', 'wait', 'active', 'delayed', 'failed'].map((name) => queue.clean(0, name as JobStatusClean)),
            queue.empty(),
        ]);
    }

    getJobCounts(queueName: string) {
        const queue = this.getQueueByName(queueName);
        return queue.getJobCounts();
    }

    getQueueInfo(history = false): QueueInfo {
        this.computeTrendRates();
        if (history) {
            return this.queueInfo;
        } else {
            const { history, ...rest } = this.queueInfo;
            void history;
            return rest;
        }
    }

    @Cron(CronExpression.EVERY_SECOND)
    async updateHistory() {
        this.queueInfo.current = await this.processingQueue.getJobCounts();

        this.queueInfo.history = [this.queueInfo.current, ...this.queueInfo.history].splice(0, HISTORY_SECONDS);

        if (this.disableQueueStats) {
            return;
        }

        this.computeTrendRates();

        this.eventsService.emit('queue-stats', this.queueInfo);
    }

    private getQueueByName(queueName: string) {
        switch (queueName) {
            case 'processing':
                return this.processingQueue;
            case 'messages':
                return this.messagesQueue;
            default:
                throw new NotFoundException('Queue not found.');
        }
    }

    // TODO: optimize
    private computeTrendRates() {
        const completedValues = [];
        const waitingValues = [];
        const activeValues = [];
        const delayedValues = [];
        const failedValues = [];

        for (const { completed, delayed, waiting, active, failed } of this.queueInfo.history) {
            completedValues.push(completed);
            waitingValues.push(waiting);
            activeValues.push(active);
            delayedValues.push(delayed);
            failedValues.push(failed);
        }

        const MINUTE = 60;
        const FIVE_MINS = 60 * 5;
        const HALF_HOUR = 60 * 30;

        this.queueInfo.rates.completed = [
            findLineByLeastSquares(completedValues),
            findLineByLeastSquares(completedValues.slice(completedValues.length - HALF_HOUR, completedValues.length)),
            findLineByLeastSquares(completedValues.slice(completedValues.length - FIVE_MINS, completedValues.length)),
            findLineByLeastSquares(completedValues.slice(completedValues.length - MINUTE, completedValues.length)),
        ];
        this.queueInfo.rates.waiting = [
            findLineByLeastSquares(waitingValues),
            findLineByLeastSquares(waitingValues.slice(waitingValues.length - HALF_HOUR, waitingValues.length)),
            findLineByLeastSquares(waitingValues.slice(waitingValues.length - FIVE_MINS, waitingValues.length)),
            findLineByLeastSquares(waitingValues.slice(waitingValues.length - MINUTE, waitingValues.length)),
        ];
        this.queueInfo.rates.active = [
            findLineByLeastSquares(activeValues),
            findLineByLeastSquares(activeValues.slice(activeValues.length - HALF_HOUR, activeValues.length)),
            findLineByLeastSquares(activeValues.slice(activeValues.length - FIVE_MINS, activeValues.length)),
            findLineByLeastSquares(activeValues.slice(activeValues.length - MINUTE, activeValues.length)),
        ];
        this.queueInfo.rates.delayed = [
            findLineByLeastSquares(delayedValues),
            findLineByLeastSquares(delayedValues.slice(delayedValues.length - HALF_HOUR, delayedValues.length)),
            findLineByLeastSquares(delayedValues.slice(delayedValues.length - FIVE_MINS, delayedValues.length)),
            findLineByLeastSquares(delayedValues.slice(delayedValues.length - MINUTE, delayedValues.length)),
        ];
        this.queueInfo.rates.failed = [
            findLineByLeastSquares(failedValues),
            findLineByLeastSquares(failedValues.slice(failedValues.length - HALF_HOUR, failedValues.length)),
            findLineByLeastSquares(failedValues.slice(failedValues.length - FIVE_MINS, failedValues.length)),
            findLineByLeastSquares(failedValues.slice(failedValues.length - MINUTE, failedValues.length)),
        ];
    }
}
