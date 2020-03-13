import { InjectQueue, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';

import { WorkerInterface } from '../consumers.d';

@Processor('messages')
export class MessagesWorker implements WorkerInterface<any> {
    readonly jobName = '';

    constructor(@InjectQueue('messages') readonly queue: Queue) {
        this.queue.process(this.work.bind(this));
    }

    async work(job: Job<any>) {
        console.log(job.data);
    }
}
