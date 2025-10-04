import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "OpenVScan API is running!"', () => {
      expect(appController.getHello()).toBe('OpenVScan API is running!');
    });
  });

  describe('health', () => {
    it('should return { status: "ok" }', () => {
      expect(appController.getHealth()).toEqual({ status: 'ok' });
    });
  });
});
