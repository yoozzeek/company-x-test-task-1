import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import bootstrapApp from '../../src/bootstrap';
import { getConfig } from '../../src/config';

let globalVars: Awaited<ReturnType<typeof bootstrapApp>>;
let token: string;

beforeAll(async () => {
  const config = getConfig();
  globalVars = await bootstrapApp(config);
  await globalVars.app.ready();

  // Register and login user to get a token
  await supertest(globalVars.app.server)
    .post('/v1/auth/register')
    .send({ email: 'admin@example.com', password: 'Adm1nPassw0rd' });
  const loginRes = await supertest(globalVars.app.server)
    .post('/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'Adm1nPassw0rd' });
  token = loginRes.body.token;
});

afterAll(async () => {
  await globalVars?.app.close();
  await globalVars?.pgPool.end();
});

describe('Users API E2E', () => {
  it('should not allow unauthenticated access to user list (OWASP A01/A07)', async () => {
    const res = await supertest(globalVars.app.server).get('/v1/users/');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('should return a list of users for authenticated request', async () => {
    const res = await supertest(globalVars.app.server)
      .get('/v1/users/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('email');
    expect(res.body[0]).toHaveProperty('id');
  });
});
