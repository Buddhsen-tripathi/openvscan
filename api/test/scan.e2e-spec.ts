import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('ScanController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/scan (POST)', () => {
    it('should scan npm package successfully', () => {
      return request(app.getHttpServer())
        .post('/scan')
        .send({
          type: 'npm',
          target: 'lodash',
          version: '4.17.0',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('scanId');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('vulnerabilities');
          expect(res.body).toHaveProperty('summary');
          expect(res.body.target).toBe('lodash');
          expect(Array.isArray(res.body.vulnerabilities)).toBe(true);
        });
    });

    it('should scan package.json successfully', () => {
      const packageJson = JSON.stringify({
        dependencies: {
          lodash: '^4.17.0',
        },
      });

      return request(app.getHttpServer())
        .post('/scan')
        .send({
          type: 'package-json',
          target: packageJson,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('scanId');
          expect(res.body).toHaveProperty('vulnerabilities');
          expect(res.body).toHaveProperty('summary');
        });
    });

    it('should return 400 for invalid scan type', () => {
      return request(app.getHttpServer())
        .post('/scan')
        .send({
          type: 'invalid-type',
          target: 'some-package',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/scan')
        .send({
          type: 'npm',
        })
        .expect(400);
    });

    it('should return proper summary with vulnerability counts', () => {
      return request(app.getHttpServer())
        .post('/scan')
        .send({
          type: 'npm',
          target: 'test-package',
          version: '1.0.0',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toHaveProperty('critical');
          expect(res.body.summary).toHaveProperty('high');
          expect(res.body.summary).toHaveProperty('medium');
          expect(res.body.summary).toHaveProperty('low');
          expect(res.body.summary).toHaveProperty('total');
          expect(res.body.summary.total).toBe(
            res.body.summary.critical +
              res.body.summary.high +
              res.body.summary.medium +
              res.body.summary.low,
          );
        });
    });
  });
});
