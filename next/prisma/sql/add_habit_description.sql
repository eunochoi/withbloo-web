-- Add before deploying code that reads the new field. Existing habits retain NULL.
ALTER TABLE "Habit" ADD COLUMN IF NOT EXISTS "description" VARCHAR(100);
