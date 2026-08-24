import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'orders';
  const logger = new Logger('OrdersBootstrap');
  const rmqURL = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  const queue = process.env.ORDERS_QUEUE ?? 'orders_queue';
  //CREATE MICROSERVICE INSTANCE
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqURL],
        queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  applyToMicroserviceLayer(app);
  app.enableShutdownHooks();
  await app.listen();
  logger.log(`Orders is running on queue ${queue} with RabbitMQ URL ${rmqURL}`);
}
void bootstrap();
