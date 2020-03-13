export { Docuvision, Search } from '../../../server/src/interfaces';

export type Hit<T> = T & {
    highlight: any;
    _index: string;
    _type: string;
    _id: string;
    _score: number;
};
