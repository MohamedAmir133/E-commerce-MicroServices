import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product/product.schema';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductEventsPubliser } from './events/product-events.publiser';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI_CATALOG ??
        process.env['MongoDb-URL-Catalog'] ??
        'mongodb://mongo:27017/nestjs-microservices-catalog',
    ),

    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    //two patterns
    // gateway -> http -> service
    // service -> rmq -> service

    // catalog talks directlt to search via RMQ client (NOT via gateway)
    ClientsModule.register([
      {
        name: 'SEARCH_EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],

          queue: process.env.SEARCH_QUEUE ?? 'search_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [CatalogController, ProductController],
  providers: [CatalogService, ProductService, ProductEventsPubliser],
})
export class CatalogModule {}
