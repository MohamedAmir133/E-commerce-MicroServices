import { NestFactory } from '@nestjs/core';
import { CatalogModule } from './catalog.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = 'catalog';
  const logger = new Logger('catalogBootstrap');
  // const port = Number(process.env.CATALOG_TCP_PORT ?? 4011);
  const rmqURL = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  const queue = process.env.CATALOG_QUEUE ?? 'catalog_queue';
  //CREATE MICROSERVICE INSTANCE
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
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
  logger.log(
    `Catalog is running on queue ${queue} with RabbitMQ URL ${rmqURL}`,
  );
}
bootstrap();
