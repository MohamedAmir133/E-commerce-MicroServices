import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // const app = await NestFactory.create(GatewayModule);
  // await app.listen(process.env.GATEWAY_PORT ?? 3000);
  process.title = 'gateway';
  const logger = new Logger('GatewayBootstrap');
  const app = await NestFactory.create(GatewayModule);
  app.enableShutdownHooks();
  const port = process.env.GATEWAY_PORT ?? 5000;
  await app.listen(port);
  logger.log(`Gateway is running on port ${port}`);
}
bootstrap();
