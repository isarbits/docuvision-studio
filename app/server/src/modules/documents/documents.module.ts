import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { DocuvisionModule } from '../docuvision/docuvision.module';
import { QueuesModule } from '../queues/queues.module';
import { SearchModule } from '../search/search.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
    imports: [QueuesModule, SharedModule, DocuvisionModule, SearchModule],
    providers: [DocumentsService],
    controllers: [DocumentsController],
    exports: [DocumentsService],
})
export class DocumentsModule {}
