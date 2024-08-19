import { Injectable } from '@nestjs/common';
import { Selectable } from 'kysely';

import { DB } from './DB';
import { DBService } from './DB/DB.service';
import { API_HOSTNAME } from './utils/env';
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

    async getUrlWithClicks(id: string): Promise<(Selectable<DB.Url> & { clicks: number }) | null> {
        const clicks = await this.db.kysely
            .selectFrom('urlClicks')
            .select((eb) => eb.fn.countAll().as('totalClicks'))
            .where('fkUrlId', '=', id)
            .executeTakeFirst();

        const url = await this.getUrlById(id);

        return url
            ? {
                  ...url,
                  clicks: Number(clicks?.totalClicks ?? '0'),
              }
            : null;
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

    async banHostname(hostname: string): Promise<Selectable<DB.BannedHostname> | null> {
        const banInDb = await this.db.kysely
            .selectFrom('bannedHostnames')
            .selectAll()
            .where('hostname', '=', hostname)
            .executeTakeFirst();
        if (banInDb) {
            return banInDb;
        }

        const ban = await this.db.kysely
            .insertInto('bannedHostnames')
            .values({
                id: makeRandomId(16),
                hostname,
            })
            .returningAll()
            .executeTakeFirst();

        if (ban) {
            // If ban was successfully created, disable URLs that match the hostname
            await this.db.kysely
                .updateTable('urls')
                .set({ activeUntil: new Date() })
                .where('hostname', '=', ban.hostname)
                .where('activeUntil', 'is', null)
                .execute();
        }

        return ban ?? null;
    }

    async createShortUrl(
        redirectTo: URL,
        activeUntil?: string,
    ): Promise<{ shortUrl: string; redirectTo: string; activeUntil: Date | null } | null> {
        const urlInDb = await this.db.kysely
            .selectFrom('urls')
            .selectAll()
            .where('redirectTo', '=', redirectTo.toString())
            .executeTakeFirst();
        if (urlInDb) {
            return {
                shortUrl: `${API_HOSTNAME}/${urlInDb.id}`,
                redirectTo: urlInDb.redirectTo,
                activeUntil: urlInDb.activeUntil,
            };
        }

        const randomId = makeRandomId(6); // According to https://zelark.github.io/nano-id-cc -> 37K ids are required to have a 1% probability of collision.
        if (await this.db.kysely.selectFrom('urls').select('id').where('id', '=', randomId).executeTakeFirst()) {
            // ID already exists, try with a new one
            return this.createShortUrl(redirectTo, activeUntil);
        }

        const shortenedUrl = await this.db.kysely
            .insertInto('urls')
            .values({
                id: randomId,
                redirectTo: redirectTo.toString(),
                hostname: redirectTo.hostname,
                activeUntil: !activeUntil || Number.isNaN(Date.parse(activeUntil)) ? undefined : new Date(activeUntil),
            })
            .returningAll()
            .executeTakeFirst();

        return shortenedUrl
            ? {
                  shortUrl: `${API_HOSTNAME}/${shortenedUrl.id}`,
                  redirectTo: shortenedUrl.redirectTo,
                  activeUntil: shortenedUrl.activeUntil,
              }
            : null;
    }
}
