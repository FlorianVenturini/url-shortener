import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post } from '@nestjs/common';
import { Selectable } from 'kysely';

import { AppService } from './App.service';
import { BanHostnameBody } from './App.type';
import { DB } from './DB';

@Controller('/admin')
export class AdminController {
    constructor(private readonly appService: AppService) {}

    @Get('/info/:id')
    async getTotalClicks(@Param('id') id: string): Promise<Selectable<DB.Url> & { clicks: number }> {
        const url = await this.appService.getUrlWithClicks(id);

        if (!url) {
            throw new NotFoundException();
        }

        return url;
    }

    @Post('/ban-hostname')
    async banHostname(@Body() { hostname }: BanHostnameBody): Promise<Selectable<DB.BannedHostname>> {
        // Possible features:
        //   - handle wildcards for subdomains (ie. `*.example.com`)
        //   - Make sure hostname is valid (by interrogating a DNS)
        const ban = await this.appService.banHostname(hostname);

        if (!ban) {
            throw new InternalServerErrorException();
        }

        return ban;
    }
}
