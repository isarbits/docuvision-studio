import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { workers } from 'config';
import { promisify } from 'util';

import { LoggingService } from '../../shared/logging/logging.service';
import { QueuesService } from '../queues/queues.service';

interface AppInfo {
    monit: {
        cpu: number;
        memory: number;
    };
    name: string;
    pid: number;
    pm2_env: {};
    pm_id: number;
}

@Injectable()
export class ConsumersService {
    private readonly automatic = true;
    private readonly pm2AppName = 'workers';

    constructor(private readonly loggingService: LoggingService, private readonly queuesService: QueuesService) {}

    async getConsumers(): Promise<AppInfo[]> {
        const { stdout } = await this.exec(`pm2 jlist`);

        return JSON.parse(stdout).reduce((consumers, app) => {
            if (app.name === this.pm2AppName) {
                /* eslint-disable @typescript-eslint/camelcase */
                consumers.push({ ...app, pm2_env: {} });
            }

            return consumers;
        }, []);
    }

    async add(count: string | number = '1') {
        const num = this.validate(count);

        const consumers = await this.getConsumers();
        if (consumers.length >= workers.cluster.max) {
            return { message: false };
        }

        await this.exec(`pm2 scale ${this.pm2AppName} +${num}`);

        return { message: true };
    }

    async set(count: string | number) {
        const num = this.validate(count);

        if (num > workers.cluster.max || num < workers.cluster.min) {
            return { message: false };
        }

        await this.exec(`pm2 scale ${this.pm2AppName} ${num}`);

        return { message: true };
    }

    async remove(count: string | number = '1') {
        const num = this.validate(count);

        const consumers = await this.getConsumers();
        if (consumers.length <= workers.cluster.max) {
            return { message: false };
        }

        const newValue = Math.max(1, consumers.length - num);
        await this.exec(`pm2 scale ${this.pm2AppName} ${newValue}`);

        return { message: true };
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    // @Cron(CronExpression.EVERY_10_SECONDS)
    async checkWorkerStatus() {
        if (!this.automatic) {
            return;
        }
        const { rates, current } = this.queuesService.getQueueInfo();
        if (current === null) {
            return;
        }

        const inOutRatio = rates.waiting[1].m;

        this.loggingService.server('CHECKING', inOutRatio, current.waiting);
        if (inOutRatio > 5 || current.waiting > 2000) {
            // if (inOutRatio > 10 || current.waiting > 2000) {
            this.loggingService.server('Will try to bump up workers');
            await this.add(1);
        } else if (inOutRatio < 1 && current.waiting === 0) {
            await this.remove(1);
        }
    }

    private validate(count: string | number): number {
        const asNum = Number(count);
        if (!/^[0-9]+$/.test(`${count}`) || Number.isNaN(asNum)) {
            throw new UnprocessableEntityException(`count must be a number (${count}).`);
        }
        return asNum;
    }

    // TODO: err
    private exec(command: string) {
        this.loggingService.debug(command);
        return promisify(exec)(command);
    }
}
