import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductCreatedEvent } from '../product/product.events';

@Injectable()
export class ProductEventsPublisher {
  private readonly logger = new Logger(ProductEventsPublisher.name);

  constructor(
    @Inject('SEARCH_EVENTS_CLIENT') private readonly searchClient: ClientProxy,
  ) {}
  async onModuleInit() {
    await this.searchClient.connect();

    this.logger.log('Connected to search queue');
  }
  async productCreated(event: ProductCreatedEvent) {
    try {
      await firstValueFrom(this.searchClient.emit('product.created', event));
    } catch (error) {
      this.logger.error(
        `Failed to emit product.created for ${event.productId}`,
        error,
      );
    }
  }
}
