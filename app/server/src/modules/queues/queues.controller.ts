import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseInterceptors } from '@nestjs/common';

import { LogRequestInterceptor } from '../../common/interceptors/log-request.interceptor';
import { QueuesService } from './queues.service';

@Controller('queues')
@UseInterceptors(new LogRequestInterceptor('QueuesController'))
export class QueuesController {
    constructor(private readonly queuesService: QueuesService) {}

    @Get(':queueName')
    queueInfo(@Param('history') withHist: string) {
        return this.queuesService.getQueueInfo(!!withHist);
    }

    @Post(':queueName/jobs')
    publishQueueJob(/*@Param('queueName') queueName: string, */ @Body() params: { jobName: string; data: any }) {
        return this.queuesService.publishProcessing(params.jobName, params.data);
    }

    @Get(':queueName/jobs/:jobId')
    getQueueJob(@Param('jobId') jobId: string) {
        return this.queuesService.getProcessingJob(jobId);
    }

    @Delete(':queueName')
    @HttpCode(HttpStatus.NO_CONTENT)
    empty() {
        return this.queuesService.empty();
    }
}
