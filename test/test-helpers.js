const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      first_name: 'Test user 1',
      last_name: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      first_name: 'Test user 2',
      last_name: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      first_name: 'Test user 3',
      last_name: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      first_name: 'Test user 4',
      last_name: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeEventsArray(users) {
  return [
    {
      id: 1,
      title: 'diaper_changes',
      user_id: users[0].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      content: 'wet',
    },
    {
      id: 2,
      title: 'feedings',
      user_id: users[1].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      content: 'nursing 3 oz',
    },
    {
      id: 3,
      title: 'appointments',
      user_id: users[2].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Chiro 2020-06-15',
    },
    {
      id: 4,
      title: 'stretches',
      user_id: users[3].id,
      date_added: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Back',
    },
  ];
}

function makeExpectedEvent(users, event = []) {
  const user = users.find((user) => user.id === event.user_id);

  return {
    id: event.id,
    title: event.title,
    content: event.content,
    date_added: event.date_added.toISOString(),
    user: {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      date_created: user.date_created.toISOString(),
    },
  };
}

function makeMaliciousEvent(user) {
  const maliciousEvent = {
    id: 911,
    date_added: new Date(),
    title: 'appointments',
    user_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedEvent = {
    ...makeExpectedEvent([user], maliciousEvent),
    title: 'appointments',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousEvent,
    expectedEvent,
  };
}

function makeEventsFixtures() {
  const testUsers = makeUsersArray();
  const testEvents = makeEventsArray(testUsers);
  return { testUsers, testEvents };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        events,
        users
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE events_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('events_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [
        users[users.length - 1].id,
      ])
    );
}

function seedEventsTables(db, users, events = []) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into('events').insert(events);

    await trx.raw(`SELECT setval('events_id_seq', ?)`, [
      events[events.length - 1].id,
    ]);
  });
}

function seedMaliciousEvent(db, user, event) {
  return seedUsers(db, [user]).then(() =>
    db.into('events').insert([event])
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeEventsArray,
  makeExpectedEvent,
  makeMaliciousEvent,
  makeEventsFixtures,
  cleanTables,
  seedEventsTables,
  seedMaliciousEvent,
  makeAuthHeader,
  seedUsers,
};
