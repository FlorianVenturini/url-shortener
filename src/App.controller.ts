import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AppService } from './App.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get(':id')
    async resolveUrl(@Res() res: Response, @Param('id') id: string): Promise<void> {
        const url = await this.appService.getUrlById(id);

        if (!url) {
            throw new NotFoundException();
        }

        await this.appService.incrementUrlClickCounter(url.id);

        return res.redirect(301, url.redirectTo);
    }
}
