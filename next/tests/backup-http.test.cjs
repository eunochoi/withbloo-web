const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { NextRequest } = require("next/server");
const sourceLoader = require("./load-source.cjs");
let authorized = true;
const load = sourceLoader({
  [path.resolve(__dirname, "../src/common/auth/getAuth.ts")]: {
    getAuth: async () =>
      authorized
        ? { ok: true, userId: 987654, email: "fixture@test.local" }
        : { ok: false },
  },
  [path.resolve(__dirname, "../src/common/utils/date/userTimezone.ts")]: {
    getUserTimezone: async () => "Asia/Seoul",
  },
});
const { withBackupRequest, readExportRequest } = load(
  "common/backup/http.ts",
);
const { BackupError } = load("common/backup/types.ts");
const request = (origin = "http://localhost:3000") =>
  new NextRequest("http://localhost:3000/api/backup/export", {
    method: "POST",
    headers: { host: "localhost:3000", origin },
  });

test("backup operations require same-origin requests and account authentication", async () => {
  let called = 0;
  const action = async () => {
    called++;
    return new Response("ok");
  };
  assert.equal(
    (await withBackupRequest(request("https://other.example"), action)).status,
    403,
  );
  authorized = false;
  assert.equal((await withBackupRequest(request(), action)).status, 401);
  authorized = true;
  assert.equal(called, 0);
  const response = await withBackupRequest(request(), action);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(called, 1);
});

test("overlapping operations are rejected and failure releases the operation lock", async () => {
  let release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  let entered;
  const ready = new Promise((resolve) => {
    entered = resolve;
  });
  const first = withBackupRequest(request(), async () => {
    entered();
    await wait;
    throw new BackupError("test cancellation");
  });
  await ready;
  assert.equal(
    (await withBackupRequest(request(), async () => new Response("unexpected")))
      .status,
    429,
  );
  release();
  assert.equal((await first).status, 400);
  assert.equal(
    (await withBackupRequest(request(), async () => new Response("ok"))).status,
    200,
  );
});

test("export requests bound JSON size and validate passwords", async () => {
  const requestWith = (body, headers = {}) => new NextRequest("http://localhost/api/backup/export", { method: "POST", headers, body });
  await assert.rejects(readExportRequest(requestWith("x", { "content-length": "4097" })), /크기/);
  await assert.rejects(readExportRequest(requestWith(JSON.stringify({ password: "short" }))), /8자/);
  await assert.rejects(readExportRequest(requestWith("invalid JSON")), /올바르지/);
  assert.deepEqual(await readExportRequest(requestWith(JSON.stringify({ password: "test-password" }))), { password: "test-password" });
});

test("retired restore APIs explicitly report that restoration is available in the native app", async () => {
  const route = load("app/api/backup/[...unsupported]/route.ts");
  for (const handler of [route.GET, route.POST]) {
    const response = handler();
    assert.equal(response.status, 410);
    assert.match((await response.json()).message, /복원은 '위블' 앱/);
  }
});
