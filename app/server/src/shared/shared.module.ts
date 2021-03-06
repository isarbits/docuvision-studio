import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GeneratorService } from './generator/generator.service';
import { LoggingModule } from './logging/logging.module';
import { FileSystemService } from './storage/filesystem.service';
import { UtilsService } from './utils/utils.service';
import { ValidatorService } from './validator/validator.service';

const providers = [UtilsService, ValidatorService, GeneratorService, FileSystemService];

@Module({
    providers,
    imports: [HttpModule, LoggingModule, ConfigModule.forRoot()],
    exports: [...providers, HttpModule, LoggingModule],
})
export class SharedModule {}
