import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import matter from "gray-matter";

const root = resolve(import.meta.dirname, "..");
const pagesRoot = join(root, "pages");
const schema = JSON.parse(readFileSync(join(root, "content.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const errors = [];
const slugs = new Set();

for (const entry of readdirSync(pagesRoot)) {
  const pageDir = join(pagesRoot, entry);
  if (!statSync(pageDir).isDirectory()) continue;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry)) {
    errors.push(`${entry}: slug must use lowercase kebab-case`);
  }
  if (slugs.has(entry)) errors.push(`${entry}: duplicate slug`);
  slugs.add(entry);

  const markdownPath = join(pageDir, "index.md");
  if (!existsSync(markdownPath)) {
    errors.push(`${entry}: index.md is missing`);
    continue;
  }

  const source = readFileSync(markdownPath, "utf8");
  const parsed = matter(source);
  if (!validate(parsed.data)) {
    for (const issue of validate.errors ?? []) {
      errors.push(`${entry}${issue.instancePath || "/frontmatter"}: ${issue.message}`);
    }
  }
  if (/<\/?(?:script|iframe|object|embed|style|svg|div|img)\b/i.test(parsed.content)) {
    errors.push(`${entry}: raw HTML is not allowed`);
  }

  const references = [...source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)];
  for (const [, target] of references) {
    if (/^(?:https?:|data:|\/)/i.test(target)) continue;
    const decoded = decodeURIComponent(target.split("#", 1)[0]);
    const assetPath = resolve(dirname(markdownPath), decoded);
    if (!assetPath.startsWith(`${pageDir}${sep}`) || !existsSync(assetPath)) {
      errors.push(`${entry}: missing or unsafe image reference ${target}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${slugs.size} pages in ${relative(process.cwd(), pagesRoot) || "pages"}.`);
