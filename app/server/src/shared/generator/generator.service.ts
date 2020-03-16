import { Injectable } from '@nestjs/common';
import { v1 as uuidV1 } from 'uuid';

@Injectable()
export class GeneratorService {
    uuid(): string {
        return uuidV1();
    }

    fileName(ext: string) {
        return this.uuid() + '.' + ext;
    }
}
