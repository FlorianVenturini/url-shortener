import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { DATABASE_URL } from '../utils/env';

import * as DB from './kysely-types';

@Injectable()
export class DBService implements OnModuleDestroy {
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

    async onModuleDestroy(): Promise<void> {
        await this.kysely.destroy();
    }
}
