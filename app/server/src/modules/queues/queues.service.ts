import { InjectQueue } from '@nestjs/bull';
import { Optional } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobCounts, JobOptions, JobStatusClean, Queue } from 'bull';

import { findLineByLeastSquares } from '../../providers/linear-best-fit';
import { GeneratorService } from '../../shared/generator/generator.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { EventsService } from '../events/events.service';

export const disableQueueStatsToken = 'DISABLE_CRON';

const HISTORY_SECONDS = 60 * 60;

interface TrendLine {
    m: number;
    b: number;
}

export interface QueueInfo {
    current: JobCounts;
    history: JobCounts[];
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
        private readonly loggingService: LoggingService,
        private readonly generatorService: GeneratorService,
        private readonly eventsService: EventsService,
        @Optional() @Inject(disableQueueStatsToken) private readonly doCron: boolean = true,
        @Optional() private readonly queueInfo: QueueInfo,
    ) {
        this.queueInfo = { current: null, history: [], rates: {} as any };
    }

    publishProcessing<T = any>(name: string, data: T, opts?: JobOptions) {
        this.loggingService.debug(`[${name}] publish`);
        return this.processingQueue.add(name, data, { jobId: this.generatorService.uuid(), ...opts });
    }

    getProcessingJob(jobId: string) {
        return this.processingQueue.getJob(jobId);
    }

    empty() {
        return Promise.all([
            ...['completed', 'wait', 'active', 'delayed', 'failed'].map(name => this.processingQueue.clean(0, name as JobStatusClean)),
            this.processingQueue.empty() as any,
        ]);
    }

    getQueueInfo(history = false) {
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

        if (!this.doCron) {
            return;
        }

        this.computeTrendRates();

        this.eventsService.emit('queue-stats', this.queueInfo);
    }

    // TODO: goodify
    computeTrendRates() {
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

        // const MINUTE = 60;
        const FIVE_MINS = 60 * 5;
        // const HALF_HOUR = 60 * 30;

        this.queueInfo.rates.completed = [
            findLineByLeastSquares(completedValues),
            findLineByLeastSquares(completedValues.slice(completedValues.length - FIVE_MINS, completedValues.length)),
        ];
        this.queueInfo.rates.waiting = [
            findLineByLeastSquares(waitingValues),
            findLineByLeastSquares(waitingValues.slice(completedValues.length - FIVE_MINS, waitingValues.length)),
        ];
        this.queueInfo.rates.active = [
            findLineByLeastSquares(activeValues),
            findLineByLeastSquares(activeValues.slice(completedValues.length - FIVE_MINS, activeValues.length)),
        ];
        this.queueInfo.rates.delayed = [
            findLineByLeastSquares(delayedValues),
            findLineByLeastSquares(delayedValues.slice(completedValues.length - FIVE_MINS, delayedValues.length)),
        ];
        this.queueInfo.rates.failed = [
            findLineByLeastSquares(failedValues),
            findLineByLeastSquares(failedValues.slice(completedValues.length - FIVE_MINS, failedValues.length)),
        ];
    }
}
