"use client";

import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";
import { MonacoView } from "./monaco";
import { editorBridge } from "@/lib/editor-bridge";
import { loadFile, parseNow, scheduleParse } from "@/lib/actions";
import { buildSample } from "@/lib/samples";
import { useApp } from "@/store/app-store";

export function InputEditor() {
  const large = useApp((s) => s.large);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    // Heavy language services and the minimap make multi-megabyte documents sluggish.
    ed.updateOptions({ minimap: { enabled: !large } });
  }, [large]);

  useEffect(() => () => editorBridge.detach(), []);

  return (
    <div
      className="h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
          e.preventDefault();
          void loadFile(file);
        }
      }}
    >
      <MonacoView
        defaultValue=""
        language={large ? "plaintext" : "json"}
        minimap
        onChange={() => scheduleParse()}
        onMount={(ed) => {
          editorRef.current = ed;
          editorBridge.attach({
            getValue: () => ed.getValue(),
            setValue: (text) => {
              ed.setValue(text);
              ed.setScrollTop(0);
              ed.setPosition({ lineNumber: 1, column: 1 });
            },
            replaceAll: (text) => {
              const model = ed.getModel();
              if (!model) return;
              ed.pushUndoStop();
              ed.executeEdits("tree-edit", [{ range: model.getFullModelRange(), text }]);
              ed.pushUndoStop();
            },
            reveal: (line, column) => {
              ed.revealLineInCenter(line);
              ed.setPosition({ lineNumber: line, column });
              ed.focus();
            },
          });
          if (!ed.getValue()) {
            ed.setValue(buildSample("small"));
          }
          void parseNow();
        }}
      />
    </div>
  );
}
