import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { DocuvisionModule } from '../docuvision/docuvision.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
    imports: [SharedModule, DocuvisionModule],
    providers: [DocumentsService],
    controllers: [DocumentsController],
    exports: [DocumentsService],
})
export class DocumentsModule {}
