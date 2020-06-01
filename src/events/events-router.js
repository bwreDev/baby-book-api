const path = require('path');
const express = require('express');
const xss = require('xss');
const EventsService = require('./events-service');

const eventsRouter = express.Router();
const jsonParser = express.json();

const serializeEvent = (event) => ({
  id: event.id,
  title: event.title,
  content: xss(event.content),
  date_added: event.date_added,
  user_id: event.user_id,
});

eventsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    EventsService.getAllEvents(knexInstance)
      .then((events) => {
        res.json(events.map(serializeEvent));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, date_added, user_id } = req.body;
    const newEvent = { title, content, user_id };

    for (const [key, value] of Object.entries(newEvent))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`,
          },
        });
    newEvent.date_added = date_added;

    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then((event) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${event.id}`))
          .json(serializeEvent(event));
      })
      .catch(next);
  });

eventsRouter
  .route('/:event_id')
  .all((req, res, next) => {
    EventsService.getById(req.app.get('db'), req.params.event_id)
      .then((event) => {
        if (!folder) {
          return res.status(404).json({
            error: {
              message: 'Event does not exist',
            },
          });
        }
        res.event = event;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeEvent(res.event));
  })
  .delete((req, res, next) => {
    EventsService.deleteEvent(req.app.get('db'), req.params.event_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { content } = req.body;
    const eventToUpdate = {
      content,
    };

    const numberOfValues = Object.values(eventToUpdate).filter(
      Boolean
    ).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'content'.`,
        },
      });

    EventsService.updateEvent(
      req.app.get('db'),
      req.params.event_id,
      eventToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = eventsRouter;
