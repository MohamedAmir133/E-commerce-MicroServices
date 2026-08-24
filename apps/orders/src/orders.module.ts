import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') ?? 'localhost',
        port: Number(configService.get<string>('POSTGRES_PORT') ?? 5432),
        username: configService.get<string>('POSTGRES_USER') ?? 'postgres',
        password: configService.get<string>('POSTGRES_PASSWORD') ?? 'password',
        database: configService.get<string>('POSTGRES_DB') ?? 'users_db',
        entities: [OrderEntity],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
