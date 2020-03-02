export class LoggingModel {
    message: string;
    source: string;
    type: string;
    created: Date;
    host: string;

    constructor(type: string, source: string | null, options: Partial<LoggingModel> = {}) {
        this.created = new Date();
        this.type = type;
        this.source = source;

        Object.assign(this, options);
    }
}
