import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('A/B Testing API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Authentication', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'testPassword123',
    };

    it('/api/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
          accessToken = res.body.accessToken;
        });
    });

    it('/api/auth/login (POST) - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(testUser)
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          accessToken = res.body.accessToken;
        });
    });

    it('/api/auth/register (POST) - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });
  });

  describe('Feature Flags', () => {
    let flagId: string;
    const flagData = {
      key: `test_flag_${Date.now()}`,
      name: 'Test Flag',
      description: 'A test feature flag',
      type: 'BOOLEAN',
    };

    it('/api/flags (POST) - should create a flag', () => {
      return request(app.getHttpServer())
        .post('/api/flags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(flagData)
        .expect(201)
        .expect((res) => {
          expect(res.body.key).toBe(flagData.key);
          expect(res.body.name).toBe(flagData.name);
          flagId = res.body.id;
        });
    });

    it('/api/flags (GET) - should list flags', () => {
      return request(app.getHttpServer())
        .get('/api/flags')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toBeDefined();
        });
    });

    it('/api/flags/:id (GET) - should get a flag by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/flags/${flagId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(flagId);
        });
    });

    it('/api/flags/:id/toggle (PATCH) - should toggle flag', () => {
      return request(app.getHttpServer())
        .patch(`/api/flags/${flagId}/toggle`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.enabled).toBe(true);
        });
    });
  });

  describe('Decision API', () => {
    it('/client/decide (POST) - should return flag decisions', () => {
      return request(app.getHttpServer())
        .post('/client/decide')
        .send({
          clientId: 'test-client-123',
          flagKeys: ['dark_mode', 'non_existent_flag'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('dark_mode');
          expect(res.body).toHaveProperty('non_existent_flag');
        });
    });
  });
});


