import { getQueueToken } from '@nestjs/bull';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { Queue } from 'bull';
import { workers } from 'config';

import { LoggingService } from '../../shared/logging/logging.service';
import { ConsumersModule } from './consumers.module';

const loggingService = new LoggingService('Workers');

const boostrap = async () => {
    const consumerModule = workers.cluster.autoScale ? ConsumersModule.forRoot() : ConsumersModule;
    const procTitle = process.env.INSTANCE_ID ? `${process.env.name}${process.env.INSTANCE_ID}` : 'standalone';

    const app = await NestFactory.create<NestExpressApplication>(consumerModule);

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.listen(workers.cluster.autoScale ? workers.cluster.port : null);

    loggingService.server(
        '\n',
        ` workers loaded ${await app.getUrl()} [${procTitle}]\n`,
        ` pm2AppName        : ${workers.pm2AppName}\n`,
        ` serverHost        : ${workers.serverHost}\n`,
        ` cluster.max       : ${workers.cluster.max}\n`,
        ` cluster.min       : ${workers.cluster.min}\n`,
        ` cluster.ioMax     : ${workers.cluster.ioMax}\n`,
        ` cluster.waitMax   : ${workers.cluster.waitMax}\n`,
        ` cluster.memMax    : ${workers.cluster.memMax}\n`,
        ` cluster.cpuMax    : ${workers.cluster.cpuMax}\n`,
    );

    if (workers.cluster.autoScale) {
        // handle downscale (eg allow jobs to finish)
        process.on('SIGINT', async () => {
            try {
                const queue: Queue = app.get(getQueueToken('processing'));
                await queue.close();
                await app.close();
            } catch (e) {
                void e;
            }

            process.exit(0);
        });
    }
};

boostrap();
