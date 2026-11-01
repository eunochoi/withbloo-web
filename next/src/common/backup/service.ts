import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import CryptoJS from "crypto-js";
import { Prisma } from "@prisma/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../../../lib/prisma";
import { createS3Client } from "../actions/image/utils";
import { getEnvValue } from "../utils/getEnvValue";
import { readArchive, writeArchive } from "./archive";
import { decryptBackup, encryptBackup } from "./container";
import { readDatabase, writeDatabase } from "./database";
import { validateBackupRecords } from "./records";
import { BackupError, MAX_BACKUP_BYTES, type BackupBundle } from "./types";
interface Owner {
  userId: number;
  email: string;
}
const photoLimit = 10 * 1024 * 1024;
async function snapshot(tx: Prisma.TransactionClient, userId: number) {
  const [diaries, habits, completions, sobers] = await Promise.all([
    tx.diary.findMany({
      where: { userId },
      include: {
        images: {
          include: { imageContent: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
        },
      },
      orderBy: { id: "asc" },
    }),
    tx.habit.findMany({ where: { userId }, orderBy: { id: "asc" } }),
    tx.habitCompletion.findMany({
      where: { habit: { userId } },
      orderBy: [{ habitId: "asc" }, { date: "asc" }],
    }),
    tx.sober.findMany({
      where: { userId },
      include: { restarts: { orderBy: { id: "asc" } } },
      orderBy: { id: "asc" },
    }),
  ]);
  return { diaries, habits, completions, sobers };
}
type Snapshot = Awaited<ReturnType<typeof snapshot>>;
export async function decodeBackup(
  bytes: Uint8Array,
  password: string,
  timezone: string,
): Promise<BackupBundle> {
  const plain = await decryptBackup(bytes, password);
  try {
    const { files, schemaVersion } = readArchive(plain);
    const records = await readDatabase(files["took.db"], schemaVersion);
    delete files["took.db"];
    const bundle = { records, media: files };
    validateBackupRecords(bundle, timezone);
    return bundle;
  } finally {
    plain.fill(0);
  }
}
export async function encodeBackup(
  bundle: BackupBundle,
  password: string,
  timezone: string,
) {
  validateBackupRecords(bundle, timezone);
  const database = await writeDatabase(bundle.records);
  const media: Record<string, Uint8Array> = {};
  for (const [name, source] of Object.entries(bundle.media))
    media[name] = typeof source === "string" ? await readFile(source) : source;
  const archive = writeArchive(database, media);
  try {
    return await encryptBackup(archive, password);
  } finally {
    database.fill(0);
    archive.fill(0);
  }
}
async function snapshotBundle(data: Snapshot, directory: string): Promise<BackupBundle> {
  const records: BackupBundle["records"] = {
    diaries: data.diaries.map((row) => ({
      id: row.id,
      date: row.date,
      text: CryptoJS.AES.decrypt(
        row.text,
        getEnvValue("DATA_SECRET_KEY"),
      ).toString(CryptoJS.enc.Utf8),
      emotion: row.emotion,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    })),
    habits: data.habits.map((row) => ({
      id: row.id,
      name: row.name,
      priority: row.priority,
      icon_key: row.iconKey,
      icon_color: row.iconColor,
      initial_started_at: row.initialStartedAt.toISOString(),
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    })),
    completions: data.completions.map((row) => ({
      habit_id: row.habitId,
      date: row.date,
      created_at: row.createdAt.toISOString(),
    })),
    sobers: data.sobers.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon_key: row.iconKey,
      icon_color: row.iconColor,
      is_priority: row.isPriority ? 1 : 0,
      initial_started_at: row.initialStartedAt.toISOString(),
      goal_mode: row.goalMode,
      goal_days: row.goalDays,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    })),
    soberRestarts: data.sobers.flatMap((row) =>
      row.restarts.map((item) => ({
        id: item.id,
        sober_id: row.id,
        restarted_at: item.restartedAt.toISOString(),
        memo: item.memo,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
      })),
    ),
    images: data.diaries.flatMap((row) =>
      row.images.map((image, position) => ({
        id: image.id,
        diary_id: row.id,
        file_name: `photo-${image.id}.jpg`,
        position,
      })),
    ),
  };
  const media: BackupBundle["media"] = Object.create(null);
  let total = Buffer.byteLength(JSON.stringify(records));
  const images = data.diaries.flatMap((row) => row.images);
  if (images.length) {
    const s3 = createS3Client();
    for (const image of images) {
      if (image.imageContent.status !== "READY")
        throw new BackupError(
          "준비되지 않은 사진이 있어요. 사진을 확인한 뒤 다시 백업해주세요.",
        );
      const object = await s3.send(
        new GetObjectCommand({
          Bucket: getEnvValue("OCI_BUCKET_NAME"),
          Key: image.imageContent.storagePath,
        }),
      );
      if (!object.Body || (object.ContentLength ?? 0) > photoLimit)
        throw new BackupError("사진 파일을 백업할 수 없습니다.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      for await (const chunk of object.Body as AsyncIterable<Uint8Array>) {
        size += chunk.length;
        total += chunk.length;
        if (size > photoLimit || total > MAX_BACKUP_BYTES)
          throw new BackupError(
            "사진을 포함한 웹 백업은 최대 1GB까지 지원해요.",
          );
        chunks.push(chunk);
      }
      const bytes = Buffer.concat(chunks);
      if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255)
        throw new BackupError(
          "JPEG 사진만 앱 호환 백업에 포함할 수 있어요. 사진을 확인해주세요.",
        );
      const path = join(directory, `photo-${image.id}.jpg`);
      await writeFile(path, bytes, { mode: 0o600 });
      media[`media/photo-${image.id}.jpg`] = path;
    }
  }
  return { records, media };
}
export async function exportBackupFile(owner: Owner, password: string, timezone: string, directory: string) {
  const { cryptBackupFile, writeArchiveFile } = await import("./files");
  const data = await prisma.$transaction((tx) => snapshot(tx, owner.userId), {
    isolationLevel: "RepeatableRead", timeout: 30000,
  });
  const bundle = await snapshotBundle(data, directory);
  validateBackupRecords(bundle, timezone);
  const database = await writeDatabase(bundle.records);
  const databasePath = join(directory, "outgoing.db");
  try { await writeFile(databasePath, database, { mode: 0o600 }); }
  finally { database.fill(0); }
  const archive = join(directory, "outgoing.zip");
  await writeArchiveFile(archive, { "took.db": databasePath, ...bundle.media as Record<string, string> });
  const path = join(directory, "outgoing.bloo");
  await cryptBackupFile(archive, path, password, true);
  return { path };
}
