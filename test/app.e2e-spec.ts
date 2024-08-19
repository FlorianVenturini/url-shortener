import 'dotenv/config';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/App.module';
import { DBService } from '../src/DB/DB.service';

describe('UrlShortener (e2e)', () => {
    let app: INestApplication;
    let server: ReturnType<typeof app.getHttpServer>;
    const createdIds = new Map<string, URL>();
    const bannedHostnames = new Set<string>();

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        server = app.getHttpServer();
    });

    afterAll(async () => {
        const db = app.get<DBService>(DBService);
        if (createdIds.size > 0) {
            // Clear urls
            await db.kysely
                .deleteFrom('urls')
                .where(
                    'id',
                    'in',
                    Array.from(createdIds.values()).map((u) => u.pathname.slice(1)),
                )
                .execute();
        }

        if (bannedHostnames.size > 0) {
            // Clear bans
            await db.kysely
                .deleteFrom('bannedHostnames')
                .where('id', 'in', Array.from(bannedHostnames.values()))
                .execute();
        }

        await app.close();
        await server.close();
    });

    it('POST / -> With valid body', async () => {
        const res = await request(server).post('/').send({ redirectTo: 'https://google.com' }).expect(201);
        expect(res.body.redirectTo).toEqual('https://google.com/');
        createdIds.set(res.body.redirectTo, new URL(res.body.shortUrl));
    });

    it('GET /:id -> With valid ID', async () =>
        request(server)
            .get(createdIds.get('https://google.com/')?.pathname ?? '/thisShouldBeAWrongId')
            .expect(301)
            .expect('Location', 'https://google.com/'));

    it('GET /:id -> With wrong ID', async () =>
        request(server).get(`/thisShouldBeAWrongId`).expect(404).expect({ message: 'Not Found', statusCode: 404 }));

    it('POST / -> With URL that already exists', async () => {
        const res = await request(server).post('/').send({ redirectTo: 'https://google.com' }).expect(201);
        expect(res.body.redirectTo).toEqual('https://google.com/');
        expect(createdIds.get('https://google.com/')?.toString()).toEqual(new URL(res.body.shortUrl).toString());
    });

    it('POST /admin/ban-hostname', async () => {
        const res = await request(server).post('/admin/ban-hostname').send({ hostname: 'google.com' }).expect(201);
        expect(res.body.hostname).toEqual('google.com');
        bannedHostnames.add(res.body.id);
    });

    it('GET /:id -> ID that has been banned should not be available anymore', async () =>
        request(server)
            .get(createdIds.get('https://google.com/')?.pathname ?? '/thisShouldBeAWrongId')
            .expect(404));

    it('POST / -> Trying to create a shortUrl for a banned hostname should not be possible', async () =>
        request(server).post('/').send({ redirectTo: 'https://google.com/new/url' }).expect(400));
});
