// Cho `node --test` hiểu alias `@/…` của tsconfig: `@/lib/x` → `src/lib/x.ts`.
// Node tự bỏ kiểu của tệp .ts (type stripping), nên không cần công cụ dựng nào.
import { register } from "node:module";

register(
  `data:text/javascript,${encodeURIComponent(`
    import { existsSync } from "node:fs";
    const SRC = ${JSON.stringify(new URL("../src/", import.meta.url).href)};
    export async function resolve(specifier, context, next) {
      if (specifier.startsWith("@/")) {
        for (const ext of [".ts", ".tsx", "/index.ts"]) {
          const url = new URL(specifier.slice(2) + ext, SRC);
          if (existsSync(url)) return next(url.href, context);
        }
      }
      return next(specifier, context);
    }
  `)}`,
);
