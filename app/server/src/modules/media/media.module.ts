import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
    imports: [SharedModule],
    providers: [MediaService],
    controllers: [MediaController],
    exports: [MediaService],
})
export class MediaModule {}
