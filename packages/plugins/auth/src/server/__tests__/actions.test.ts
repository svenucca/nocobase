import Database, { Repository } from '@nocobase/database';
import UsersPlugin from '@nocobase/plugin-users';
import { mockServer, MockServer } from '@nocobase/test';
import AuthPlugin from '../';

describe('actions', () => {
  describe('authenticators', () => {
    let app: MockServer;
    let db: Database;
    let repo: Repository;
    let agent;

    beforeAll(async () => {
      app = mockServer();
      app.plugin(AuthPlugin);
      await app.loadAndInstall({ clean: true });
      db = app.db;
      repo = db.getRepository('authenticators');

      agent = app.agent();
    });

    afterEach(async () => {
      await repo.destroy({
        truncate: true,
      });
    });

    afterAll(async () => {
      await app.destroy();
    });

    it('should list authenticator types', async () => {
      const res = await agent.resource('authenticators').listTypes();
      expect(res.body.data).toEqual(['Email/Password']);
    });

    it('should return enabled authenticators with public options', async () => {
      await repo.destroy({
        truncate: true,
      });
      await repo.createMany({
        records: [
          { name: 'test', authType: 'testType', enabled: true, options: { public: { test: 1 }, private: { test: 2 } } },
          { name: 'test2', authType: 'testType' },
        ],
      });
      const res = await agent.resource('authenticators').publicList();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('test');
    });

    it('should keep at least one authenticator', async () => {
      await repo.createMany({
        records: [{ name: 'test', authType: 'testType', enabled: true }],
      });
      const res = await agent.resource('authenticators').destroy();
      expect(res.statusCode).toBe(400);
      expect(await repo.count()).toBe(1);
    });

    it('shoud enable at least one authenticator', async () => {
      await repo.createMany({
        records: [{ name: 'test', authType: 'testType', enabled: true }],
      });
      const res = await agent.resource('authenticators').update({
        filterByTk: 1,
        values: {
          enabled: false,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(await repo.count()).toBe(1);
    });
  });

  describe('auth', () => {
    let app: MockServer;
    let db: Database;
    let agent;

    beforeAll(async () => {
      app = mockServer();
      process.env.INIT_ROOT_EMAIL = 'test@nocobase.com';
      process.env.INIT_ROOT_PASSWORD = '123456';
      process.env.INIT_ROOT_NICKNAME = 'Test';
      app.plugin(AuthPlugin);
      app.plugin(UsersPlugin, { name: 'users' });
      await app.loadAndInstall({ clean: true });
      db = app.db;
      agent = app.agent();
    });

    afterAll(async () => {
      await app.destroy();
    });

    it('should sign in with email and password', async () => {
      let res = await agent.resource('auth').check();
      expect(res.body.data.id).toBeUndefined();

      res = await agent.post('/auth:signIn').set({ 'X-Authenticator': 'basic' }).send({
        email: process.env.INIT_ROOT_EMAIL,
        password: process.env.INIT_ROOT_PASSWORD,
      });
      expect(res.statusCode).toEqual(200);
      const data = res.body.data;
      const token = data.token;
      expect(token).toBeDefined();

      res = await agent.get('/auth:check').set({ Authorization: `Bearer ${token}`, 'X-Authenticator': 'basic' });
      expect(res.body.data.id).toBeDefined();
    });

    it('should disable sign up', async () => {
      let res = await agent.post('/auth:signUp').set({ 'X-Authenticator': 'basic' }).send({
        email: 'new',
        password: 'new',
      });
      expect(res.statusCode).toEqual(200);

      const repo = db.getRepository('authenticators');
      await repo.update({
        filter: {
          name: 'basic',
        },
        values: {
          options: {
            public: {
              allowSignUp: false,
            },
          },
        },
      });
      res = await agent.post('/auth:signUp').set({ 'X-Authenticator': 'basic' }).send({
        email: process.env.INIT_ROOT_EMAIL,
        password: process.env.INIT_ROOT_PASSWORD,
      });
      expect(res.statusCode).toEqual(403);
    });
  });
});
