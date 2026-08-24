import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { RpcAllExceptionFilter } from '@app/rpc';

async function bootstrap() {
  process.title = 'users';
  const logger = new Logger('UsersBootstrap');
  const rmqURL = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  const queue = process.env.USERS_QUEUE ?? 'users_queue';

  // CREATE MICROSERVICE INSTANCE
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
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

  // Use transform: true so plain JSON payloads are converted to class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Don't reject unknown fields from RMQ payloads
      transform: true,             // Convert plain object to class instance
    }),
  );
  app.useGlobalFilters(new RpcAllExceptionFilter());
  app.enableShutdownHooks();
  await app.listen();
  logger.log(`Users is running on queue ${queue} with RabbitMQ URL ${rmqURL}`);
}
void bootstrap();

