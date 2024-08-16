import 'dotenv/config';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/App.module';

describe('UrlShortener (e2e)', () => {
    let app: INestApplication;
    const createdIds = new Map<string, string>();

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('POST / -> With valid body', async () => {
        const res = await request(app.getHttpServer()).post('/').send({ redirectTo: 'https://google.com' }).expect(201);
        expect(res.body.redirectTo).toEqual('https://google.com/');
        createdIds.set(res.body.redirectTo, res.body.id);
    });

    it('GET /:id -> With valid ID', async () =>
        request(app.getHttpServer())
            .get(`/${createdIds.get('https://google.com/')}`)
            .expect(301)
            .expect('Location', 'https://google.com/'));

    it('GET /:id -> With wrong ID', async () =>
        request(app.getHttpServer())
            .get(`/thisShouldBeAWrongId`)
            .expect(404)
            .expect({ message: 'Not Found', statusCode: 404 }));

    it('POST / -> With URL that already exists', async () => {
        const res = await request(app.getHttpServer()).post('/').send({ redirectTo: 'https://google.com' }).expect(201);
        expect(res.body.redirectTo).toEqual('https://google.com/');
        expect(createdIds.get('https://google.com/')).toEqual(res.body.id);
    });
});
