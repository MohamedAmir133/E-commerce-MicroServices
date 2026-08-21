import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '../auth/public.decorater';
import { mapRpcErrorToHttp } from '@app/rpc';
import { firstValueFrom } from 'rxjs';

@Controller()
export class SearchHttpController {
  constructor(
    @Inject('SEARCH_Client') private readonly searchClient: ClientProxy,
  ) {}

  @Get('search')
  @Public()
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    const limitNo =
      typeof limit === 'string' && limit.trim() ? Number(limit) : undefined;

    try {
      const results = await firstValueFrom(
        this.searchClient.send('search.query', {
          q,
          limit: limitNo,
        }),
      );

      return {
        q,
        count: Array.isArray(results) ? results.length : 0,
        results,
      };
    } catch (err) {
      mapRpcErrorToHttp(err);
    }
  }
}
