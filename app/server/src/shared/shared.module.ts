import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GeneratorService } from './generator/generator.service';
import { LoggingModule } from './logging/logging.module';
import { ValidatorService } from './validator/validator.service';
import { FileSystemService } from './storage/filesystem.service';

const providers = [ValidatorService, GeneratorService, FileSystemService];

@Module({
    providers,
    imports: [HttpModule, LoggingModule, ConfigModule.forRoot()],
    exports: [...providers, HttpModule, LoggingModule],
})
export class SharedModule {}
