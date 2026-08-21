import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { ProductsHttpController } from './products/products.controller';
import { SearchHttpController } from './search/search.controller';

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
          configService.get<string>('MONGO_URI_USERS') ??
          configService.get<string>('MongoDb-URL-Users') ??
          configService.get<string>('MongoDb-URL') ??
          'mongodb://localhost:27017/ace-shop-users',
      }),
    }),
    AuthModule,
    UsersModule,
    ClientsModule.register([
      {
        name: 'CATALOG_Client',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.CATALOG_QUEUE ?? 'catalog_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'SEARCH_Client',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.SEARCH_QUEUE ?? 'search_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'MEDIA_Client',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: process.env.MEDIA_QUEUE ?? 'media_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [GatewayController, ProductsHttpController, SearchHttpController],
  providers: [GatewayService],
})
export class GatewayModule {}
