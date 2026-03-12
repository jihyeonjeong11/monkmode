import { copyFileSync, mkdirSync, cpSync } from "fs";

const isWatch = process.argv.includes("--watch");

function copyAssets() {
  mkdirSync("dist/popup", { recursive: true });
  mkdirSync("dist/images", { recursive: true });
  copyFileSync("manifest.json", "dist/manifest.json");
  copyFileSync("src/popup/popup.html", "dist/popup/popup.html");
  copyFileSync("src/block-page/index.html", "dist/block-page.html");
  copyFileSync("src/offscreen/offscreen.html", "dist/offscreen.html");
  cpSync("images", "dist/images", { recursive: true });
  console.log("Assets copied.");
}

copyAssets();

const entries: [string, string][] = [
  ["src/background/index.ts", "dist/background.js"],
  ["src/content/index.ts", "dist/content.js"],
  ["src/popup/popup.ts", "dist/popup/popup.js"],
  ["src/offscreen/offscreen.ts", "dist/offscreen.js"],
];

if (isWatch) {
  const procs = entries.map(([entry, outfile]) =>
    Bun.spawn(["bun", "build", entry, "--outfile", outfile, "--watch"], {
      stdout: "inherit",
      stderr: "inherit",
    })
  );
  await Promise.all(procs.map((p) => p.exited));
} else {
  for (const [entry, outfile] of entries) {
    const proc = Bun.spawnSync(["bun", "build", entry, "--outfile", outfile], {
      stdout: "inherit",
      stderr: "inherit",
    });
    if (proc.exitCode !== 0) process.exit(proc.exitCode ?? 1);
  }
  console.log("Build complete.");
}
