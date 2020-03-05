import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { DocuvisionService } from './docuvision.service';

@Module({
    imports: [SharedModule],
    providers: [DocuvisionService],
    exports: [DocuvisionService],
})
export class DocuvisionModule {}
