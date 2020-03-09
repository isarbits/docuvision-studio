process.env.LOG_LEVELS = 'debug:none';

import { getQueueToken } from '@nestjs/bull';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Queue } from 'bull';

import { ConsumersModule } from './consumers.module';

const boostrap = async () => {
    const app = await NestFactory.create<NestExpressApplication>(ConsumersModule);
    await app.listen(null);
    console.log('workers loaded ', await app.getUrl());

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
};

boostrap();
