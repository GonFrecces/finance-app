import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth + Score (e2e)', () => {
  let app: INestApplication<App>;

  const login = async (username: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post('/login')
      .send({ username, password })
      .expect(200);
    return (res.body as { access_token: string }).access_token;
  };

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'e2e-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /login con credenciales inválidas -> 401', () => {
    return request(app.getHttpServer())
      .post('/login')
      .send({ username: 'juan', password: 'mala' })
      .expect(401);
  });

  it('POST /login sin body válido -> 400', () => {
    return request(app.getHttpServer()).post('/login').send({}).expect(400);
  });

  it('GET /score sin token -> 401', () => {
    return request(app.getHttpServer()).get('/score/12.345.678-5').expect(401);
  });

  it('GET /score con token alterado -> 401', async () => {
    const token = await login('juan', 'User123!');
    return request(app.getHttpServer())
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${token}x`)
      .expect(401);
  });

  it('user consulta su propio RUT (cualquier formato) -> 200 y mismo score', async () => {
    const token = await login('juan', 'User123!');
    const a = await request(app.getHttpServer())
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const b = await request(app.getHttpServer())
      .get('/score/123456785')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(a.body).toMatchObject({ rut: '12.345.678-5' });
    expect((a.body as { score: number }).score).toBe(
      (b.body as { score: number }).score,
    );
  });

  it('user consulta otro RUT -> 403', async () => {
    const token = await login('juan', 'User123!');
    return request(app.getHttpServer())
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('admin consulta cualquier RUT -> 200', async () => {
    const token = await login('admin', 'Admin123!');
    return request(app.getHttpServer())
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('admin con RUT de DV inválido -> 400', async () => {
    const token = await login('admin', 'Admin123!');
    return request(app.getHttpServer())
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
