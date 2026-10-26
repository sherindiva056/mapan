import { build } from "esbuild";
import { copyFile } from "node:fs/promises";
await build({
  entryPoints: ["vendor.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  outfile: "dist/vendor.js",
});
await copyFile(
  "node_modules/tesseract.js/dist/worker.min.js",
  "dist/ocr-worker.min.js",
);
