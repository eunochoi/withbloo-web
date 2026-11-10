-- Apply after add_activity_records.sql and before deploying the updated application.
BEGIN;
CREATE TABLE "HabitMemoImage" (
  "id" SERIAL PRIMARY KEY,
  "habitMemoId" INTEGER NOT NULL REFERENCES "HabitMemo"("id") ON DELETE CASCADE,
  "imageContentId" TEXT NOT NULL REFERENCES "ImageContent"("id") ON DELETE RESTRICT,
  "position" INTEGER NOT NULL CHECK ("position" BETWEEN 0 AND 4),
  UNIQUE ("habitMemoId", "position")
);
CREATE INDEX "HabitMemoImage_imageContentId_idx" ON "HabitMemoImage"("imageContentId");
CREATE TABLE "SoberRecordImage" (
  "id" SERIAL PRIMARY KEY,
  "soberRecordId" INTEGER NOT NULL REFERENCES "SoberRestart"("id") ON DELETE CASCADE,
  "imageContentId" TEXT NOT NULL REFERENCES "ImageContent"("id") ON DELETE RESTRICT,
  "position" INTEGER NOT NULL CHECK ("position" BETWEEN 0 AND 4),
  UNIQUE ("soberRecordId", "position")
);
CREATE INDEX "SoberRecordImage_imageContentId_idx" ON "SoberRecordImage"("imageContentId");
COMMIT;
