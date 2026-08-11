import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  ping() {
    return {
      ok: true,
      service: 'catalog',
      now: new Date().toISOString(),
    };
  }
}
