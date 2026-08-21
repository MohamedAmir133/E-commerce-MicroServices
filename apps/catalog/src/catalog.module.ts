import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product/product.schema';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductEventsPublisher } from './events/product-events.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI_CATALOG') ??
          configService.get<string>('MongoDb-URL-Catalog') ??
          'mongodb://localhost:27017/nestjs-microservices-catalog',
      }),
    }),

    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    //two patterns
    // gateway -> http -> service
    // service -> rmq -> service

    // catalog talks directly to search via RMQ client (NOT via gateway)
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
  providers: [CatalogService, ProductService, ProductEventsPublisher],
})
export class CatalogModule {}
