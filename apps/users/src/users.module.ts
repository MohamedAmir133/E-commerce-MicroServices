import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') ?? 'localhost',
        port: configService.get<number>('POSTGRES_PORT') ?? 5432,
        username: configService.get<string>('POSTGRES_USER') ?? 'postgres',
        password: configService.get<string>('POSTGRES_PASSWORD') ?? 'password',
        database: configService.get<string>('POSTGRES_DB') ?? 'users_db',
        entities: [UserEntity],
        synchronize: true, // Auto-create schema in development
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

