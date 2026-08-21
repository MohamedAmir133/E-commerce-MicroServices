import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchProduct, SearchProductSchema } from './search/search-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URL_SEARCH') ??
          configService.get<string>('MongoDb-URL-SEARCH') ??
          'mongodb://localhost:27017/nestjs-microservices-search',
      }),
    }),
    MongooseModule.forFeature([
      {
        name: SearchProduct.name,
        schema: SearchProductSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
