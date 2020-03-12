import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
    // https://stackoverflow.com/questions/6974614/how-to-convert-human-readable-memory-size-into-bytes
    humanToBytes(text: string | number): number {
        const powers = { k: 1, m: 2, g: 3, t: 4 };
        const regex = /(\d+(?:\.\d+)?)\s?(k|m|g|t)?[bB]?/i;
        const res = regex.exec(`${text}`);

        return +res[1] * Math.pow(1024, powers[`${res[2]}`.toLowerCase()]);
    }

    // https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
    bytesToHuman(bytes: string | number, fmtWithSpace = true): string {
        bytes = parseInt(`${bytes}`, 10);
        if (Number.isNaN(bytes)) {
            return null;
        }
        const space = fmtWithSpace ? ' ' : '';
        if (bytes < 1024) {
            return bytes + `${space}B`;
        }
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const num = bytes / Math.pow(1024, i);
        const round = Math.round(num);
        const text = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;

        return `${text}${space}${'KMGTPEZY'[i - 1]}B`;
    }
}
