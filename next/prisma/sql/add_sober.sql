BEGIN;
CREATE TABLE IF NOT EXISTS "Sober" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" VARCHAR(10) NOT NULL,
  "description" VARCHAR(500),
  "iconKey" TEXT NOT NULL,
  "iconColor" TEXT NOT NULL DEFAULT 'theme',
  "isPriority" BOOLEAN NOT NULL DEFAULT false,
  "initialStartedAt" TIMESTAMP(3) NOT NULL,
  "goalMode" TEXT NOT NULL DEFAULT 'AUTO',
  "goalDays" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sober_userId_name_key" UNIQUE ("userId", "name"),
  CONSTRAINT "Sober_goal_check" CHECK (("goalMode" = 'AUTO' AND "goalDays" IS NULL) OR ("goalMode" = 'MANUAL' AND "goalDays" BETWEEN 1 AND 36500))
);
CREATE INDEX IF NOT EXISTS "Sober_userId_createdAt_idx" ON "Sober" ("userId", "createdAt");
CREATE TABLE IF NOT EXISTS "SoberRestart" (
  "id" SERIAL PRIMARY KEY,
  "soberId" INTEGER NOT NULL REFERENCES "Sober"("id") ON DELETE CASCADE,
  "restartedAt" TIMESTAMP(3) NOT NULL,
  "memo" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "SoberRestart_soberId_restartedAt_id_idx" ON "SoberRestart" ("soberId", "restartedAt", "id");
COMMIT;
