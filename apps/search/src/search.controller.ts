import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { ProductCreatedDto } from './events/product-events.dto';
import { SearchQueryDto } from './search/search-query.dto';
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  //message pattern when using gateway -> rmq -> service
  //event pattern when using service to publish event and service to consume event

  @EventPattern('product.created')
  async onProductCreated(@Payload() event: ProductCreatedDto) {
    await this.searchService.upsertFromCatalogEvent({
      productId: event.productId,
      name: event.name,
      description: event.description,
      status: event.status,
      price: event.price,
    });
  }
  @MessagePattern('search.query')
  async query(@Payload() payload: SearchQueryDto) {
    return this.searchService.query({
      q: payload.q,
      limit: payload.limit,
    });
  }
  @MessagePattern('service.ping')
  ping() {
    return this.searchService.ping();
  }
}
