const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app')
const {Poll} = require('../models');

chai.use(chaiHttp);

function seedData(seedNum=10) {
  const polls = [];
  for (let i=1; i<=seedNum; i++) {
    polls.push(
      // this returns a promise
      Poll.create({
        name: faker.lorem.words(),
        question: faker.lorem.words()
        // yesVotes and noVotes will be set to 0 by default
      })
    );
  }
  return Promise.all(polls);
}


describe('Polls API resource', function() {

  // to make tests quicker, only drop all rows from each
  // table in between tests, instead of recreating tables
  beforeEach(function() {
    return Poll
      // .truncate drops all rows in this table
      .truncate({cascade: true})
      // then seed db with new test data
      .then(() => seedData());
  });


  describe('GET endpoint', function() {

    it('should return all existing polls', function() {
      // strategy:
      //    1. get back all polls returned by by GET request to `/polls`
      //    2. prove res has right status, data type
      //    3. prove the number of polls we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;

      return chai.request(app)
        .get('/polls')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.polls.should.have.length.of.at.least(1);
          return Poll.count();
        })
        .then(function(count) {
          res.body.polls.should.have.length.of(count);
        });
    });

    it('should return a single poll by id', function() {
      // strategy:
      //    1. Get a poll from db
      //    2. Prove you can retrieve it by id at `/polls/:id`
      let poll;
      return Poll
        .findOne()
        .then(_poll => {
          poll = _poll
          return chai.request(app).get(`/polls/${poll.id}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.id.should.equal(poll.id);
        });
    });

    it('should return polls with right fields', function() {
      // Strategy: Get back all polls, and ensure they have expected keys

      let resPoll;
      return chai.request(app)
        .get('/polls')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.polls.should.be.a('array');
          res.body.polls.should.have.length.of.at.least(1);

          res.body.polls.forEach(function(poll) {
            poll.should.be.a('object');
            poll.should.include.keys(
              'id', 'name', 'question', 'yesVotes', 'noVotes');
          });
          resPoll = res.body.polls[0];
          return Poll.findById(resPoll.id);
        })
        .then(function(poll) {
          resPoll.id.should.equal(poll.id);
          resPoll.name.should.equal(poll.name);
          resPoll.question.should.equal(poll.question);
          resPoll.noVotes.should.equal(poll.noVotes);
          resPoll.yesVotes.should.equal(poll.yesVotes);
      });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the poll we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new poll', function() {

      const newPollData = {
        name: faker.lorem.words(),
        question: faker.lorem.words(),
        yesVotes: 22,
        noVotes: 23
      };

      return chai.request(app).post('/polls').send(newPollData)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'name', 'question', 'yesVotes', 'noVotes');
          res.body.name.should.equal(newPollData.name);
          res.body.question.should.equal(newPollData.question);
          res.body.yesVotes.should.equal(newPollData.yesVotes);
          res.body.noVotes.should.equal(newPollData.noVotes);

          return Poll.findById(res.body.id);
        })
        .then(function(poll) {
          poll.name.should.equal(newPollData.name);
          poll.question.should.equal(newPollData.question);
          poll.yesVotes.should.equal(newPollData.yesVotes);
          poll.noVotes.should.equal(newPollData.noVotes);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing poll from db
    //  2. Make a PUT request to update that poll
    //  3. Prove poll returned by request contains data we sent
    //  4. Prove poll in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        name: 'this is the new name',
        noVotes: 3737
      };

      return Poll
        .findOne()
        .then(function(poll) {
          updateData.id = poll.id;
          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/polls/${poll.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Poll.findById(updateData.id);
        })
        .then(function(poll) {
          poll.name.should.equal(updateData.name);
          poll.noVotes.should.equal(updateData.noVotes);
        });
      });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a poll
    //  2. make a DELETE request for that poll's id
    //  3. assert that response has right status code
    //  4. prove that poll with the id doesn't exist in db anymore
    it('delete a poll by id', function() {


      // TODO add assertions about associated grades being deleted
      let poll;

      return Poll
        .findOne()
        .then(function(_poll) {
          poll = _poll;
          return chai.request(app).delete(`/polls/${poll.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Poll.findById(poll.id);
        })
        .then(function(_poll) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_poll.should.be.null` would raise
          // an error. `should.be.null(_poll)` is how we can
          // make assertions about a null value.
          should.not.exist(_poll);
        });
    });
  });

});
