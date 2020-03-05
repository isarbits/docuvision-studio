import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { elasticsearch } from 'config';

@Injectable()
export class ElasticIndexPipe implements PipeTransform<string, string> {
    transform(esIndex: string, _metadata: ArgumentMetadata): string {
        return `${elasticsearch.node}/${esIndex}/_search`;
    }
}
