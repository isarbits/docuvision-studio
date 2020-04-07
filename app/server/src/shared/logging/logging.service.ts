import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { logging } from 'config';

import { LoggingModel } from './logging.model';

interface LogLevels {
    [source: string]: string;
}

const colourize = (source: string) => {
    const col =
        {
            SERVER: '\x1b[32m',
            INFO: '\x1b[34m',
            DEBUG: '\x1b[30;1m',
            WARN: '\x1b[33m',
            VERBOSE: '\x1b[35m',
        }[source] || '';
    return `${col}${source}\x1b[0;0m`;
};

type Loggable = string | object | number | Error;

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
    logLevels: LogLevels;
    private originalLogLevels: LogLevels;
    private source: string;

    constructor(@Inject(INQUIRER) source?: string | object) {
        this.source = typeof source === 'string' ? source : source?.constructor?.name || 'unknown';
        this.parseLogLevel(logging.logLevel || 'default:all');
    }

    server(...msg: Loggable[]) {
        this.sendLog('server', this.source, null, ...msg);
    }

    info(...msg: Loggable[]) {
        this.sendLog('info', this.source, null, ...msg);
    }

    debug(...msg: Loggable[]) {
        this.sendLog('debug', this.source, null, ...msg);
    }

    warn(...msg: Loggable[]) {
        this.sendLog('warn', this.source, null, ...msg);
    }

    verbose(...msg: Loggable[]) {
        this.sendLog('verbose', this.source, null, ...msg);
    }

    error(msg: Loggable, err?: Error, options?: Partial<LoggingModel>) {
        let output: any = msg;
        if (msg instanceof Error) {
            output = this.formatError(msg);
        } else if (err) {
            output = {
                message: msg,
                error: this.formatError(err),
            };
        }
        this.sendLog('error', this.source, options, output);
        // TODO: log errors, etc to elastic
    }

    setLogLevel(source: string, level: string) {
        this.logLevels[source] = level;
    }

    resetLogLevel() {
        this.logLevels = { ...this.originalLogLevels };
    }

    parseLogLevel(levels: string) {
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

    private sendLog(type: string, source: string | null, _options?: string | Partial<LoggingModel>, ...msg: Loggable[]): boolean {
        if (!this.shouldLog(source, type)) {
            return false;
        }

        const { humanFormat, timestamp } = this.formatDate();
        const logType = console[type] || console.log;

        const sourceCol = (s) => `\x1b[1;36m${s}\x1b[0;0m`;

        if (source) {
            logType(`${humanFormat} [${sourceCol(source)}]`, colourize(type.toUpperCase()), ...msg);
        } else {
            logType(timestamp, colourize(type.toUpperCase()), ...msg);
        }

        // map to strings and log elastic
        // const pretty = process.env.PRETTY_LOG ? 2 : null;
        // msg = typeof msg === 'string' ? msg : JSON.stringify(msg, null, pretty);
        return true;
    }

    private shouldLog(source = 'default', type: string) {
        // always console log if not on dev or test
        if (!['development', 'test'].includes(process.env.NODE_ENV)) {
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
        const padLeft = (s: string | number, l = 2, p = '0') => `${Array(l).fill(p).join('')}${s}`.slice(-l);

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
}
