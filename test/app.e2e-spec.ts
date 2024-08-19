import 'dotenv/config';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/App.module';

describe('UrlShortener (e2e)', () => {
    let app: INestApplication;
    let server: ReturnType<typeof app.getHttpServer>;
    const createdIds = new Map<string, URL>();

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        server = app.getHttpServer();
    });

    afterEach(async () => {
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
});
