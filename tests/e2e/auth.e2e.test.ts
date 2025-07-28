import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import bootstrapApp from '../../src/bootstrap';
import { getConfig } from '../../src/config';

let globalVars: Awaited<ReturnType<typeof bootstrapApp>>;

beforeAll(async () => {
  const config = getConfig();
  globalVars = await bootstrapApp(config);
  await globalVars.app.ready();
});

afterAll(async () => {
  await globalVars?.app.close();
  await globalVars?.pgPool.end();
});

describe('Auth API E2E', () => {
  it('should register a new user (happy path)', async () => {
    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'alice@example.com', password: 'veryStrong1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it('should not allow registration with invalid email', async () => {
    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'bad-email', password: 'validPass1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should not allow registration with weak password', async () => {
    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'bob@example.com', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should not allow duplicate email registration (OWASP A01:2021)', async () => {
    await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'carol@example.com', password: 'goodPassword1' });

    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'carol@example.com', password: 'anotherGood1' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('should login and return a JWT', async () => {
    await supertest(globalVars.app.server)
      .post('/v1/auth/register')
      .send({ email: 'dave@example.com', password: 'SuperPass12' });

    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/login')
      .send({ email: 'dave@example.com', password: 'SuperPass12' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('should not login with invalid credentials', async () => {
    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/login')
      .send({ email: 'notfound@example.com', password: 'badpass' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // OWASP A07:2021 – Identification and Authentication Failures
  // it('should lock account after multiple failed logins (rate limiting)', async () => {
  //   await supertest(globalVars.app.server)
  //     .post('/v1/auth/register')
  //     .send({ email: 'eve@example.com', password: 'ValidPassw0rd' });
  //
  //   // simulate failed logins
  //   for (let i = 0; i < 5; i++) {
  //     await supertest(globalVars.app.server)
  //       .post('/v1/auth/login')
  //       .send({ email: 'eve@example.com', password: 'wrongpassword' });
  //   }
  //
  //   // now test for lockout or error (if implemented)
  //   const res = await supertest(globalVars.app.server)
  //     .post('/v1/auth/login')
  //     .send({ email: 'eve@example.com', password: 'ValidPassw0rd' });
  //
  //   expect([400, 429, 403]).toContain(res.statusCode);
  //   // Optional: check for lockout message
  //   expect(res.body.error).toMatch(/locked|limit|too many/i);
  // });

  // OWASP A05:2021 – Security Misconfiguration
  it('should not expose stack traces or internal error details', async () => {
    // Simulate error (maybe missing DB, or manual error route)
    const res = await supertest(globalVars.app.server).get('/v1/non-existent-endpoint');
    expect([404, 500]).toContain(res.statusCode);
    expect(res.body).not.hasOwnProperty('stack');
    expect(res.body).not.toHaveProperty('internalDetails');
  });

  // OWASP A03:2021 – Injection (try SQLi, expect fail)
  it('should be protected from SQL injection', async () => {
    const res = await supertest(globalVars.app.server)
      .post('/v1/auth/login')
      .send({ email: "' OR 1=1--", password: 'any' });
    expect([400, 401]).toContain(res.statusCode);
  });
});
