/**
 * Imperative bridge to the Monaco input editor.
 *
 * The (potentially 20 MB) document text deliberately never lives in React
 * state: the editor owns it and we only read it on demand, which keeps every
 * keystroke cheap.
 */
interface EditorHandle {
  getValue(): string;
  setValue(text: string): void;
  /** Replaces the whole document as one undoable edit (Ctrl+Z restores the previous text). */
  replaceAll(text: string): void;
  reveal(line: number, column: number): void;
}

let handle: EditorHandle | null = null;
let pendingText: string | null = null;

export const editorBridge = {
  attach(h: EditorHandle) {
    handle = h;
    if (pendingText !== null) {
      h.setValue(pendingText);
      pendingText = null;
    }
  },
  detach() {
    handle = null;
  },
  getValue(): string {
    return handle ? handle.getValue() : (pendingText ?? "");
  },
  setValue(text: string) {
    if (handle) handle.setValue(text);
    else pendingText = text;
  },
  replaceAll(text: string) {
    if (handle) handle.replaceAll(text);
    else pendingText = text;
  },
  reveal(line: number, column: number) {
    handle?.reveal(line, column);
  },
};
