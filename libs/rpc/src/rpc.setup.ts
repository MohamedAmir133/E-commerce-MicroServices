import { INestMicroservice } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { RpcAllExceptionFilter } from './rpc-exception.filter';
export function applyToMicroserviceLayer(app: INestMicroservice) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new RpcAllExceptionFilter());
}
