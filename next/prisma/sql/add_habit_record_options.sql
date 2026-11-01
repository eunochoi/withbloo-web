-- Run with the old app stopped, BEFORE deploying the new app or running db push.
-- Existing priorities 0/1/2 become 1/2/3; 0 is reserved for free records.
-- The marker and all data/schema changes commit together, so reruns are safe.
BEGIN;
LOCK TABLE "Habit" IN ACCESS EXCLUSIVE MODE;
CREATE TABLE IF NOT EXISTS "_TookDataMigration" (
  "name" TEXT PRIMARY KEY,
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "_TookDataMigration" WHERE "name" = 'habit_record_options_v1') THEN
    IF EXISTS (SELECT 1 FROM "Habit" WHERE "priority" NOT BETWEEN 0 AND 2) THEN
      RAISE EXCEPTION 'Expected legacy priorities 0..2; inspect data before migration';
    END IF;
    ALTER TABLE "Habit" ADD COLUMN "iconColor" VARCHAR(32) NOT NULL DEFAULT 'theme';
    ALTER TABLE "Habit" ADD COLUMN "initialStartedAt" TIMESTAMP(3);
    UPDATE "Habit" SET "priority" = "priority" + 1, "initialStartedAt" = "createdAt";
    ALTER TABLE "Habit" ALTER COLUMN "initialStartedAt" SET NOT NULL;
    ALTER TABLE "Habit" ALTER COLUMN "initialStartedAt" SET DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "Habit" ADD CONSTRAINT "Habit_priority_range" CHECK ("priority" BETWEEN 0 AND 3);
    INSERT INTO "_TookDataMigration" ("name") VALUES ('habit_record_options_v1');
  END IF;
END $$;
COMMIT;
