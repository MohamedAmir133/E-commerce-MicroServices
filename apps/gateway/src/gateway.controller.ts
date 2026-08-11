import { Controller, Get, Inject } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from './auth/public.decorater';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    @Inject('CATALOG_Client') private readonly catalogClient: ClientProxy,
    @Inject('SEARCH_Client') private readonly searchClient: ClientProxy,
    @Inject('MEDIA_Client') private readonly mediaClient: ClientProxy,
  ) {}

  @Get('health')
  @Public()
  async health() {
    const ping = async (serviceName: string, client: ClientProxy) => {
      try {
        const result: unknown = await firstValueFrom(
          client.send('service.ping', { from: 'gateway' }),
        );
        return {
          ok: true,
          service: serviceName,
          result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error pinging ${serviceName}:`, err);
        return {
          ok: false,
          service: serviceName,
          now: new Date().toISOString(),
          error: message,
        };
      }
    };

    const [catalog, search, media] = await Promise.all([
      ping('catalog', this.catalogClient),
      ping('search', this.searchClient),
      ping('media', this.mediaClient),
    ]);

    const allOk = catalog.ok && search.ok && media.ok;

    return {
      ok: allOk,
      services: {
        catalog,
        search,
        media,
      },
    };
  }
}
