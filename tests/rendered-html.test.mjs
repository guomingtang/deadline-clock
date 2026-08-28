import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("declares public page metadata and theme initialization", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /title:\s*["']Deadline Clock["']/);
  assert.match(layout, /description:\s*["'][^"']*conference deadlines[^"']*["']/i);
  assert.match(layout, /icons:\s*\{[^}]*favicon\.svg/s);
  assert.match(layout, /deadline-clock:theme/);
});
