'use strict';

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize');
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {sequelize} = require('../db/sequelize');


const Poll = sequelize.define('Polls', {
    name: {
      type: Sequelize.TEXT,
      // this stops this column from being blank
      allowNull: false
    },
    question: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    yesVotes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'yes_votes'
    },
    noVotes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      field: 'no_votes'
    }
  }, {
    // we explicitly tell Sequelize that this model is based
    // on a table called 'polls' instead of having Sequelize
    // automatically determine table names, which can be error
    // prone
    tableName: 'polls',
    underscored: true,

    classMethods: {
      // relations between models are declared in `.classMethods.associate`.
      associate: function(models) {
        // no associations for this model so nothing here
      }
    }
  }
);

// Although we export `Poll` here, any code that needs `Poll`
// should import it from `./models/index.js` (so, for instance,
// `const {Poll} = require('./models')`).
module.exports = {
  Poll
};
