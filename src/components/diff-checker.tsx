"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, DiffControls, DiffResultView, Hint, SwapButton, invalidMessage, useDiffResult, type DiffSettings } from "@/components/diff-view";
import { PAGE_SAMPLES } from "@/lib/page-samples";

const SAMPLE = PAGE_SAMPLES["diff-checker"] ?? { json: "", compare: "" };

const BOX =
  "h-56 min-h-24 w-full resize-y rounded-md border border-line bg-bg p-2 font-mono text-xs outline-none focus:border-accent";

/** Diff checker page: two input boxes on top, the comparison below. Works on plain text and on JSON. */
export function DiffChecker() {
  const [original, setOriginal] = useState(SAMPLE.json);
  const [changed, setChanged] = useState(SAMPLE.compare ?? "");
  const [s, setS] = useState<DiffSettings>({ ...DEFAULT_SETTINGS, mode: "text" });
  const set = (p: Partial<DiffSettings>) => setS((o) => ({ ...o, ...p }));
  const result = useDiffResult(() => original, changed, s, false, [original]);
  const invalid = invalidMessage(result, "original text", "changed text");
  const json = s.mode === "json";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 pb-4">
      <div className="grid gap-2 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="orig" className="text-xs font-medium text-muted">
            Original text
          </label>
          <textarea id="orig" value={original} onChange={(e) => setOriginal(e.target.value)} spellCheck={false} placeholder={json ? "Paste the original JSON" : "Paste the original text"} className={BOX} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="chg" className="text-xs font-medium text-muted">
            Changed text
          </label>
          <textarea id="chg" value={changed} onChange={(e) => setChanged(e.target.value)} spellCheck={false} placeholder={json ? "Paste the changed JSON" : "Paste the changed text"} className={BOX} />
        </div>
      </div>

      <DiffControls s={s} set={set} result={result}>
        <SwapButton
          onClick={() => {
            setOriginal(changed);
            setChanged(original);
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            setOriginal(SAMPLE.json);
            setChanged(SAMPLE.compare ?? "");
          }}
        >
          Load sample
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setOriginal("");
            setChanged("");
          }}
        >
          Clear
        </Button>
      </DiffControls>

      <div className="flex h-[60vh] min-h-80 flex-col overflow-hidden rounded-md border border-line">
        {!changed.trim() && <Hint text="Paste the changed text on the right to see the differences." />}
        {invalid && <Hint danger text={invalid} />}
        {result?.ok && <DiffResultView result={result} s={s} leftTitle="Original" rightTitle="Changed" />}
      </div>
    </div>
  );
}
