import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { elasticsearch } from 'config';

@Injectable()
export class ElasticIndexPipe implements PipeTransform<string, string> {
    transform(value: string, _metadata: ArgumentMetadata): string {
        return `${elasticsearch.node}/${value}/_search`;
    }
}
