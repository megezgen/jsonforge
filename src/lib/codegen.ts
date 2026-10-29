import { toCsv, toXml, toYaml } from "./convert";
import type { CodeLang } from "./types";

type Field = { s: Schema; optional: boolean };
type ObjectSchema = { k: "object"; fields: Map<string, Field> };
type Schema =
  | { k: "string" | "number" | "integer" | "boolean" | "null" | "unknown" }
  | { k: "array"; item: Schema }
  | ObjectSchema
  | { k: "union"; items: Schema[] };

const MAX_SAMPLES = 2000;

function infer(v: unknown): Schema {
  if (v === null) return { k: "null" };
  switch (typeof v) {
    case "string":
      return { k: "string" };
    case "boolean":
      return { k: "boolean" };
    case "number":
      return { k: Number.isInteger(v) ? "integer" : "number" };
  }
  if (Array.isArray(v)) {
    let item: Schema = { k: "unknown" };
    const n = Math.min(v.length, MAX_SAMPLES);
    for (let i = 0; i < n; i++) item = i === 0 ? infer(v[0]) : merge(item, infer(v[i]));
    return { k: "array", item };
  }
  const fields = new Map<string, Field>();
  for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
    fields.set(key, { s: infer(val), optional: false });
  }
  return { k: "object", fields };
}

function family(s: Schema): string {
  return s.k === "integer" || s.k === "number" ? "number" : s.k;
}

function merge(a: Schema, b: Schema): Schema {
  if (a.k === "unknown") return b;
  if (b.k === "unknown") return a;
  if (a.k === "union" || b.k === "union") {
    const items = [...(a.k === "union" ? a.items : [a])];
    for (const x of b.k === "union" ? b.items : [b]) {
      const idx = items.findIndex((y) => family(y) === family(x));
      if (idx >= 0) items[idx] = merge(items[idx]!, x);
      else items.push(x);
    }
    return { k: "union", items };
  }
  if (family(a) !== family(b)) return { k: "union", items: [a, b] };
  if (a.k === "object" && b.k === "object") {
    const fields = new Map<string, Field>();
    for (const [key, f] of a.fields) {
      const g = b.fields.get(key);
      fields.set(key, g ? { s: merge(f.s, g.s), optional: f.optional || g.optional } : { s: f.s, optional: true });
    }
    for (const [key, g] of b.fields) if (!a.fields.has(key)) fields.set(key, { s: g.s, optional: true });
    return { k: "object", fields };
  }
  if (a.k === "array" && b.k === "array") return { k: "array", item: merge(a.item, b.item) };
  if ((a.k === "integer" || a.k === "number") && (b.k === "integer" || b.k === "number")) {
    return { k: a.k === "integer" && b.k === "integer" ? "integer" : "number" };
  }
  return a;
}

function sig(s: Schema): string {
  switch (s.k) {
    case "array":
      return `[${sig(s.item)}]`;
    case "union":
      return `(${s.items.map(sig).sort().join("|")})`;
    case "object":
      return `{${[...s.fields.entries()]
        .sort(([x], [y]) => (x < y ? -1 : 1))
        .map(([key, f]) => `${key}${f.optional ? "?" : ""}:${sig(f.s)}`)
        .join(",")}}`;
    default:
      return s.k;
  }
}

// ---------- naming helpers ----------

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function pascalCase(input: string): string {
  const out = words(input).map(cap).join("");
  if (!out) return "Item";
  return /^[0-9]/.test(out) ? `N${out}` : out;
}

function snakeCase(input: string): string {
  return words(input)
    .map((w) => w.toLowerCase())
    .join("_");
}

function singular(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, "y");
  if (/(ss|us)$/i.test(name)) return name;
  if (/s$/i.test(name) && name.length > 1) return name.slice(0, -1);
  return name;
}

// ---------- named object registry ----------

interface Named {
  name: string;
  schema: ObjectSchema;
}

function collect(root: Schema, rootName: string): { named: Named[]; byObject: Map<Schema, string> } {
  const named: Named[] = [];
  const byObject = new Map<Schema, string>();
  const used = new Map<string, string>(); // name -> signature

  const visit = (s: Schema, hint: string): void => {
    if (s.k === "array") return visit(s.item, singular(hint));
    if (s.k === "union") return s.items.forEach((x) => visit(x, hint));
    if (s.k !== "object") return;
    const sg = sig(s);
    const base = pascalCase(hint);
    let name = base;
    let i = 2;
    while (used.has(name) && used.get(name) !== sg) name = `${base}${i++}`;
    byObject.set(s, name);
    if (used.has(name)) return;
    used.set(name, sg);
    named.push({ name, schema: s });
    for (const [key, f] of s.fields) visit(f.s, key);
  };
  visit(root, rootName);
  return { named, byObject };
}

