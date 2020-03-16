import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { redis } from 'config';

const imports = [BullModule.registerQueue({ name: 'processing', redis }), BullModule.registerQueue({ name: 'messages', redis })];

@Module({
    imports,
    exports: [...imports],
})
export class QueueConnectionsModule {}
