import { Module } from '@nestjs/common';

import { AppController } from '@/App.controller';
import { AppService } from '@/App.service';
import { DBModule } from '@/DB/DB.module';

@Module({
    imports: [DBModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
