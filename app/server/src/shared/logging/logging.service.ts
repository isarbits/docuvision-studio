import { INQUIRER } from '@nestjs/core';
import { Injectable, Scope, Inject } from '@nestjs/common';
import { envName, logging } from 'config';
import { LoggingModel } from './logging.model';

interface LogLevels {
    [source: string]: string;
}
export const LOGGING_LEVELS = 'default:all';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
    public logLevels: LogLevels;
    private originalLogLevels: LogLevels;
    private source: string;

    constructor(@Inject(INQUIRER) source?: string | object) {
        this.source = typeof source === 'string' ? source : source?.constructor?.name;
        this.parseLogLevel(logging.logLevel || 'default:all');
    }

    public server(msg: string | object) {
        this.sendLog('server', this.source, msg);
    }

    public info(msg: string | object) {
        this.sendLog('info', this.source, msg);
    }

    public debug(msg: string | object) {
        this.sendLog('debug', this.source, msg);
    }

    public warn(msg: string | object) {
        this.sendLog('warn', this.source, msg);
    }

    public verbose(msg: string | object) {
        this.sendLog('verbose', this.source, msg);
    }

    public error(msg: string | object | Error, err?: Error, options?: Partial<LoggingModel>) {
        let output: any = msg;
        if (msg instanceof Error) {
            output = this.formatError(msg);
        } else if (err) {
            output = {
                message: msg,
                error: this.formatError(err),
            };
        }
        this.sendLog('error', this.source, output, options);
        // TODO: log errors, etc to elastic
    }

    public setLogLevel(source: string, level: string) {
        this.logLevels[source] = level;
    }

    public resetLogLevel() {
        this.logLevels = { ...this.originalLogLevels };
    }

    private sendLog(type: string, source: string | null, msg: string | object, _options?: string | Partial<LoggingModel>): boolean {
        if (!this.shouldLog(source, type)) {
            return false;
        }

        const { humanFormat, timestamp } = this.formatDate();
        const logType = console[type] || console.log;
        const pretty = process.env.PRETTY_LOG ? 2 : null;

        msg = typeof msg === 'string' ? msg : JSON.stringify(msg, null, pretty);

        const colourize = s => `\x1b[1;36m${s}\x1b[0;0m`;

        if (source) {
            logType(`${humanFormat} ${timestamp} [${colourize(source)}]`, type.toUpperCase(), msg);
        } else {
            logType(timestamp, colourize(type.toUpperCase()), msg);
        }

        return true;
    }

    private shouldLog(source = 'default', type: string) {
        // always console log if not on dev or test
        if (!['default', 'test'].includes(envName)) {
            return true;
        }
        const scope = (source || 'default').toLowerCase();
        const levels = this.logLevels[scope] || this.logLevels[type] || this.logLevels.default;
        if (!levels) {
            return true;
        }
        const sourceLevel = levels === 'default' ? this.logLevels.default : levels;
        const regex = new RegExp(`\\b(all|${type})\\b`);

        return regex.test(sourceLevel);
    }

    private formatDate() {
        const date = new Date();
        const timestamp = date.getTime();
        // YYYY-MM-DD.hh:mm:ss:
        const padLeft = (s: string | number, l = 2, p = '0') =>
            `${Array(l)
                .fill(p)
                .join('')}${s}`.slice(-l);

        const dateParts = [
            // @prettierignore
            date.getFullYear(),
            padLeft(date.getMonth() + 1),
            padLeft(date.getDate()),
        ].join('-');
        const timeParts = [
            // @prettierignore
            padLeft(date.getHours()),
            padLeft(date.getMinutes()),
            padLeft(date.getSeconds()),
        ]
            .join(':')
            .concat(`.${padLeft(date.getMilliseconds(), 3)}`);
        const humanFormat = `${dateParts} ${timeParts}`;
        return { timestamp, humanFormat };
    }

    private formatError(err: Error) {
        if (err.stack) {
            return {
                message: err.message,
                stack: err.stack.split('\n'),
            };
        }
        return err;
    }

    private parseLogLevel(levels: string) {
        const delimiter = ';';
        this.logLevels = {
            default: 'all',
        };
        for (const sourceLevel of levels.split(delimiter)) {
            const [source, levels] = sourceLevel.split(':');
            this.logLevels[source] = levels;
        }
        this.originalLogLevels = { ...this.logLevels };
    }
}
