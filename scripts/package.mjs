import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import archiver from "archiver";

const root = process.cwd();

const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const { id, version } = manifest;

const distDir = path.join(root, "dist");
const pluginDir = path.join(distDir, id);
const zipPath = path.join(distDir, `${id}-${version}.zip`);

const DIST_FILES = ["main.js", "manifest.json", "styles.css"];

// 1. Run production build
console.log("Running production build...");
const build = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

// 2. Ensure dist/ exists and create plugin subfolder
fs.mkdirSync(pluginDir, { recursive: true });

// 3. Copy distribution files (only if they exist)
for (const name of DIST_FILES) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(pluginDir, name));
    console.log("  Copied", name);
  }
}

// 4. Create ZIP (folder <id>/ inside the zip)
console.log("Creating", path.basename(zipPath), "...");
const output = fs.createWriteStream(zipPath);
const archive = archiver("zip", { zlib: { level: 9 } });

await new Promise((resolve, reject) => {
  output.on("close", resolve);
  archive.on("error", reject);
  archive.pipe(output);
  archive.directory(pluginDir, id);
  archive.finalize();
});

// 5. Remove temporary plugin folder
fs.rmSync(pluginDir, { recursive: true });

console.log("Done. Output:", zipPath);