// ---------- TypeScript ----------

const TS_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function tsType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
    case "boolean":
    case "null":
    case "unknown":
      return s.k;
    case "number":
    case "integer":
      return "number";
    case "array": {
      const inner = tsType(s.item, names);
      return s.item.k === "union" ? `(${inner})[]` : `${inner}[]`;
    }
    case "object":
      return names.get(s) ?? "Record<string, unknown>";
    case "union":
      return [...new Set(s.items.map((x) => tsType(x, names)))].join(" | ");
  }
}

function genTypeScript(root: Schema, rootName: string): string {
  if (root.k !== "object" && root.k !== "array") {
    return `export type ${pascalCase(rootName)} = ${tsType(root, new Map())};\n`;
  }
  const { named, byObject } = collect(root, rootName);
  const blocks = named.map(({ name, schema }) => {
    const lines = [...schema.fields].map(([key, f]) => {
      const k = TS_IDENT.test(key) ? key : JSON.stringify(key);
      return `  ${k}${f.optional ? "?" : ""}: ${tsType(f.s, byObject)};`;
    });
    return `export interface ${name} {\n${lines.join("\n")}\n}`;
  });
  if (root.k === "array") {
    blocks.push(`export type ${pascalCase(rootName)}List = ${tsType(root, byObject)};`);
  }
  return blocks.join("\n\n") + "\n";
}

// ---------- Go ----------

const GO_INITIALISMS = new Set(["id", "url", "uri", "api", "http", "https", "html", "json", "xml", "sql", "uuid", "ip", "ui", "uid", "css"]);

function goField(key: string): string {
  const out = words(key)
    .map((w) => (GO_INITIALISMS.has(w.toLowerCase()) ? w.toUpperCase() : cap(w)))
    .join("");
  if (!out) return "Field";
  return /^[0-9]/.test(out) ? `F${out}` : out;
}

function goType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
      return "string";
    case "boolean":
      return "bool";
    case "integer":
      return "int64";
    case "number":
      return "float64";
    case "null":
    case "unknown":
      return "interface{}";
    case "array":
      return `[]${goType(s.item, names)}`;
    case "object":
      return names.get(s) ?? "map[string]interface{}";
    case "union": {
      const nonNull = s.items.filter((x) => x.k !== "null");
      if (nonNull.length === 1) {
        const t = goType(nonNull[0]!, names);
        return t.startsWith("[]") || t === "interface{}" ? t : `*${t}`;
      }
      return "interface{}";
    }
  }
}

function genGo(root: Schema, rootName: string): string {
  if (root.k !== "object" && root.k !== "array") {
    return `type ${pascalCase(rootName)} ${goType(root, new Map())}\n`;
  }
  const { named, byObject } = collect(root, rootName);
  const blocks = named.map(({ name, schema }) => {
    const rows = [...schema.fields].map(([key, f]) => {
      let t = goType(f.s, byObject);
      if (f.optional && !t.startsWith("*") && !t.startsWith("[]") && t !== "interface{}") t = `*${t}`;
      const tag = "`json:\"" + key + (f.optional ? ",omitempty" : "") + "\"`";
      return [goField(key), t, tag] as const;
    });
    const w0 = Math.max(0, ...rows.map((r) => r[0].length));
    const w1 = Math.max(0, ...rows.map((r) => r[1].length));
    const body = rows.map(([a, b, c]) => `\t${a.padEnd(w0)} ${b.padEnd(w1)} ${c}`).join("\n");
    return `type ${name} struct {\n${body}\n}`;
  });
  if (root.k === "array") blocks.push(`type ${pascalCase(rootName)}List ${goType(root, byObject)}`);
  return blocks.join("\n\n") + "\n";
}

// ---------- Python / Pydantic ----------

const PY_RESERVED = new Set(["from", "import", "class", "def", "return", "global", "pass", "lambda", "in", "is", "not", "and", "or", "if", "else", "elif", "for", "while", "try", "except", "finally", "with", "as", "yield", "del", "raise", "assert", "break", "continue", "nonlocal", "none", "true", "false", "async", "await", "type", "id_"]);

function pyField(key: string): { name: string; alias: boolean } {
  let name = snakeCase(key) || "field";
  if (/^[0-9]/.test(name)) name = `f_${name}`;
  if (PY_RESERVED.has(name) && name !== "id_") name = `${name}_`;
  return { name, alias: name !== key };
}

