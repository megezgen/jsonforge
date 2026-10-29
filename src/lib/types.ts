export type NodeType = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface JsonStats {
  bytes: number;
  depth: number;
  nodes: number;
  keys: number;
  rootType: NodeType;
}

export interface ParseErrorInfo {
  message: string;
  line: number;
  column: number;
  position: number;
}

export type ParseResult =
  | { ok: true; stats: JsonStats }
  | { ok: false; error: ParseErrorInfo };

export interface TreeRow {
  /** JSON-pointer style id, unique per node. */
  id: string;
  depth: number;
  /** Object key or array index (as string); null for the root. */
  label: string | null;
  isIndex: boolean;
  type: NodeType;
  /** Primitive preview (already JSON-encoded) or empty for containers. */
  preview: string;
  /** Child count for containers. */
  count: number;
  expanded: boolean;
  match: boolean;
}

export interface TreeRequest {
  defaultDepth: number;
  toggled: string[];
  query: string;
}

export interface TreeResponse {
  rows: TreeRow[];
  matches: number;
  truncated: boolean;
}

export type IndentOption = "2" | "4" | "compact";

export type CodeLang = "typescript" | "go" | "python" | "zod" | "rust" | "java" | "jsonschema" | "yaml" | "csv" | "xml";

export interface SchemaIssue {
  /** JavaScript-style accessor of the failing value, e.g. $.users[0].age */
  path: string;
  /** JSON pointer id compatible with the tree view. */
  pointer: string;
  keyword: string;
  message: string;
}

export type SchemaResult =
  | { ok: true; valid: boolean; issues: SchemaIssue[]; total: number; draft: string }
  | { ok: false; error: string };

export interface DiffLine {
  kind: "add" | "del" | "same";
  text: string;
  oldNo: number | null;
  newNo: number | null;
}

export type DiffResponse =
  | { ok: true; lines: DiffLine[]; added: number; removed: number; truncated: boolean }
  | { ok: false; side: "left" | "right"; error: ParseErrorInfo };

export interface NodeCopy {
  json: string;
  path: string;
}

export interface QueryItem {
  /** JavaScript-style accessor of the match, e.g. $.users[0].name */
  path: string;
  pointer: string;
  type: NodeType;
  preview: string;
}

export type QueryResult =
  | { ok: true; total: number; items: QueryItem[]; valuesJson: string | null }
  | { ok: false; error: string };
