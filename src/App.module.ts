import { Module } from '@nestjs/common';

import { AdminController } from './Admin.controller';
import { AppController } from './App.controller';
import { AppService } from './App.service';
import { DBModule } from './DB/DB.module';

@Module({
    imports: [DBModule],
    controllers: [AppController, AdminController],
    providers: [AppService],
})
export class AppModule {}