function pyType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
      return "str";
    case "boolean":
      return "bool";
    case "integer":
      return "int";
    case "number":
      return "float";
    case "null":
      return "None";
    case "unknown":
      return "Any";
    case "array":
      return `List[${pyType(s.item, names)}]`;
    case "object":
      return names.get(s) ?? "Dict[str, Any]";
    case "union": {
      const nonNull = s.items.filter((x) => x.k !== "null");
      const hasNull = nonNull.length !== s.items.length;
      const parts = [...new Set(nonNull.map((x) => pyType(x, names)))];
      const inner = parts.length === 1 ? parts[0]! : `Union[${parts.join(", ")}]`;
      return hasNull ? `Optional[${inner}]` : inner;
    }
  }
}

const PY_IMPORTS = "from typing import Any, Dict, List, Optional, Union\n";

function genPython(root: Schema, rootName: string): string {
  if (root.k !== "object" && root.k !== "array") {
    return `${PY_IMPORTS}\n${pascalCase(rootName)} = ${pyType(root, new Map())}\n`;
  }
  const { named, byObject } = collect(root, rootName);
  // `named` is parent-first; reverse so nested models are defined before use.
  const blocks = [...named].reverse().map(({ name, schema }) => {
    const rows = [...schema.fields].map(([key, f]) => {
      const { name: fname, alias } = pyField(key);
      let t = pyType(f.s, byObject);
      if (f.optional && !t.startsWith("Optional[")) t = `Optional[${t}]`;
      const args: string[] = [];
      if (t.startsWith("Optional[")) args.push("default=None");
      if (alias) args.push(`alias=${JSON.stringify(key)}`);
      return args.length ? `    ${fname}: ${t} = Field(${args.join(", ")})` : `    ${fname}: ${t}`;
    });
    return `class ${name}(BaseModel):\n${rows.length ? rows.join("\n") : "    pass"}`;
  });
  if (root.k === "array") blocks.push(`${pascalCase(rootName)}List = ${pyType(root, byObject)}`);
  return `${PY_IMPORTS}\nfrom pydantic import BaseModel, Field\n\n\n${blocks.join("\n\n\n")}\n`;
}

// ---------- Zod ----------

function zodType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
      return "z.string()";
    case "boolean":
      return "z.boolean()";
    case "integer":
      return "z.number().int()";
    case "number":
      return "z.number()";
    case "null":
      return "z.null()";
    case "unknown":
      return "z.unknown()";
    case "array":
      return `z.array(${zodType(s.item, names)})`;
    case "object":
      return names.get(s) ?? "z.record(z.string(), z.unknown())";
    case "union": {
      const nonNull = s.items.filter((x) => x.k !== "null");
      const nullable = nonNull.length !== s.items.length;
      const inner = nonNull.length === 1 ? zodType(nonNull[0]!, names) : `z.union([${nonNull.map((x) => zodType(x, names)).join(", ")}])`;
      return nullable ? `${inner}.nullable()` : inner;
    }
  }
}

function genZod(root: Schema, rootName: string): string {
  const header = 'import { z } from "zod";\n\n';
  if (root.k !== "object" && root.k !== "array") {
    return `${header}export const ${pascalCase(rootName)} = ${zodType(root, new Map())};\n`;
  }
  const { named, byObject } = collect(root, rootName);
  // Children first so every schema is defined before it is referenced.
  const blocks = [...named].reverse().map(({ name, schema }) => {
    const lines = [...schema.fields].map(([key, f]) => {
      const k = TS_IDENT.test(key) ? key : JSON.stringify(key);
      return `  ${k}: ${zodType(f.s, byObject)}${f.optional ? ".optional()" : ""},`;
    });
    return `export const ${name} = z.object({\n${lines.join("\n")}\n});\nexport type ${name} = z.infer<typeof ${name}>;`;
  });
  if (root.k === "array") {
    const n = `${pascalCase(rootName)}List`;
    blocks.push(`export const ${n} = ${zodType(root, byObject)};\nexport type ${n} = z.infer<typeof ${n}>;`);
  }
  return header + blocks.join("\n\n") + "\n";
}

// ---------- Rust (serde) ----------

const RUST_KEYWORDS = new Set(["as", "break", "const", "continue", "crate", "else", "enum", "extern", "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return", "self", "static", "struct", "super", "trait", "true", "type", "unsafe", "use", "where", "while", "async", "await", "dyn"]);

function rustField(key: string): { name: string; rename: boolean } {
  let name = snakeCase(key) || "field";
  if (/^[0-9]/.test(name)) name = `f_${name}`;
  if (RUST_KEYWORDS.has(name)) name = `${name}_`;
  return { name, rename: name !== key };
}

