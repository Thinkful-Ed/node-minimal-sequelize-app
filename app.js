// we've separated out our app and server. `app`
// is responsible for coodrinating routes and middleware.
// server is responsible for serving the app defined
// in this file.

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const {Poll} = require('./models');

// Set up the express app
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/polls', (req, res) => Poll.findAll()
	.then(polls => {
    return res.json({polls: polls})
  })
);

app.get('/polls/:id', (req, res) => Poll.findById(req.params.id)
  .then(poll => res.json(poll))
);

app.post('/polls', (req, res) => {
  const requiredFields = ['name', 'question'];
  requiredFields.forEach(field => {
    // ensure that required fields have been sent over
    if (! (field in req.body && req.body[field])) {
        return res.status(400).json({message: `Must specify value for ${field}`});
     }
  });
  const pollData = {
    name: req.body.name,
    question: req.body.question
  }

  const optionalFields = ['yesVotes', 'noVotes'];
  optionalFields.forEach(field => {
    if (field in req.body && req.body[field] !== undefined) {
      pollData[field] = req.body[field];
    }
  });

  return Poll
    .create(pollData)
    .then(poll => res.status(201).json(poll))
    .catch(err => res.status(500).send({message: err.message}));
});

app.put('/polls/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['name', 'question', 'yesVotes', 'noVotes'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Poll
    // all key/value pairs in toUpdate will be updated.
    .update(toUpdate, {
      // we only update polls that have the id we sent in.
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/polls/:id', (req, res) => {
  return Poll
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(poll => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.use('*', (req, res) => res.status(404).json({message: 'Not Found'}));

module.exports = app;
