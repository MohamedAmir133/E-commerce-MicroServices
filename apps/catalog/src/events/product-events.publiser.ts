import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductEventsPubliser {
  private readonly logger = new Logger(ProductEventsPubliser.name);

  constructor(
    @Inject('SEARCH_EVENTS_CLIENT') private readonly searchClient: ClientProxy,
  ) {}

  async productCreated(payload: {
    productId: string;
    name: string;
    description: string;
    status: string;
    price: number;
    imageUrl?: string;
    createdByClerkUserId: string;
  }) {
    this.searchClient.emit('product.created', payload);
    this.logger.log(`product.created emitted for ${payload.productId}`);
  }
}
