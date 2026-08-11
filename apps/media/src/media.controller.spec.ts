import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaController', () => {
  let mediaController: MediaController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [MediaService],
    }).compile();

    mediaController = app.get<MediaController>(MediaController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mediaController.getHello()).toBe('Hello World!');
    });
  });
});
