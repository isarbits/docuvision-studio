import { InjectQueue } from '@nestjs/bull';
import { BeforeApplicationShutdown, Injectable, Optional } from '@nestjs/common';
import { Job, JobId, Queue } from 'bull';

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

    async onQueueCompleted(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Completed', job.name);

        this.emit('completed', message, job);
    }

    async onQueueFailed(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Failed', job.name);

        this.emit('failed', message, job);

        this.loggingService.warn(message, job);
        this.messagesQueue.add({ message, job });
    }

    onQueueError(error: Error) {
        const message = this.buildMessage('Error');

        this.emit('error', message, error);

        this.loggingService.warn(message, error);
        this.messagesQueue.add({ message, error });
    }

    async onQueueActive(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Active', job.name);

        this.messagesQueue.add({ message, jobId });
    }

    async onQueueWaiting(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Wating', job.name);

        this.messagesQueue.add({ message, jobId });
    }

    async onQueueStalled(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Stalled', job.name);

        this.messagesQueue.add({ message, jobId });
    }

    async onQueueProgress(jobId: JobId, progress: number) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Progress', job.name);

        this.messagesQueue.add({ message, jobId, progress });
    }

    onQueuePaused() {
        const message = this.buildMessage('Paused');

        this.messagesQueue.add({ message });
    }

    async onQueueResumed(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Resumed', job.name);

        this.messagesQueue.add({ message, jobId });
    }

    async onQueueCleaned(jobIds: JobId[], type: string) {
        const message = this.buildMessage('Cleaned', jobIds.join(' '));

        this.messagesQueue.add({ message, jobIds, type });
        // const jobs = await Promise.all(jobIds.map(this.getJob))
    }

    onQueueDrained() {
        const message = this.buildMessage('Drained');

        this.messagesQueue.add({ message });
    }

    async onQueueRemoved(jobId: JobId) {
        const job = await this.getJob(jobId);
        const message = this.buildMessage('Removed', job.name);

        this.messagesQueue.add({ message, jobId });
    }

    private async getJob(jobId: JobId, allFields = false): Promise<Partial<Job>> {
        let job: Job = await this.processingQueue.getJob(jobId);

        if (!allFields) {
            const { queue, ...rest } = job;

            job = {
                ...rest,
                queue: { name: queue.name } as any,
            };
        }

        return job;
    }

    private buildMessage(event: string, jobName?: string) {
        return `@${event} [${this.processingQueue.name}${jobName ? `:${jobName}` : ''}]`;
    }

    private emit(type: string, message: string, data: any) {
        this.eventsService.emit('queue-logs', { type, message, data });
    }
}
