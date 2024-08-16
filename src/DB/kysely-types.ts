import type { ColumnType } from 'kysely';

export type Generated<T> =
    T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Url = {
    id: string;
    createdAt: Generated<Timestamp>;
    redirectTo: string;
};

export type UrlClick = {
    id: string;
    createdAt: Generated<Timestamp>;
    fkUrlId: string;
};

export type DB = {
    urls: Url;
    urlClicks: UrlClick;
};
