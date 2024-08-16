import { Module } from '@nestjs/common';

import { AppController } from './App.controller';
import { AppService } from './App.service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
