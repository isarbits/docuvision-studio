import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import * as bodyParser from 'body-parser';
import * as config from 'config';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './common/filters/bad-request.filter';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import { LoggingService } from './shared/logging/logging.service';

const log = new LoggingService('App');

const setupProxy = (server: any) => {
    const options = {
        target: config.elasticsearch.node,
        changeOrigin: true,
        pathRewrite: { '^/search-proxy/': '/' },
        onProxyReq: (proxyReq, req) => {
            const { body } = req;
            if (body) {
                if (typeof body === 'object') {
                    proxyReq.write(JSON.stringify(body));
                } else {
                    proxyReq.write(body);
                }
            }
        },
    };
    const proxyCors = (_req: Request, res: Response, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', '*');
        next();
    };

    server.use('/search-proxy/*', bodyParser.text({ type: 'application/x-ndjson' }), proxyCors, createProxyMiddleware(options));
};

export const configureApplication = async (app: NestExpressApplication) => {
    app.enableShutdownHooks();

    app.useWebSocketAdapter(new WsAdapter(app));
    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.setGlobalPrefix(config.apiPrefix);
    app.use(bodyParser.json({ limit: '50mb' }));
    setupProxy(app.getHttpAdapter());

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

    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), { cors: true });

    await configureApplication(app);

    await app.listen(config.port);

    log.info(
        '\n',
        `  server running ${await app.getUrl()} (${Date.now() - start}ms)\n`,
        `  publicDir     : ${config.paths.publicDir}\n`,
        `  assetsDir     : ${config.paths.assetsDir}\n`,
        `  logLevel      : ${config.logging.logLevel}\n`,
        `  elastic       : ${config.elasticsearch.node}\n`,
    );
};

if (require.main === module) {
    bootstrap();
}
