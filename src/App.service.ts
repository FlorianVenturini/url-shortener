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
}
