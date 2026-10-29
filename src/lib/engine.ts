import { Validator, type Schema, type SchemaDraft } from "@cfworker/json-schema";
import { diffLines } from "diff";
import { JSONPath } from "jsonpath-plus";
import { jsonrepair } from "jsonrepair";
import { generateCode } from "./codegen";
import type {
  CodeLang,
  DiffLine,
  DiffResponse,
  IndentOption,
  JsonStats,
  NodeCopy,
  NodeType,
  ParseErrorInfo,
  ParseResult,
  QueryItem,
  QueryResult,
  SchemaIssue,
  SchemaResult,
  TreeRequest,
  TreeResponse,
  TreeRow,
} from "./types";

/**
 * Pure JSON engine. It runs inside a Web Worker so that parsing, formatting
 * and tree flattening of very large documents never block the UI thread.
 */

const MAX_TREE_ROWS = 250_000;
const MAX_MATCHES = 20_000;
const MAX_DIFF_LINES = 400_000;
const encoder = new TextEncoder();

let current: unknown;
let hasCurrent = false;
let searchCache: { query: string; visible: Set<string>; matches: Set<string> } | null = null;

// ---------- parsing ----------

function locate(text: string, position: number): { line: number; column: number } {
  let line = 1;
  let last = -1;
  const end = Math.min(position, text.length);
  for (let i = text.indexOf("\n"); i !== -1 && i < end; i = text.indexOf("\n", i + 1)) {
    line++;
    last = i;
  }
  return { line, column: end - last };
}

function toParseError(err: unknown, text: string): ParseErrorInfo {
  const message = err instanceof Error ? err.message : String(err);
  let line = 0;
  let column = 0;
  let position = 0;
  const pos = /position (\d+)/.exec(message);
  const lc = /line (\d+) column (\d+)/.exec(message);
  if (pos) {
    position = Number(pos[1]);
    ({ line, column } = locate(text, position));
  } else if (lc) {
    line = Number(lc[1]);
    column = Number(lc[2]);
  }
  if (!line) {
    // Truncated input such as `{"a":` has no position in some engines.
    position = text.length;
    ({ line, column } = locate(text, position));
  }
  return { message: message.replace(/\s*\(line \d+ column \d+\)/, ""), line, column, position };
}

function nodeType(v: unknown): NodeType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v as NodeType;
}

function computeStats(root: unknown, bytes: number): JsonStats {
  let nodes = 0;
  let keys = 0;
  let depth = 0;
  const stack: Array<[unknown, number]> = [[root, 1]];
  while (stack.length) {
    const [v, d] = stack.pop()!;
    nodes++;
    if (d > depth) depth = d;
    if (v !== null && typeof v === "object") {
      if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) stack.push([v[i], d + 1]);
      } else {
        const rec = v as Record<string, unknown>;
        for (const k in rec) {
          keys++;
          stack.push([rec[k], d + 1]);
        }
      }
    }
  }
  return { bytes, depth, nodes, keys, rootType: nodeType(root) };
}

export function parse(text: string): ParseResult {
  searchCache = null;
  if (!text.trim()) {
    hasCurrent = false;
    current = undefined;
    return { ok: false, error: { message: "Empty input", line: 0, column: 0, position: 0 } };
  }
  try {
    current = JSON.parse(text);
    hasCurrent = true;
    return { ok: true, stats: computeStats(current, encoder.encode(text).length) };
  } catch (err) {
    hasCurrent = false;
    current = undefined;
    return { ok: false, error: toParseError(err, text) };
  }
}

// ---------- formatting ----------

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v !== null && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(rec).sort()) out[k] = sortDeep(rec[k]);
    return out;
  }
  return v;
}

function stringify(v: unknown, indent: IndentOption, sortKeys: boolean): string {
  const value = sortKeys ? sortDeep(v) : v;
  return JSON.stringify(value, null, indent === "compact" ? undefined : Number(indent));
}

export function format(indent: IndentOption, sortKeys: boolean): string {
  if (!hasCurrent) throw new Error("No valid JSON loaded");
  return stringify(current, indent, sortKeys);
}

export function repair(text: string): string {
  return jsonrepair(text);
}

// ---------- tree ----------

const esc = (s: string) => s.replace(/~/g, "~0").replace(/\//g, "~1");
const unesc = (s: string) => s.replace(/~1/g, "/").replace(/~0/g, "~");

function preview(v: unknown): string {
  const s = JSON.stringify(v);
  return s.length > 400 ? `${s.slice(0, 400)}…"` : s;
}

function childCount(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v !== null && typeof v === "object") return Object.keys(v as object).length;
  return 0;
}

