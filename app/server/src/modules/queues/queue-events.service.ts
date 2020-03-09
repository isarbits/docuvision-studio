import { InjectQueue } from '@nestjs/bull';
import { BeforeApplicationShutdown, Injectable, Optional } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { LoggingService } from '../../shared/logging/logging.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class QueueEventsService implements BeforeApplicationShutdown {
    constructor(
        @InjectQueue('processing') private readonly processingQueue: Queue,
        @InjectQueue('messages') private readonly messagesQueue: Queue,
        private readonly loggingService: LoggingService,
        private readonly eventsService: EventsService,
        @Optional() private readonly addListeners = true,
    ) {
        if (this.addListeners) {
            this.initEventListeners();
        }
    }

    beforeApplicationShutdown() {
        this.processingQueue.removeAllListeners();
    }

    private initEventListeners() {
        this.processingQueue.on('global:completed', this.onQueueCompleted.bind(this));
        this.processingQueue.on('global:failed', this.onQueueFailed.bind(this));
        this.processingQueue.on('global:error', this.onQueueError.bind(this));
        this.processingQueue.on('global:stalled', this.onQueueStalled.bind(this));
        this.processingQueue.on('global:progress', this.onQueueProgress.bind(this));
        // this.processingQueue.on('global:active', this.onQueueActive.bind(this));
        // this.processingQueue.on('global:waiting', this.onQueueWaiting.bind(this));
        // this.processingQueue.on('global:paused', this.onQueuePaused.bind(this));
        // this.processingQueue.on('global:resumed', this.onQueueResumed.bind(this));
        // this.processingQueue.on('global:cleaned', this.onQueueCleaned.bind(this));
        // this.processingQueue.on('global:drained', this.onQueueDrained.bind(this));
        // this.processingQueue.on('global:removed', this.onQueueRemoved.bind(this));
    }

    async onQueueCompleted(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        const message = `[${this.processingQueue.name}:${job.name}] @Completed:`;

        this.emit('completed', message, job);

        // this.messagesQueue.add({ message, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Completed:`, jobId);
    }

    async onQueueFailed(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        const message = `[${this.processingQueue.name}:${job.name}] @Failed:`;

        this.emit('failed', message, job);

        this.loggingService.warn(`[${this.processingQueue.name}:${job.name}] @Failed:`, job);
        this.messagesQueue.add({ message, job });
    }

    onQueueError(error: Error) {
        const message = `[${this.processingQueue.name}] @Error:`;

        this.emit('error', message, error);

        this.loggingService.warn(`[${this.processingQueue.name}] @Error:`, error);
        this.messagesQueue.add({ message, error });
    }

    async onQueueActive(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Active:`, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Active:`, jobId);
    }

    async onQueueWaiting(jobId: number | string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Waiting:`, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Waiting:`, jobId);
    }

    async onQueueStalled(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Stalled:`, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Stalled:`, jobId);
    }

    async onQueueProgress(jobId: string, progress: number) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Progress:`, jobId, progress });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Progress:`, jobId, progress);
    }

    onQueuePaused() {
        this.messagesQueue.add({ message: `[${this.processingQueue.name}] @Paused:` });
        // this.loggingService.debug(`[${this.processingQueue.name}] @Paused:`);
    }

    async onQueueResumed(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Resumed:`, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Resumed:`, jobId);
    }

    async onQueueCleaned(jobIds: string[], type: string) {
        this.messagesQueue.add({ message: `[${this.processingQueue.name}] @Cleaned:`, jobIds, type });
        // this.loggingService.debug(`[${this.processingQueue.name}] @Cleaned:`, jobIds, type);
        // const jobs = await Promise.all(jobIds.map(this.processingQueue.getJob))
        // console.log(jobs, type);
    }

    onQueueDrained() {
        this.messagesQueue.add({ message: `[${this.processingQueue.name}] @Drained:` });
        // this.loggingService.debug(`[${this.processingQueue.name}] @Drained:`);
    }

    async onQueueRemoved(jobId: string) {
        const job: Job = await this.processingQueue.getJob(jobId);
        this.messagesQueue.add({ message: `[${this.processingQueue.name}:${job.name}] @Removed:`, jobId });
        // this.loggingService.debug(`[${this.processingQueue.name}:${job.name}] @Removed:`, jobId);
    }

    private emit(type: string, message: string, data: any) {
        this.eventsService.emit('queue-logs', { type, message, data });
    }
}
