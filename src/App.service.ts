import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';

import { DB } from './DB';
import { DBService } from './DB/DB.service';
import { makeRandomId } from './utils/randomId';

@Injectable()
export class AppService {
    constructor(private readonly db: DBService) {}

    async getUrlById(id: string): Promise<Selectable<DB.Url> | null> {
        const url = await this.db.kysely.selectFrom('urls').selectAll().where('id', '=', id).executeTakeFirst();

        // Make sure URL is still active
        if (!url || (url.activeUntil && url.activeUntil < new Date())) {
            return null;
        }

        return url;
    }

    async incrementUrlClickCounter(id: string): Promise<void> {
        await this.db.kysely
            .insertInto('urlClicks')
            .values({ id: makeRandomId(16), fkUrlId: id })
            .executeTakeFirst();
    }

    async isHostnameBanned(hostname: string): Promise<boolean> {
        return Boolean(
            await this.db.kysely
                .selectFrom('bannedHostnames')
                .select('id')
                .where('hostname', '=', hostname)
                .executeTakeFirst(),
        );
    }

    async createShortUrl(redirectTo: URL, activeUntil?: string): Promise<Selectable<DB.Url> | null> {
        const urlInDb = await this.db.kysely
            .selectFrom('urls')
            .selectAll()
            .where('redirectTo', '=', redirectTo.toString())
            .executeTakeFirst();
        if (urlInDb) {
            return urlInDb;
        }

        const randomId = makeRandomId(6);
        if (await this.db.kysely.selectFrom('urls').select('id').where('id', '=', randomId).executeTakeFirst()) {
            // ID already exists, try with a new one
            return this.createShortUrl(redirectTo, activeUntil);
        }

        const shortenedUrl = await this.db.kysely
            .insertInto('urls')
            .values({
                id: randomId,
                redirectTo: redirectTo.toString(),
                activeUntil: !activeUntil || Number.isNaN(Date.parse(activeUntil)) ? undefined : new Date(activeUntil),
            })
            .returningAll()
            .executeTakeFirst();

        return shortenedUrl ?? null;
    }
}
