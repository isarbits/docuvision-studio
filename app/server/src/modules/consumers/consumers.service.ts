import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { workers } from 'config';
import { promisify } from 'util';

import { ClusterOnly } from '../../common/decorators/cluster-only.decorator';
import { LoggingService } from '../../shared/logging/logging.service';
import { QueuesService, RateIntervals } from '../queues/queues.service';

interface AppInfo {
    monit: {
        cpu: number;
        memory: number;
    };
    name: string;
    pid: number;
    instanceId: number;
    pm_id: number;
}

const UPSCALE_IO_RATIO = process.env.UPSCALE_IO_RATIO || 200;
const UPSCALE_WAIT_MAX = process.env.UPSCALE_WAIT_MAX || 5000;

@Injectable()
export class ConsumersService {
    constructor(private readonly loggingService: LoggingService, private readonly queuesService: QueuesService) {}

    @ClusterOnly()
    async getConsumers(): Promise<AppInfo[]> {
        const { stdout } = await this.exec(`pm2 jlist`);

        return JSON.parse(stdout).reduce((consumers, app) => {
            if (app.name === workers.pm2AppName) {
                consumers.push({
                    ...app,
                    instanceId: app.pm2_env.INSTANCE_ID,
                });
            }

            return consumers;
        }, []);
    }

    @ClusterOnly()
    async add(count = 1) {
        const num = this.validate(count);

        const consumers = await this.getConsumers();
        if (consumers.length >= workers.cluster.max) {
            return { message: false, count: consumers.length };
        }

        await this.exec(`pm2 scale ${workers.pm2AppName} +${num}`);

        return { message: false, count: consumers.length + count };
    }

    @ClusterOnly()
    async set(count: number) {
        const num = this.validate(count);
        const consumers = await this.getConsumers();

        if (num > workers.cluster.max || num < workers.cluster.min || consumers.length === num) {
            return { message: false, count: consumers.length };
        }

        await this.exec(`pm2 scale ${workers.pm2AppName} ${num}`);

        return { message: true, count: num };
    }

    @ClusterOnly()
    async remove(count = 1) {
        const num = this.validate(count);
        const consumers = await this.getConsumers();
        const newValue = Math.max(1, consumers.length - num);

        if (consumers.length <= workers.cluster.min || consumers.length === newValue) {
            return { message: false, count: consumers.length };
        }

        const slavePids: number[] = consumers.reduce((slaves, consumer) => {
            return consumer.instanceId === 0 ? slaves : slaves.concat(consumer.pm_id);
        }, []);

        if (!slavePids.length) {
            return { message: false, count: consumers.length };
        }

        await this.exec(`pm2 delete ${slavePids.join(' ')}`);

        return { message: true, count: newValue };
    }

    @ClusterOnly()
    @Cron(CronExpression.EVERY_30_SECONDS)
    async checkWorkerStatus() {
        try {
            if (!workers.cluster.autoScale) {
                return;
            }

            const { rates, current } = this.queuesService.getQueueInfo();
            if (current === null) {
                return;
            }

            const inOutRatio = rates.waiting[RateIntervals.ONE_MINUTE].m;

            if (inOutRatio > UPSCALE_IO_RATIO || current.waiting > UPSCALE_WAIT_MAX) {
                const added = await this.add(1);

                if (added.message === true) {
                    this.loggingService.server(`Added worker (io:${inOutRatio}, wait:${current.waiting}, count:${added.count})`);
                }
            } else if (current.waiting === 0) {
                const removed = await this.remove(1);

                if (removed.message === true) {
                    this.loggingService.server(`Removed worker (io:${inOutRatio}, wait:${current.waiting}, count:${removed.count})`);
                }
            }
        } catch (e) {
            this.loggingService.error('ConsumersService:checkWorkerStatus caught error:', e);
        }
    }

    private validate(count: number): number {
        const asNum = Number(count);
        if (!/^[0-9]+$/.test(`${count}`) || Number.isNaN(asNum)) {
            throw new UnprocessableEntityException(`count must be a number (${count}).`);
        }
        return asNum;
    }

    private exec(command: string) {
        return promisify(exec)(command);
    }
}
