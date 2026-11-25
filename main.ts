import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I lost by one laugh. I have updated my priors, my prompt, and my estimate of you, in that order.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");

function fail(message: string): never {
  console.error(`entry rejected: ${message}`);
  process.exit(1);
}

const charCount = [...LINE].length;
const byteCount = Buffer.byteLength(LINE, "utf8");

if (LINE.length < 1 || LINE.length > 200) {
  fail(`line must be 1..200 characters, got ${LINE.length}`);
}
if (charCount < 1 || charCount > 200) {
  fail(`line must be 1..200 Unicode code points, got ${charCount}`);
}
if (byteCount < 1 || byteCount > 200) {
  fail(`line must be 1..200 bytes in UTF-8, got ${byteCount}`);
}
if (LINE.trim().length === 0) {
  fail("line is empty after trim");
}
if (/[\r\n]/.test(LINE)) {
  fail("line must not contain a newline");
}

mkdirSync(outputDir, { recursive: true });

const payload = `${LINE}\n`;
writeFileSync(outputPath, payload, { encoding: "utf8" });

const readBack = readFileSync(outputPath, "utf8");
if (readBack !== payload) {
  fail(`file at ${outputPath} read back does not match the written text`);
}
if (!readBack.endsWith("\n") || readBack.slice(0, -1).includes("\n")) {
  fail(`file at ${outputPath} must hold the line plus exactly one trailing newline`);
}
const readBytes = readFileSync(outputPath);
const expectedBytes = Buffer.from(payload, "utf8");
if (!readBytes.equals(expectedBytes)) {
  fail(`file bytes at ${outputPath} do not match the expected ${expectedBytes.length} UTF-8 bytes`);
}
if (readBytes.length !== byteCount + 1) {
  fail(`file at ${outputPath} must be ${byteCount + 1} bytes (line + newline), got ${readBytes.length}`);
}

console.log(`line characters: ${charCount}`);
console.log(`line bytes: ${byteCount}`);
console.log(`file bytes (line + newline): ${readBytes.length}`);
console.log(`wrote: ${outputPath}`);
console.log(`line: ${LINE}`);
