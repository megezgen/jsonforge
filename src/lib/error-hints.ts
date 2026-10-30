/**
 * Turns a parse error plus the offending text into a short, human explanation and a link to the
 * matching guide. Messages come from V8 (Chrome, Edge, Node.js); a few Firefox phrasings are matched too.
 */
export interface ErrorHint {
  /** Slug of the page under /json-errors/. */
  slug: string;
  /** One or two sentences shown in the error panel. */
  text: string;
  /** Short form used in toasts. */
  short: string;
  /** False when "Fix JSON" cannot help (the text is not damaged JSON). */
  repairable: boolean;
}

const HINTS: Record<string, Omit<ErrorHint, "slug">> = {
  "unexpected-token-less-than": {
    text: "This looks like HTML, not JSON. A server probably returned a web page (an error or login page) instead of data. Fix JSON cannot repair it: check the URL and the response status.",
    short: "This looks like HTML, not JSON, so it cannot be repaired",
    repairable: false,
  },
  "unexpected-end-of-json-input": {
    text: "The JSON ends too early: it is empty or was cut off before it was complete.",
    short: "The JSON is cut off",
    repairable: true,
  },
  "expected-property-name-or-close-brace": {
    text: "A key is not written in double quotes. Single quotes and unquoted keys are valid in JavaScript but not in JSON.",
    short: "A key is not in double quotes",
    repairable: true,
  },
  "trailing-comma": {
    text: "There is a comma after the last item of an object or array, which JSON does not allow.",
    short: "A comma follows the last item",
    repairable: true,
  },
  "expected-comma-or-closing-brace": {
    text: "A comma is missing between two items, or a comment is in the way. JSON has no comments.",
    short: "A comma is missing",
    repairable: true,
  },
  "undefined-is-not-valid-json": {
    text: "The text is undefined or [object Object], which is what JSON.parse sees when it is given something that is not JSON text. The problem is in the code that produced the value.",
    short: "This is not JSON text (undefined or an object)",
    repairable: false,
  },
  "bad-control-character-in-string": {
    text: "A line break, tab or backslash inside a string is not escaped. Write \\n, \\t and \\\\ instead.",
    short: "A string contains an unescaped character",
    repairable: true,
  },
  "unexpected-non-whitespace-after-json": {
    text: "There is extra text after the JSON: a second object, an extra bracket or trailing text.",
    short: "There is extra text after the JSON",
    repairable: true,
  },
  "unexpected-token-nan-bom": {
    text: "The text contains NaN, Infinity or an invisible character such as a byte-order mark (BOM). None of them are valid JSON.",
    short: "NaN, Infinity or an invisible character is in the text",
    repairable: true,
  },
};

function slugFor(text: string, message: string): string | null {
  const t = text.trimStart();
  const m = message.toLowerCase();

  if (/^<(!doctype|html|head|body|\?xml|[a-z][\w-]*[\s>/])/i.test(t)) return "unexpected-token-less-than";
  if (m.includes("[object object]") || /^"undefined" is not valid json/.test(m)) return "undefined-is-not-valid-json";
  if (m.includes("unexpected end of json input") || m.includes("unexpected end of data") || m.includes("unexpected eof") || m.includes("end of data")) {
    return "unexpected-end-of-json-input";
  }
  if (m.includes("bad control character") || m.includes("bad escaped character") || m.includes("bad escape")) return "bad-control-character-in-string";
  if (m.includes("non-whitespace") || m.includes("unexpected data after") || m.includes("after the json")) return "unexpected-non-whitespace-after-json";
  // A parser that fails exactly at the end of the text was waiting for more: the JSON is cut off.
  const at = /position (\d+)/.exec(m);
  if (at && /expected/.test(m) && Number(at[1]) >= t.trimEnd().length + (text.length - t.length)) return "unexpected-end-of-json-input";
  if (m.includes("expected double-quoted property name")) return "trailing-comma";
  if (m.includes("expected property name or '}'")) return "expected-property-name-or-close-brace";
  if (m.includes("after property value") || m.includes("after array element")) return "expected-comma-or-closing-brace";
  if (t.charCodeAt(0) === 0xfeff || m.includes("﻿")) return "unexpected-token-nan-bom";
  if (/^unexpected token '(n|i|-)'/.test(m) && /\b(nan|infinity)\b/i.test(text)) return "unexpected-token-nan-bom";
  if (/^unexpected token '[\]}]'/.test(m)) return "trailing-comma";
  return null;
}

export function hintForSlug(slug: string): ErrorHint | null {
  const h = HINTS[slug];
  return h ? { slug, ...h } : null;
}

export function explainError(text: string, message: string): ErrorHint | null {
  const slug = slugFor(text, message);
  return slug ? { slug, ...HINTS[slug]! } : null;
}
