import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class StringToBooleanPipe implements PipeTransform<string, boolean> {
    transform(stringValue: string, _metadata: ArgumentMetadata): boolean {
        return stringValue === 'true';
    }
}
