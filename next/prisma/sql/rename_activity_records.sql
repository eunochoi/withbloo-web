-- Apply once after add_activity_record_images.sql, with the matching application version.
-- The transaction preserves existing record and image IDs and all image relations.
BEGIN;
ALTER TABLE "HabitMemo" RENAME TO "HabitRecord";
ALTER TABLE "HabitRecord" RENAME COLUMN "memo" TO "text";
ALTER TABLE "HabitMemoImage" RENAME TO "HabitRecordImage";
ALTER TABLE "HabitRecordImage" RENAME COLUMN "habitMemoId" TO "habitRecordId";
ALTER TABLE "SoberRestart" RENAME TO "SoberRecord";
ALTER TABLE "SoberRecord" DROP CONSTRAINT IF EXISTS "SoberRestart_memo_required";
ALTER TABLE "SoberRecord" ADD COLUMN "isRestart" BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE "SoberRecord" SET "isRestart" = ("type" = 'RESTART');
ALTER TABLE "SoberRecord" DROP COLUMN "type";
ALTER TABLE "SoberRecord" RENAME COLUMN "restartedAt" TO "recordedAt";
ALTER TABLE "SoberRecord" RENAME COLUMN "memo" TO "text";
ALTER TABLE "SoberRecord" ADD CONSTRAINT "SoberRecord_text_required" CHECK ("isRestart" OR ("text" IS NOT NULL AND length(trim("text")) > 0));
CREATE INDEX "SoberRecord_soberId_isRestart_recordedAt_id_idx" ON "SoberRecord"("soberId", "isRestart", "recordedAt", "id");
COMMIT;
