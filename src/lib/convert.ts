/** JSON to YAML / CSV / XML converters. Pure functions, run inside the worker. */

// ---------- YAML ----------

const YAML_RESERVED = /^(true|false|yes|no|on|off|null|~|y|n)$/i;
const YAML_NUMBERISH = /^[-+]?(\d[\d_]*\.?\d*([eE][-+]?\d+)?|\.\d+|0x[\da-fA-F]+|0o[0-7]+|\.inf|\.nan)$/i;

function yamlString(s: string): string {
  const plain =
    s.length > 0 &&
    s === s.trim() &&
    !/[\n\r\t]/.test(s) &&
    !YAML_RESERVED.test(s) &&
    !YAML_NUMBERISH.test(s) &&
    !/^[-?:,[\]{}#&*!|>'"%@`]/.test(s) &&
    !/: |:$| #/.test(s);
  return plain ? s : JSON.stringify(s);
}

function yamlScalar(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return yamlString(v);
  return String(v);
}

function yamlKey(k: string): string {
  return /^[A-Za-z_][\w.-]*$/.test(k) && !YAML_RESERVED.test(k) ? k : JSON.stringify(k);
}

function yamlLines(v: unknown, indent: number, out: string[]): void {
  const pad = " ".repeat(indent);
  if (Array.isArray(v)) {
    for (const item of v) {
      if (item !== null && typeof item === "object" && (Array.isArray(item) ? item.length : Object.keys(item).length)) {
        const sub: string[] = [];
        yamlLines(item, indent + 2, sub);
        // Put the first line of the nested block on the dash line.
        out.push(`${pad}- ${sub[0]!.slice(indent + 2)}`, ...sub.slice(1));
      } else {
        out.push(`${pad}- ${yamlInline(item)}`);
      }
    }
    return;
  }
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (val !== null && typeof val === "object" && (Array.isArray(val) ? val.length : Object.keys(val).length)) {
      out.push(`${pad}${yamlKey(k)}:`);
      yamlLines(val, Array.isArray(val) ? indent + 2 : indent + 2, out);
    } else {
      out.push(`${pad}${yamlKey(k)}: ${yamlInline(val)}`);
    }
  }
}

function yamlInline(v: unknown): string {
  if (Array.isArray(v)) return "[]";
  if (v !== null && typeof v === "object") return "{}";
  return yamlScalar(v);
}

export function toYaml(value: unknown): string {
  if (value === null || typeof value !== "object" || (Array.isArray(value) ? !value.length : !Object.keys(value).length)) {
    return `${yamlInline(value)}\n`;
  }
  const out: string[] = [];
  yamlLines(value, 0, out);
  return `${out.join("\n")}\n`;
}

// ---------- CSV ----------

function flatten(value: unknown, prefix: string, into: Map<string, unknown>): void {
  if (value !== null && typeof value === "object") {
    const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);
    if (entries.length === 0) {
      into.set(prefix, "");
      return;
    }
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, into);
  } else {
    into.set(prefix, value);
  }
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(value: unknown): string {
  const records = Array.isArray(value) ? value : [value];
  const rows = records.map((r) => {
    const m = new Map<string, unknown>();
    if (r !== null && typeof r === "object") flatten(r, "", m);
    else m.set("value", r);
    return m;
  });
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const k of row.keys()) {
      if (!seen.has(k)) {
        seen.add(k);
        headers.push(k);
      }
    }
  }
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row.get(h))).join(","));
  return `${lines.join("\n")}\n`;
}

// ---------- XML ----------

const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function xmlName(k: string): string {
  let n = k.replace(/[^A-Za-z0-9_.-]/g, "_");
  if (!/^[A-Za-z_]/.test(n)) n = `_${n}`;
  return n;
}

function xmlNode(name: string, v: unknown, depth: number, out: string[]): void {
  const pad = "  ".repeat(depth);
  const tag = xmlName(name);
  if (Array.isArray(v)) {
    if (v.length === 0) out.push(`${pad}<${tag}/>`);
    for (const item of v) xmlNode(name, item, depth, out);
  } else if (v !== null && typeof v === "object") {
    const entries = Object.entries(v);
    if (entries.length === 0) {
      out.push(`${pad}<${tag}/>`);
      return;
    }
    out.push(`${pad}<${tag}>`);
    for (const [k, val] of entries) xmlNode(k, val, depth + 1, out);
    out.push(`${pad}</${tag}>`);
  } else if (v === null) {
    out.push(`${pad}<${tag}/>`);
  } else {
    out.push(`${pad}<${tag}>${xmlEscape(String(v))}</${tag}>`);
  }
}

export function toXml(value: unknown, rootName: string): string {
  const out = ['<?xml version="1.0" encoding="UTF-8"?>'];
  const root = xmlName(rootName || "root");
  if (Array.isArray(value)) {
    out.push(`<${root}>`);
    for (const item of value) xmlNode("item", item, 1, out);
    out.push(`</${root}>`);
  } else {
    xmlNode(root, value, 0, out);
  }
  return `${out.join("\n")}\n`;
}
