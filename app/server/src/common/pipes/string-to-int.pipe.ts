import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class StringToIntPipe implements PipeTransform<string, number> {
    transform(stringValue: string, _metadata: ArgumentMetadata): number {
        const num = parseInt(stringValue, 10);
        return num || null;
    }
}
