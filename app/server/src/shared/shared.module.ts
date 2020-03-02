import { HttpModule, Module } from '@nestjs/common';
import { GeneratorService } from './generator/generator.service';
import { ValidatorService } from './validator/validator.service';
import { LoggingModule } from './logging/logging.module';

const providers = [ValidatorService, GeneratorService];

@Module({
    providers,
    imports: [HttpModule, LoggingModule],
    exports: [...providers, HttpModule, LoggingModule],
})
export class SharedModule {}
