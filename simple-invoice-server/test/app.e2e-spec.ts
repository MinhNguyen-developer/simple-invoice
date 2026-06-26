import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('SimpleInvoice E2E', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpass' })
        .expect(401);
    });

    it('returns 400 with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);
    });
  });

  describe('GET /invoices (without auth)', () => {
    it('returns 401 when no JWT provided', () => {
      return request(app.getHttpServer()).get('/invoices').expect(401);
    });
  });

  describe('POST /invoices validation', () => {
    it('returns 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/invoices')
        .send({ invoiceNumber: 'TEST001' })
        .expect(401);
    });
  });
});
