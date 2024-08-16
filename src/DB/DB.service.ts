import { Injectable } from '@nestjs/common';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import * as DB from '@/DB/kysely-types';
import { DATABASE_URL } from '@/utils/env';

@Injectable()
export class DBService {
    public kysely: Kysely<DB.DB>;

    constructor() {
        this.kysely = new Kysely<DB.DB>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    connectionString: DATABASE_URL,
                    max: 10,
                    idleTimeoutMillis: 20_000,
                }),
            }),
            plugins: [new CamelCasePlugin()],
        });
    }
}
