import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './App.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}

bootstrap();
