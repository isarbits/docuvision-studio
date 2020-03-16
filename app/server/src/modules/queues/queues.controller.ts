import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { QueuesService } from './queues.service';

@Controller('queues')
@UseInterceptors(new LogRequestInterceptor('QueuesController'))
export class QueuesController {
    constructor(private readonly queuesService: QueuesService) {}

    @Get(':queueName')
    getJobCounts(@Param('queueName') queueName: string) {
        return this.queuesService.getJobCounts(queueName);
    }

    @Post(':queueName/jobs')
    publishQueueJob(@Param('queueName') queueName: string, @Body() params: { jobName: string; data: any }) {
        return this.queuesService.publish(queueName, params.jobName, params.data);
    }

    @Get(':queueName/jobs/:jobId')
    getQueueJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
        return this.queuesService.getJob(queueName, jobId);
    }

    @Delete(':queueName')
    @HttpCode(HttpStatus.NO_CONTENT)
    empty(@Param('queueName') queueName: string) {
        return this.queuesService.empty(queueName);
    }
}
