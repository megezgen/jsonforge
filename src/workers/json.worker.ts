import * as engine from "@/lib/engine";
import type { CodeLang, IndentOption, TreeRequest } from "@/lib/types";

export type WorkerRequest =
  | { id: number; op: "parse"; text: string }
  | { id: number; op: "format"; indent: IndentOption; sortKeys: boolean }
  | { id: number; op: "repair"; text: string }
  | { id: number; op: "tree"; req: TreeRequest }
  | { id: number; op: "node"; nodeId: string }
  | { id: number; op: "codegen"; lang: CodeLang; rootName: string }
  | { id: number; op: "diff"; left: string; right: string; sortKeys: boolean };

export type WorkerResponse = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };

interface WorkerScope {
  onmessage: ((e: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
}
const scope = self as unknown as WorkerScope;

scope.onmessage = (e) => {
  const msg = e.data;
  try {
    let result: unknown;
    switch (msg.op) {
      case "parse":
        result = engine.parse(msg.text);
        break;
      case "format":
        result = engine.format(msg.indent, msg.sortKeys);
        break;
      case "repair":
        result = engine.repair(msg.text);
        break;
      case "tree":
        result = engine.tree(msg.req);
        break;
      case "node":
        result = engine.nodeCopy(msg.nodeId);
        break;
      case "codegen":
        result = engine.codegen(msg.lang, msg.rootName);
        break;
      case "diff":
        result = engine.diff(msg.left, msg.right, msg.sortKeys);
        break;
    }
    scope.postMessage({ id: msg.id, ok: true, result });
  } catch (err) {
    scope.postMessage({ id: msg.id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
