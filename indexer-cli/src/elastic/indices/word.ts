import { Docuvision } from 'interfaces';
import { logError } from '../../logging/es-log';
import { IndexDocument, IndexWord } from '../index.d';
import { StudioClient } from '../../api/client';

const studioClient = new StudioClient();

const getIndexableWord = (indexDocument: IndexDocument, page: Docuvision.Page, word: Docuvision.Word, wordIndex: number): IndexWord => {
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

export const indexWord = (indexDocument: IndexDocument, page: Docuvision.Page, word: Docuvision.Word, wordIndex: number) => {
    const body = getIndexableWord(indexDocument, page, word, wordIndex);
    return studioClient.indexWord(body).catch(logError);
};

export const indexAllWords = (indexDocument: IndexDocument, page: Docuvision.Page) => {
    const words = page.words.map((word, index) => getIndexableWord(indexDocument, page, word, index));
    return studioClient.indexWords(words).catch(logError);
};
