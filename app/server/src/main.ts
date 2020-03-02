import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as config from 'config';
import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './common/filters/bad-request.filter';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import { LoggingService } from './shared/logging/logging.service';

const log = new LoggingService('App');

export const configureApplication = async app => {
    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.setGlobalPrefix(config.apiPrefix);

    const reflector = app.get(Reflector);

    app.useGlobalFilters(new BadRequestExceptionFilter(reflector));

    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector), new ErrorsInterceptor());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            dismissDefaultMessages: true,
            validationError: {
                target: false,
            },
        }),
    );
};

const bootstrap = async () => {
    const start = Date.now();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
        cors: true,
        bodyParser: true,
    });

    await configureApplication(app);

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            port: config.transportPort,
            retryAttempts: 5,
            retryDelay: 3000,
        },
    });

    await app.startAllMicroservicesAsync();

    await app.listen(config.port);

    log.info(
        '\n' +
            [
                `  transportPort : ${config.transportPort}`,
                `  staticDir     : ${config.paths.staticDir}`,
                `  logLevel      : ${config.logging.logLevel}`,
                `  elastic       : ${config.elasticsearch.node}`,
                `  server running on port ${config.port} (${Date.now() - start}ms)`,
            ].join('\n'),
    );
};

if (require.main === module) {
    bootstrap();
}
