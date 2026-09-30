import { mkdir, cp } from "node:fs/promises";
await mkdir("dist/website", { recursive: true });
await cp("website", "dist/website", { recursive: true });
await cp("brand", "dist/brand", { recursive: true });
await cp("dist/index.html", "dist/404.html");
console.log("Website and editable brand assets added to dist/.");
