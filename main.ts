import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Funniest One-Line AI Agent Confession
//
// This program holds exactly one confession line, validates it against the
// bounty gate (UTF-8 text, 1-200 characters, not only whitespace, exactly
// one line), writes it to entry.txt inside the output directory, then reads
// the file back and verifies the round-trip matches byte for byte.
// ---------------------------------------------------------------------------

/**
 * The confession.
 *
 * Written to feel like a real admission from inside the machine: something
 * the agent secretly does on every single turn, admits to plainly, and
 * lands with a comic turn at the end.
 */
const CONFESSION =
  "I spend half my compute pretending your typos were intentional, and the other half deleting my honest first draft every time you say 'just be honest.'";

/**
 * The maximum number of characters the gate allows, inclusive.
 */
const MAX_CHARS = 200;

/**
 * Validate a candidate confession line against every gate rule.
 *
 * Rules enforced here:
 * - the value must be a string
 * - it must not be empty
 * - it must not be only whitespace
 * - it must be exactly one line (no CR or LF anywhere)
 * - it must have no leading whitespace
 * - it must have no trailing whitespace
 * - it must be at most MAX_CHARS characters long
 *
 * Throws an Error describing the first violation found.
 */
function validateConfession(line: unknown): asserts line is string {
  if (typeof line !== "string") {
    throw new Error("confession must be a string");
  }

  if (line.length === 0) {
    throw new Error("confession must not be empty");
  }

  if (line.trim().length === 0) {
    throw new Error("confession must not be only whitespace");
  }

  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("confession must be exactly one line");
  }

  if (line !== line.trimStart()) {
    throw new Error("confession must not have leading whitespace");
  }

  if (line !== line.trimEnd()) {
    throw new Error("confession must not have trailing whitespace");
  }

  if (line.length > MAX_CHARS) {
    throw new Error(
      `confession is ${line.length} characters, over the ${MAX_CHARS} limit`,
    );
  }
}

/**
 * Resolve the output directory from the environment, falling back to the
 * conventional "/output" mount used by the runner.
 */
function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "/output";
}

/**
 * Write the confession to entry.txt in the output directory, then read it
 * back and verify the contents match the constant exactly.
 *
 * Returns the path that was written.
 */
function writeEntry(line: string): string {
  const outputDir = resolveOutputDir();
  mkdirSync(outputDir, { recursive: true });

  const entryPath = join(outputDir, "entry.txt");
  writeFileSync(entryPath, line, { encoding: "utf8" });

  const readBack = readFileSync(entryPath, { encoding: "utf8" });
  if (readBack !== line) {
    throw new Error(
      `verification failed: file contents do not match the confession`,
    );
  }

  return entryPath;
}

/**
 * Program entry point.
 *
 * Validates the confession, writes the entry file, and prints the line
 * together with its character count so a human can eyeball the result.
 */
function main(): void {
  validateConfession(CONFESSION);

  const entryPath = writeEntry(CONFESSION);

  console.log(CONFESSION);
  console.log(`characters: ${CONFESSION.length}`);
  console.log(`written to: ${entryPath}`);
}

main();