function runSearch(query: string): NonNullable<typeof searchCache> {
  if (searchCache && searchCache.query === query) return searchCache;
  const q = query.toLowerCase();
  const matches = new Set<string>();
  const visible = new Set<string>();
  // Iterative DFS keeping the ancestor chain so matches can mark their ancestors.
  type Frame = { v: unknown; id: string; label: string | null };
  const chain: string[] = [];
  const walk = (frame: Frame, depth: number): void => {
    chain.length = depth;
    chain[depth] = frame.id;
    const { v } = frame;
    const keyHit = frame.label !== null && frame.label.toLowerCase().includes(q);
    const isContainer = v !== null && typeof v === "object";
    const valueHit = !isContainer && String(v).toLowerCase().includes(q);
    if ((keyHit || valueHit) && matches.size < MAX_MATCHES) {
      matches.add(frame.id);
      for (let i = 0; i <= depth; i++) visible.add(chain[i]!);
    }
    if (!isContainer) return;
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) walk({ v: v[i], id: `${frame.id}/${i}`, label: String(i) }, depth + 1);
    } else {
      const rec = v as Record<string, unknown>;
      for (const k of Object.keys(rec)) walk({ v: rec[k], id: `${frame.id}/${esc(k)}`, label: k }, depth + 1);
    }
  };
  // Recursion depth equals JSON depth, which JSON.parse already bounded.
  walk({ v: current, id: "", label: null }, 0);
  searchCache = { query, visible, matches };
  return searchCache;
}

export function tree(req: TreeRequest): TreeResponse {
  if (!hasCurrent) throw new Error("No valid JSON loaded");
  const toggled = new Set(req.toggled);
  const query = req.query.trim();
  const search = query ? runSearch(query) : null;
  const rows: TreeRow[] = [];
  let truncated = false;

  type Item = { v: unknown; id: string; label: string | null; isIndex: boolean; depth: number };
  const stack: Item[] = [{ v: current, id: "", label: null, isIndex: false, depth: 0 }];

  while (stack.length) {
    if (rows.length >= MAX_TREE_ROWS) {
      truncated = true;
      break;
    }
    const it = stack.pop()!;
    const type = nodeType(it.v);
    const container = type === "object" || type === "array";
    const count = container ? childCount(it.v) : 0;
    // While searching, every ancestor of a match opens; matched containers can still be toggled.
    const expanded = search
      ? container && search.visible.has(it.id) && (!search.matches.has(it.id) || !toggled.has(it.id))
      : container && it.depth < req.defaultDepth !== toggled.has(it.id);

    rows.push({
      id: it.id,
      depth: it.depth,
      label: it.label,
      isIndex: it.isIndex,
      type,
      preview: container ? "" : preview(it.v),
      count,
      expanded,
      match: !!search && search.matches.has(it.id),
    });

    if (!container || !expanded) continue;
    const children: Item[] = [];
    if (Array.isArray(it.v)) {
      for (let i = 0; i < it.v.length; i++) {
        const id = `${it.id}/${i}`;
        if (search && !search.visible.has(id)) continue;
        children.push({ v: it.v[i], id, label: String(i), isIndex: true, depth: it.depth + 1 });
      }
    } else {
      const rec = it.v as Record<string, unknown>;
      for (const k of Object.keys(rec)) {
        const id = `${it.id}/${esc(k)}`;
        if (search && !search.visible.has(id)) continue;
        children.push({ v: rec[k], id, label: k, isIndex: false, depth: it.depth + 1 });
      }
    }
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]!);
  }

  return { rows, matches: search ? search.matches.size : 0, truncated };
}

function resolve(id: string): { value: unknown; path: string } {
  let value: unknown = current;
  let path = "$";
  if (id === "") return { value, path };
  for (const raw of id.slice(1).split("/")) {
    const token = unesc(raw);
    if (Array.isArray(value)) {
      value = value[Number(token)];
      path += `[${token}]`;
    } else {
      value = (value as Record<string, unknown>)[token];
      path += /^[A-Za-z_$][\w$]*$/.test(token) ? `.${token}` : `[${JSON.stringify(token)}]`;
    }
  }
  return { value, path };
}

export function nodeCopy(id: string): NodeCopy {
  if (!hasCurrent) throw new Error("No valid JSON loaded");
  const { value, path } = resolve(id);
  return { json: typeof value === "string" ? value : JSON.stringify(value, null, 2), path };
}

// ---------- code generation ----------

export function codegen(lang: CodeLang, rootName: string): string {
  if (!hasCurrent) throw new Error("No valid JSON loaded");
  return generateCode(current, lang, rootName);
}

// ---------- JSONPath query ----------

const MAX_QUERY_ITEMS = 1000;

