import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import * as config from 'config';
import { Request, Response } from 'express';

import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './common/filters/bad-request.filter';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import { LoggingService } from './shared/logging/logging.service';

const log = new LoggingService('App');

export const configureApplication = async (app: NestExpressApplication) => {
    app.enableShutdownHooks();

    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.setGlobalPrefix(config.apiPrefix);

    const reflector = app.get(Reflector);

    app.useWebSocketAdapter(new WsAdapter(app));

    app.useGlobalFilters(new BadRequestExceptionFilter(reflector));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
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

    app.useStaticAssets(config.paths.assetsDir);

    app.use((_req: Request, res: Response, next) => {
        res.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');
        res.header('Access-Control-Allow-Origin', 'localhost');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-XSS-Protection', '1; mode=block');
        res.header('Referrer-Policy', 'same-origin');
        res.header('X-DNS-Prefetch-Control', 'off');
        res.header('X-Download-Options', 'noopen');
        res.removeHeader('X-Powered-By');
        res.removeHeader('Transfer-Encoding');
        next();
    });
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
        '\n',
        `  server running ${await app.getUrl()} (${Date.now() - start}ms)\n`,
        `  transportPort : ${config.transportPort}\n`,
        `  staticDir     : ${config.paths.staticDir}\n`,
        `  assetsDir     : ${config.paths.assetsDir}\n`,
        `  logLevel      : ${config.logging.logLevel}\n`,
        `  elastic       : ${config.elasticsearch.node}\n`,
    );
};

if (require.main === module) {
    bootstrap();
}
