import { elastic } from 'config';
import { DocuvisionClient } from 'interfaces';
import { logError } from '../../logging/es-log';
import { SearchManager } from '../search/search-manager';
import { IndexDocument, IndexWord } from '../index.d';

const esClient = SearchManager.getClient({
    node: elastic.node,
    index: `${elastic.index}_word`,
});

const getIndexableWord = (indexDocument: IndexDocument, page: DocuvisionClient.Page, word: DocuvisionClient.Word, wordIndex: number): IndexWord => {
    const { pages, ...document } = indexDocument.document;
    const { words, ...rest } = page;
    void [pages, words];

    return {
        ...indexDocument,
        id: `${indexDocument.id}/${page.pageNumber}/${wordIndex}`,
        document,
        page: rest,
        word: {
            index: wordIndex,
            ...word,
            x0: word.bb[0],
            y0: word.bb[1],
            x1: word.bb[2],
            y1: word.bb[3],
        },
    };
};

export const indexWord = (indexDocument: IndexDocument, page: DocuvisionClient.Page, word: DocuvisionClient.Word, wordIndex: number) => {
    const body = getIndexableWord(indexDocument, page, word, wordIndex);
    return esClient.index({ body }).catch(logError);
};

export const indexAllWords = (indexDocument: IndexDocument, page: DocuvisionClient.Page) => {
    const words = page.words.map((word, index) => getIndexableWord(indexDocument, page, word, index));
    const body = words.flatMap(word => [{ index: { _index: esClient.defaultIndex, _type: '_doc' } }, word]);
    return esClient.bulk({ body }).catch(logError);
};