function rustType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
      return "String";
    case "boolean":
      return "bool";
    case "integer":
      return "i64";
    case "number":
      return "f64";
    case "null":
    case "unknown":
      return "serde_json::Value";
    case "array":
      return `Vec<${rustType(s.item, names)}>`;
    case "object":
      return names.get(s) ?? "serde_json::Value";
    case "union": {
      const nonNull = s.items.filter((x) => x.k !== "null");
      if (nonNull.length === 1) return `Option<${rustType(nonNull[0]!, names)}>`;
      return "serde_json::Value";
    }
  }
}

function genRust(root: Schema, rootName: string): string {
  const header = "use serde::{Deserialize, Serialize};\n\n";
  if (root.k !== "object" && root.k !== "array") {
    return `${header}pub type ${pascalCase(rootName)} = ${rustType(root, new Map())};\n`;
  }
  const { named, byObject } = collect(root, rootName);
  const blocks = named.map(({ name, schema }) => {
    const lines = [...schema.fields].flatMap(([key, f]) => {
      const { name: fname, rename } = rustField(key);
      let t = rustType(f.s, byObject);
      const optional = f.optional && !t.startsWith("Option<");
      if (optional) t = `Option<${t}>`;
      const attrs: string[] = [];
      if (rename) attrs.push(`rename = ${JSON.stringify(key)}`);
      if (t.startsWith("Option<")) attrs.push('default, skip_serializing_if = "Option::is_none"');
      return [...(attrs.length ? [`    #[serde(${attrs.join(", ")})]`] : []), `    pub ${fname}: ${t},`];
    });
    return `#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct ${name} {\n${lines.join("\n")}\n}`;
  });
  if (root.k === "array") blocks.push(`pub type ${pascalCase(rootName)}List = ${rustType(root, byObject)};`);
  return header + blocks.join("\n\n") + "\n";
}

// ---------- Java (records + Jackson) ----------

const JAVA_RESERVED = new Set(["abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native", "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void", "volatile", "while", "record", "var"]);

function javaField(key: string): { name: string; rename: boolean } {
  const parts = words(key);
  let name = parts.map((w, i) => (i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : cap(w))).join("") || "field";
  if (/^[0-9]/.test(name)) name = `f${name}`;
  if (JAVA_RESERVED.has(name)) name = `${name}_`;
  return { name, rename: name !== key };
}

function javaType(s: Schema, names: Map<Schema, string>): string {
  switch (s.k) {
    case "string":
      return "String";
    case "boolean":
      return "Boolean";
    case "integer":
      return "Long";
    case "number":
      return "Double";
    case "null":
    case "unknown":
      return "Object";
    case "array":
      return `List<${javaType(s.item, names)}>`;
    case "object":
      return names.get(s) ?? "Map<String, Object>";
    case "union": {
      const nonNull = s.items.filter((x) => x.k !== "null");
      return nonNull.length === 1 ? javaType(nonNull[0]!, names) : "Object";
    }
  }
}

function genJava(root: Schema, rootName: string): string {
  const header = "import com.fasterxml.jackson.annotation.JsonProperty;\nimport java.util.List;\nimport java.util.Map;\n\n";
  if (root.k !== "object" && root.k !== "array") {
    return `// A JSON ${root.k} has no class representation; use ${javaType(root, new Map())} directly.\n`;
  }
  const { named, byObject } = collect(root, rootName);
  const blocks = named.map(({ name, schema }) => {
    const fields = [...schema.fields].map(([key, f]) => {
      const { name: fname, rename } = javaField(key);
      const t = javaType(f.s, byObject);
      return `    ${rename ? `@JsonProperty(${JSON.stringify(key)}) ` : ""}${t} ${fname}`;
    });
    return `public record ${name}(\n${fields.join(",\n")}\n) {}`;
  });
  return header + blocks.join("\n\n") + "\n";
}

export function generateCode(value: unknown, lang: CodeLang, rootName = "Root"): string {
  if (lang === "yaml") return toYaml(value);
  if (lang === "csv") return toCsv(value);
  if (lang === "xml") return toXml(value, rootName === "Root" ? "root" : rootName);
  const schema = infer(value);
  switch (lang) {
    case "typescript":
      return genTypeScript(schema, rootName);
    case "go":
      return genGo(schema, rootName);
    case "python":
      return genPython(schema, rootName);
    case "zod":
      return genZod(schema, rootName);
    case "rust":
      return genRust(schema, rootName);
    case "java":
      return genJava(schema, rootName);
  }
}
