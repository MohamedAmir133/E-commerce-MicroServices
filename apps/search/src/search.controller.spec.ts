import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let searchController: SearchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [SearchService],
    }).compile();

    searchController = app.get<SearchController>(SearchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(searchController.getHello()).toBe('Hello World!');
    });
  });
});
