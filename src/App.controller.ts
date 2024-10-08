import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { AppService } from './App.service';
import { CreateShortUrlBody } from './App.type';

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

    @Post()
    async createShortUrl(
        @Body() { redirectTo, activeUntil }: CreateShortUrlBody,
    ): Promise<{ shortUrl: string; redirectTo: string; activeUntil: Date | null }> {
        // Possible "problem": someone tries to get a shortUrl that already exists but is not active anymore
        // -> option 1: reactivate the URL (ie. update activeUntil)
        // -> option 2: throw specific error
        // -> option 3: create new shortUrl
        // -> option 4: do nothing and return the shortUrl with activeUntil being in the past (current behavior)
        const url = new URL(redirectTo);
        const isHostnameBanned = await this.appService.isHostnameBanned(url.hostname);

        if (isHostnameBanned) {
            throw new BadRequestException({ error: 'Hostname is not allowed' });
        }

        const shortenedUrl = await this.appService.createShortUrl(url, activeUntil);
        if (!shortenedUrl) {
            throw new InternalServerErrorException();
        }

        return shortenedUrl;
    }
}
