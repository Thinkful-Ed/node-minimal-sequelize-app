-- this is the initial migration for our app.
-- it sets up a polls table.

CREATE TABLE polls (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	name TEXT NOT NULL,
	question TEXT NOT NULL,
	yes_votes INTEGER,
	no_votes INTEGER
);
