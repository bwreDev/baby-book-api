const EventsService = {
  getAllEvents(knex, user_id) {
    return knex.from('events').select('*').where('user_id', user_id);
  },
  getById(knex, id) {
    console.log(id, 'id is');
    return knex
      .from('events')
      .select('*')
      .leftJoin('users AS user', 'events.user_id', 'user.id')
      .where('events.id', id)
      .first();
  },

  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then(([event]) => event)
      .then((event) => EventsService.getById(knex, event.id));
  },

  deleteEvent(knex, id) {
    return knex.from('events').where({ id }).delete();
  },
};

module.exports = EventsService;
