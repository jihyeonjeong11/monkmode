import { copyFileSync, mkdirSync, cpSync } from "fs";

const isWatch = process.argv.includes("--watch");
const isTestEnv = process.argv.includes("--is-test");
const defineFlags = isTestEnv ? ["--define", "process.env.IS_TEST=\"true\""] : [];

function copyAssets() {
  mkdirSync("dist/popup", { recursive: true });
  mkdirSync("dist/images", { recursive: true });
  copyFileSync("manifest.json", "dist/manifest.json");
  copyFileSync("src/popup/popup.html", "dist/popup/popup.html");
  copyFileSync("src/block-page/index.html", "dist/block-page.html");
  copyFileSync("src/offscreen/offscreen.html", "dist/offscreen.html");
  cpSync("images", "dist/images", { recursive: true });
  cpSync("src/assets", "dist/assets", { recursive: true });
  console.log("Assets copied.");
}

copyAssets();

// [entry, outfile, extraFlags]
const entries: [string, string, string[]][] = [
  ["src/background/index.ts", "dist/background.js", []],
  ["src/content/index.ts", "dist/content.js", ["--format=iife"]],
  ["src/popup/popup.ts", "dist/popup/popup.js", []],
  ["src/offscreen/offscreen.ts", "dist/offscreen.js", []],
  ["src/block-page/main.ts", "dist/block-page.js", []],
];

if (isWatch) {
  const procs = entries.map(([entry, outfile, flags]) =>
    Bun.spawn(["bun", "build", entry, "--outfile", outfile, "--watch", ...flags, ...defineFlags], {
      stdout: "inherit",
      stderr: "inherit",
    })
  );
  await Promise.all(procs.map((p) => p.exited));
} else {
  for (const [entry, outfile, flags] of entries) {
    const proc = Bun.spawnSync(["bun", "build", entry, "--outfile", outfile, ...flags, ...defineFlags], {
      stdout: "inherit",
      stderr: "inherit",
    });
    if (proc.exitCode !== 0) process.exit(proc.exitCode ?? 1);
  }
  console.log("Build complete.");
}
