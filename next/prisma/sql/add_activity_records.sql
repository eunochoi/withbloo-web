-- Apply before deploying the new client. Existing restart IDs and timestamps are preserved.
BEGIN;
CREATE TYPE "SoberRecordType" AS ENUM ('MEMO', 'RESTART');
ALTER TABLE "SoberRestart" ADD COLUMN "type" "SoberRecordType" NOT NULL DEFAULT 'RESTART';
ALTER TABLE "SoberRestart" ADD CONSTRAINT "SoberRestart_memo_required" CHECK ("type" <> 'MEMO' OR length(trim("memo")) > 0 AND "memo" IS NOT NULL);
CREATE INDEX "SoberRestart_soberId_type_restartedAt_id_idx" ON "SoberRestart"("soberId", "type", "restartedAt", "id");
CREATE TABLE "HabitMemo" (
 "id" SERIAL PRIMARY KEY, "habitId" INTEGER NOT NULL REFERENCES "Habit"("id") ON DELETE CASCADE,
 "recordedAt" TIMESTAMP(3) NOT NULL, "memo" VARCHAR(500) NOT NULL CHECK(length(trim("memo")) > 0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "HabitMemo_habitId_recordedAt_id_idx" ON "HabitMemo"("habitId", "recordedAt", "id");
COMMIT;
