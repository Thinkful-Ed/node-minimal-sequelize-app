-- the reversions folder is where we keep
-- reversion migrations that we can run
-- to reverse the changes by the migration.
-- we follow a convention of using the same file
-- name for both the migration and reversion.

-- since the original migration created a polls
-- table, we drop it here
BEGIN;

DROP TABLE polls;

COMMIT;