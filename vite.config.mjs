import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";

const publicFiles = [
    "script.js",
    "assets/cover-808.png",
    "assets/cover-brazilian.png",
    "assets/cover-dark.png",
    "ads.txt",
    "google01f842ee1eaaecce.html",
    "robots.txt",
    "sitemap.xml"
];

export default defineConfig({
    plugins: [{
        name: "copy-site-verification-files",
        async generateBundle() {
            for (const fileName of publicFiles) {
                this.emitFile({
                    type: "asset",
                    fileName,
                    source: await readFile(fileName, "utf8")
                });
            }
        }
    }]
});
