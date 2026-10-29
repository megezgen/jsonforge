import { create } from "zustand";
import type { IndentOption, JsonStats, ParseErrorInfo } from "@/lib/types";

export type OutputTab = "tree" | "text" | "diff" | "schema" | "query" | "code";
export type Status = "empty" | "parsing" | "valid" | "invalid";

export interface Notice {
  id: number;
  kind: "success" | "error" | "info";
  text: string;
}

interface AppState {
  status: Status;
  stats: JsonStats | null;
  error: ParseErrorInfo | null;
  /** Bumped every time the input parses successfully; output tabs refetch on it. */
  version: number;
  /** True when the input is big enough that editor features get dialled down. */
  large: boolean;
  activeTab: OutputTab;
  indent: IndentOption;
  sortKeys: boolean;
  compareText: string;
  schemaText: string;
  queryText: string;
  codeOutput: string;
  notice: Notice | null;
  theme: "dark" | "light";

  setStatus: (s: Partial<Pick<AppState, "status" | "stats" | "error" | "large">>) => void;
  bumpVersion: () => void;
  setActiveTab: (t: OutputTab) => void;
  setIndent: (i: IndentOption) => void;
  setSortKeys: (b: boolean) => void;
  setCompareText: (t: string) => void;
  setSchemaText: (t: string) => void;
  setQueryText: (t: string) => void;
  setCodeOutput: (t: string) => void;
  notify: (kind: Notice["kind"], text: string) => void;
  clearNotice: () => void;
  setTheme: (t: "dark" | "light") => void;
}

let noticeId = 0;

export const useApp = create<AppState>((set) => ({
  status: "empty",
  stats: null,
  error: null,
  version: 0,
  large: false,
  activeTab: "tree",
  indent: "2",
  sortKeys: false,
  compareText: "",
  schemaText: "",
  queryText: "",
  codeOutput: "",
  notice: null,
  theme: "dark",

  setStatus: (s) => set(s),
  bumpVersion: () => set((st) => ({ version: st.version + 1 })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIndent: (indent) => set({ indent }),
  setSortKeys: (sortKeys) => set({ sortKeys }),
  setCompareText: (compareText) => set({ compareText }),
  setSchemaText: (schemaText) => set({ schemaText }),
  setQueryText: (queryText) => set({ queryText }),
  setCodeOutput: (codeOutput) => set({ codeOutput }),
  notify: (kind, text) => set({ notice: { id: ++noticeId, kind, text } }),
  clearNotice: () => set({ notice: null }),
  setTheme: (theme) => set({ theme }),
}));
