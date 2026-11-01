-- Run during the matching application deployment, before prisma db push.
-- Take a database backup first. Dates and every existing completion link are preserved.
BEGIN;
LOCK TABLE "Diary", "Habit" IN ACCESS EXCLUSIVE MODE;
CREATE TABLE IF NOT EXISTS "HabitCompletion" (
  "habitId" INTEGER NOT NULL REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "date" VARCHAR(10) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("habitId", "date")
);
CREATE INDEX IF NOT EXISTS "HabitCompletion_date_idx" ON "HabitCompletion"("date");
DO $$
BEGIN
  IF to_regclass('"_DiaryHabit"') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM "_DiaryHabit" j JOIN "Diary" d ON d.id = j."A" JOIN "Habit" h ON h.id = j."B" WHERE d."UserId" <> h."UserId") THEN
      RAISE EXCEPTION 'Cross-account habit links must be reviewed before migration';
    END IF;
    INSERT INTO "HabitCompletion" ("habitId", "date", "createdAt")
      SELECT j."B", d."date", d."createdAt" FROM "_DiaryHabit" j JOIN "Diary" d ON d.id = j."A"
      ON CONFLICT ("habitId", "date") DO NOTHING;
    IF EXISTS (SELECT 1 FROM "_DiaryHabit" j JOIN "Diary" d ON d.id = j."A" LEFT JOIN "HabitCompletion" c ON c."habitId" = j."B" AND c."date" = d."date" WHERE c."habitId" IS NULL) THEN
      RAISE EXCEPTION 'Completion migration verification failed';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'Diary' AND column_name = 'visible') THEN
    IF EXISTS (SELECT 1 FROM "Image" i JOIN "Diary" d ON d.id = i."diaryId" WHERE NOT d.visible) OR EXISTS (SELECT 1 FROM "Diary" WHERE NOT visible AND text NOT IN ('', '-')) THEN
      RAISE EXCEPTION 'Hidden diaries contain content: inspect before migrating';
    END IF;
    DROP TABLE IF EXISTS "_DiaryHabit";
    DELETE FROM "Diary" WHERE NOT visible;
    ALTER TABLE "Diary" DROP COLUMN visible;
  END IF;
END $$;
COMMIT;
