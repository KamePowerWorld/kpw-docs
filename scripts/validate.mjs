import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";

const root = resolve(import.meta.dirname, "..");
const pagesRoot = join(root, "pages");
const schema = JSON.parse(readFileSync(join(root, "content.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const errors = [];
const pagesById = new Map();
const currentSlugs = new Set();
const aliasOwners = new Map();

for (const entry of readdirSync(pagesRoot)) {
  const pageDir = join(pagesRoot, entry);
  if (!statSync(pageDir).isDirectory()) continue;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry)) errors.push(`${entry}: slug must use lowercase kebab-case`);
  if (currentSlugs.has(entry)) errors.push(`${entry}: duplicate slug`);
  currentSlugs.add(entry);

  const markdownPath = join(pageDir, "index.md");
  if (!existsSync(markdownPath)) { errors.push(`${entry}: index.md is missing`); continue; }
  const source = readFileSync(markdownPath, "utf8");
  const parsed = matter(source);
  if (!validate(parsed.data)) {
    for (const issue of validate.errors ?? []) errors.push(`${entry}${issue.instancePath || "/frontmatter"}: ${issue.message}`);
  }
  if (typeof parsed.data.id === "string") {
    if (pagesById.has(parsed.data.id)) errors.push(`${entry}: duplicate page id ${parsed.data.id}`);
    pagesById.set(parsed.data.id, { slug: entry, data: parsed.data });
  }
  for (const alias of parsed.data.aliases ?? []) {
    if (alias === entry) errors.push(`${entry}: alias duplicates its current slug`);
    if (aliasOwners.has(alias)) errors.push(`${entry}: alias ${alias} is already owned by ${aliasOwners.get(alias)}`);
    aliasOwners.set(alias, entry);
  }
  if (/<\/?(?:script|iframe|object|embed|style|svg|div|img)\b/i.test(parsed.content)) errors.push(`${entry}: raw HTML is not allowed`);
  for (const [, target] of source.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:https?:|data:|\/)/i.test(target)) continue;
    const decoded = decodeURIComponent(target.split("#", 1)[0]);
    const assetPath = resolve(dirname(markdownPath), decoded);
    if (!assetPath.startsWith(`${pageDir}${sep}`) || !existsSync(assetPath)) errors.push(`${entry}: missing or unsafe image reference ${target}`);
  }
}

const indexPage = [...pagesById.values()].find((page) => page.slug === "index");
if (!indexPage) errors.push("pages/index/index.md is required");
else if (indexPage.data.draft) errors.push("index: top page cannot be private");

const navigationPath = join(root, "navigation.yml");
if (!existsSync(navigationPath)) errors.push("navigation.yml is required");
else {
  const navigation = parseYaml(readFileSync(navigationPath, "utf8"));
  if (navigation?.version !== 1 || !Array.isArray(navigation.tree)) errors.push("navigation.yml: version 1 and tree array are required");
  const seen = new Set();
  const visit = (nodes) => {
    for (const node of nodes ?? []) {
      if (!node || typeof node.id !== "string" || (node.children !== undefined && !Array.isArray(node.children))) {
        errors.push("navigation.yml: every node requires id and an optional children array"); continue;
      }
      if (seen.has(node.id)) errors.push(`navigation.yml: duplicate page id ${node.id}`);
      seen.add(node.id);
      const page = pagesById.get(node.id);
      if (!page) errors.push(`navigation.yml: unknown page id ${node.id}`);
      if (page?.slug === "index") errors.push("navigation.yml: index must not be included in the tree");
      visit(node.children);
    }
  };
  visit(navigation?.tree);
  for (const [id, page] of pagesById) if (page.slug !== "index" && !seen.has(id)) errors.push(`${page.slug}: page is missing from navigation.yml`);
}

if (errors.length) { console.error(errors.map((error) => `- ${error}`).join("\n")); process.exit(1); }
console.log(`Validated ${currentSlugs.size} pages in ${relative(process.cwd(), pagesRoot) || "pages"}.`);
