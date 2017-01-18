// when run from the command line with
// `npm run-script seedDb`, this file will create
// 10 new polls with randomly generated names and
// questions in the database.

const faker = require('faker');

const {sequelize} = require('./db/sequelize');
const {Poll} = require('./models');


const polls = [];

const seedNum = 10;

for (let i=0; i<=seedNum-1; i++) {
  polls.push(
    Poll.create({
      name: faker.lorem.words(),
      question: faker.lorem.words(),
      yesVotes: 5,
      noVotes: 5
    })
    .catch(err => {
      console.error(`Something went wrong: ${err.message}`);
      throw err;
    })
  );
}

Promise.all(polls).then(() => {
  console.log(`Seeded db with ${seedNum} new polls`);
  console.log('Closing connection to db');
  sequelize.close();
});