export function queryPath(expression: string, withValues: boolean): QueryResult {
  if (!hasCurrent) return { ok: false, error: "The JSON in the editor is empty or invalid." };
  const expr = expression.trim();
  if (!expr) return { ok: false, error: "Enter a JSONPath expression, for example $.users[*].name" };
  try {
    // "safe" uses a built-in expression parser, so no eval is needed (works under a strict CSP).
    const hits = JSONPath({ path: expr, json: current as object, resultType: "all", eval: "safe", wrap: true }) as Array<{ pointer: string; value: unknown }>;
    const items: QueryItem[] = [];
    for (const h of hits.slice(0, MAX_QUERY_ITEMS)) {
      let path = h.pointer || "$";
      try {
        path = resolve(h.pointer).path;
      } catch {
        /* keep the raw pointer */
      }
      const type = nodeType(h.value);
      const container = type === "object" || type === "array";
      const raw = JSON.stringify(h.value) ?? "undefined";
      items.push({ path, pointer: h.pointer, type, preview: container ? (raw.length > 160 ? `${raw.slice(0, 160)}…` : raw) : preview(h.value) });
    }
    return {
      ok: true,
      total: hits.length,
      items,
      valuesJson: withValues ? JSON.stringify(hits.map((h) => h.value), null, 2) : null,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------- JSON Schema validation ----------

const MAX_SCHEMA_ISSUES = 500;

function draftOf(schema: unknown): SchemaDraft {
  const url = schema !== null && typeof schema === "object" ? String((schema as Record<string, unknown>).$schema ?? "") : "";
  if (url.includes("draft-04")) return "4";
  if (url.includes("draft-07") || url.includes("draft-06") || url.includes("draft-03")) return "7";
  if (url.includes("2019-09")) return "2019-09";
  return "2020-12";
}

export function validateSchema(schemaText: string): SchemaResult {
  if (!hasCurrent) return { ok: false, error: "The JSON in the editor is empty or invalid." };
  let schema: unknown;
  try {
    schema = JSON.parse(schemaText);
  } catch (err) {
    return { ok: false, error: `The schema is not valid JSON: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (schema === null || (typeof schema !== "object" && typeof schema !== "boolean")) {
    return { ok: false, error: "A JSON Schema must be an object or a boolean." };
  }
  const draft = draftOf(schema);
  try {
    const validator = new Validator(schema as Schema, draft, false);
    const result = validator.validate(current);
    const seen = new Set<string>();
    const issues: SchemaIssue[] = [];
    for (const e of result.errors) {
      const key = `${e.instanceLocation}|${e.keyword}|${e.error}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Instance locations look like "#/users/0/name"; the tree uses the same pointer without the "#".
      const pointer = e.instanceLocation.replace(/^#/, "");
      let path = pointer || "$";
      try {
        path = resolve(pointer).path;
      } catch {
        /* keep the raw pointer if it cannot be resolved */
      }
      issues.push({ path, pointer, keyword: e.keyword, message: e.error });
    }
    return { ok: true, valid: result.valid, issues: issues.slice(0, MAX_SCHEMA_ISSUES), total: issues.length, draft };
  } catch (err) {
    return { ok: false, error: `The schema could not be used: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ---------- diff ----------

export function diff(left: string, right: string, sortKeys: boolean): DiffResponse {
  let a: unknown;
  let b: unknown;
  try {
    a = JSON.parse(left);
  } catch (err) {
    return { ok: false, side: "left", error: toParseError(err, left) };
  }
  try {
    b = JSON.parse(right);
  } catch (err) {
    return { ok: false, side: "right", error: toParseError(err, right) };
  }
  const la = stringify(a, "2", sortKeys);
  const lb = stringify(b, "2", sortKeys);
  const parts = diffLines(la, lb);
  const lines: DiffLine[] = [];
  let oldNo = 1;
  let newNo = 1;
  let added = 0;
  let removed = 0;
  let truncated = false;
  outer: for (const part of parts) {
    const text = part.value.endsWith("\n") ? part.value.slice(0, -1) : part.value;
    for (const line of text.split("\n")) {
      if (lines.length >= MAX_DIFF_LINES) {
        truncated = true;
        break outer;
      }
      if (part.added) {
        lines.push({ kind: "add", text: line, oldNo: null, newNo: newNo++ });
        added++;
      } else if (part.removed) {
        lines.push({ kind: "del", text: line, oldNo: oldNo++, newNo: null });
        removed++;
      } else {
        lines.push({ kind: "same", text: line, oldNo: oldNo++, newNo: newNo++ });
      }
    }
  }
  return { ok: true, lines, added, removed, truncated };
}
