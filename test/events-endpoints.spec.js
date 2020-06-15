const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe('Events Enpoints', function () {
  let db;

  const { testUsers, testEvents } = helpers.makeEventsFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/events', () => {
    context('Given no events', () => {
      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers);
      });
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context('Given has events', () => {
      beforeEach('insert events and users', () => {
        helpers.seedEventsTables(db, testEvents);
        helpers.seedUsers(db, testUsers);
      });
      it('responds with 200', () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200);
      });
    });

    context('Given an XSS attack event', () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousEvent,
        expectedEvent,
      } = helpers.makeMaliciousEvent(testUser);

      beforeEach('insert malicious event', () => {
        return helpers.seedMaliciousEvent(
          db,
          testUser,
          maliciousEvent
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get('/api/events')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].title).to.eql(expectedEvent.title);
            expect(res.body[0].content).to.eql(expectedEvent.content);
          });
      });
    });
  });

  describe('POST /api/events', () => {
    beforeEach('insert users', () => {
      helpers.seedUsers(db, testUsers);
    });

    it('creates an event, responding with 201 and the new event', function () {
      this.retries(7);
      const testUser = testUsers[0];
      const newEvent = {
        title: 'diaper_changes',
        content: 'wet',
        user_id: testUser.id,
      };
      return supertest(app)
        .post('/api/events')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newEvent)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(newEvent.title);
          expect(res.body.user_id).to.eql(newEvent.user_id);
        });
    });
  });
});
