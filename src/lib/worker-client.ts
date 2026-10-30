import type { WorkerRequest, WorkerResponse } from "@/workers/json.worker";
import type {
  CodeLang,
  DiffResponse,
  EditRequest,
  EditResult,
  IndentOption,
  NodeCopy,
  ParseResult,
  QueryResult,
  SchemaResult,
  TreeRequest,
  TreeResponse,
} from "./types";

type Distribute<T> = T extends { id: number } ? Omit<T, "id"> : never;
type Call = Distribute<WorkerRequest>;

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../workers/json.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    if (e.data.ok) p.resolve(e.data.result);
    else p.reject(new Error(e.data.error));
  };
  worker.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || "Worker crashed"));
    pending.clear();
    worker = null;
  };
  return worker;
}

function call<T>(msg: Call): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    getWorker().postMessage({ ...msg, id } as WorkerRequest);
  });
}

export const engine = {
  parse: (text: string) => call<ParseResult>({ op: "parse", text }),
  format: (indent: IndentOption, sortKeys: boolean) => call<string>({ op: "format", indent, sortKeys }),
  repair: (text: string) => call<string>({ op: "repair", text }),
  tree: (req: TreeRequest) => call<TreeResponse>({ op: "tree", req }),
  node: (nodeId: string) => call<NodeCopy>({ op: "node", nodeId }),
  codegen: (lang: CodeLang, rootName: string) => call<string>({ op: "codegen", lang, rootName }),
  diff: (left: string, right: string, sortKeys: boolean) => call<DiffResponse>({ op: "diff", left, right, sortKeys }),
  schema: (schemaText: string) => call<SchemaResult>({ op: "schema", schemaText }),
  edit: (req: EditRequest) => call<EditResult>({ op: "edit", req }),
  query: (expression: string, withValues = false) => call<QueryResult>({ op: "query", expression, withValues }),
};
