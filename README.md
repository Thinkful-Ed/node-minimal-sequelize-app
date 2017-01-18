# Minimal Express Sequelize App

To install dependencies, `npm install`.

To setup and initially seed the database, do:

* `createdb minimal-sequelize-app_DEV`
* `psql minimal-sequelize-app_DEV -f migrations/migrations/0001_polls_initial_migration.sql`
* `npm run-script seedDb`

To run, `npm start`.

To test, create test db (`createdb minimal-sequelize-app_TEST`
) then run `npm test`.



