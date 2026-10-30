/**
 * Pages for the JSON error messages developers search for.
 * Error texts come from V8 (Chrome, Edge, Node.js) and were produced by running JSON.parse on the samples.
 * Firefox and Safari word these errors differently, which each page says without quoting them.
 */
export interface ErrorCause {
  t: string;
  p: string;
  bad?: string;
  good?: string;
}

export interface ErrorPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  /** Exact messages as printed by Chrome and Node.js. */
  messages: string[];
  summary: string;
  causes: ErrorCause[];
  code: { label: string; text: string };
  /** The broken JSON loaded into the tool at the top of the page. */
  sample: string;
  faq: { q: string; a: string }[];
  related: string[];
}

const LOCATE = [
  "Paste the text that you passed to JSON.parse into the editor above. The status bar shows the line and column of the first problem, and Go to error jumps there.",
  "Remember that the position in the message is where the parser gave up, which is often one token after the real mistake. Look at the character before it as well.",
  "If the text came from a request, log the raw response text before parsing it. In the browser, open the Network tab, select the request and read the Response tab.",
];

export const ERROR_PAGES: ErrorPage[] = [
  {
    slug: "unexpected-token-less-than",
    h1: "Unexpected token '<' in JSON at position 0",
    title: "Unexpected token '<' in JSON at position 0: Causes and Fixes",
    description:
      "Why JSON.parse says Unexpected token '<' (the response is HTML, not JSON), the five usual causes, and how to find out what your server really returned.",
    messages: [`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, "Unexpected token < in JSON at position 0 (older Chrome and Node.js)"],
    summary:
      "The text you tried to parse starts with the character <, which is the start of an HTML tag. JSON can never begin with <, so the parser stops at position 0. The server almost always sent an HTML page, for example an error page or a login page, where your code expected JSON.",
    causes: [
      {
        t: "The URL is wrong and the server returned a 404 page",
        p: "A typo in the path, a missing API prefix or the wrong base URL makes the server answer with its HTML \"Not Found\" page. Open the URL in a browser tab and check what it returns.",
      },
      {
        t: "The server crashed and returned an HTML error page",
        p: "A 500 error from a framework, a reverse proxy or a hosting platform is usually an HTML page. Check the HTTP status code, not just the body.",
        bad: "<!DOCTYPE html><html><body>Internal Server Error</body></html>",
      },
      {
        t: "You were redirected to a login page",
        p: "When a session expires, many sites answer API calls with the HTML login page. The status may even be 200 after following the redirect.",
      },
      {
        t: "A development server or proxy returned index.html",
        p: "Single-page-app dev servers return index.html for every unknown route. If your API proxy is not configured, a request to /api/users comes back as the app's HTML shell.",
      },
      {
        t: "You are reading a file or a script instead of an API",
        p: "Requesting data.json from a path that does not exist, or loading a page that wraps the JSON in HTML, produces the same error.",
      },
    ],
    code: {
      label: "Check the response before parsing it",
      text: `const res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);

const type = res.headers.get("content-type") ?? "";
if (!type.includes("application/json")) {
  console.error("Not JSON:", (await res.text()).slice(0, 200));
  throw new Error("Expected JSON but got " + type);
}
const data = await res.json();`,
    },
    sample: `<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body><h1>Not Found</h1></body>
</html>`,
    faq: [
      {
        q: "Can Fix JSON repair this?",
        a: "No. The text is not damaged JSON, it is a different format. Fix the request so that the server returns JSON.",
      },
      {
        q: "Why does it say position 0?",
        a: "Because the very first character is already invalid. The parser reads from the start and fails on the first character.",
      },
    ],
    related: ["unexpected-end-of-json-input", "undefined-is-not-valid-json"],
  },
  {
    slug: "unexpected-end-of-json-input",
    h1: "Unexpected end of JSON input",
    title: "Unexpected end of JSON input: Causes and Fixes",
    description:
      "What \"Unexpected end of JSON input\" means: the JSON is empty or cut off. Find out why a response is empty or truncated and how to handle it safely.",
    messages: ["Unexpected end of JSON input", "Expected ',' or ']' after array element in JSON at position 29 (line 1 column 30)"],
    summary:
      "The parser reached the end of the text while it still expected more: a closing bracket, a value after a colon, or any value at all. Either the text is empty, or it was cut off before the JSON was complete.",
    causes: [
      {
        t: "The response body is empty",
        p: "A 204 No Content response, a request that failed in the network layer, or an API that returns nothing for \"not found\" all give an empty string. JSON.parse(\"\") fails with exactly this message.",
        bad: "",
        good: "null",
      },
      {
        t: "The JSON was cut off",
        p: "Proxies with size limits, a crashed server that sent only part of the body, or a file that was not fully written leave a document that stops in the middle. Newer Chrome versions then name the missing piece, for example an expected comma or closing bracket.",
        bad: `{"name": "Ada", "tags": ["math", "code"`,
        good: `{"name": "Ada", "tags": ["math", "code"]}`,
      },
      {
        t: "You parse a value that was never saved",
        p: "Reading a key from localStorage that holds an empty string, or a file that was created but not written yet, gives empty text.",
      },
      {
        t: "The body was already consumed",
        p: "Calling res.json() after res.text() throws a different error, but code that reads the body in a middleware and then again can end up with an empty string.",
      },
    ],
    code: {
      label: "Parse empty or missing input safely",
      text: `function parseJson(text, fallback = null) {
  if (typeof text !== "string" || text.trim() === "") return fallback;
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON:", err.message, text.slice(0, 200));
    return fallback;
  }
}

const res = await fetch(url);
const data = res.status === 204 ? null : parseJson(await res.text());`,
    },
    sample: `{
  "id": 7,
  "name": "Ada",
  "tags": ["math", "code"`,
    faq: [
      {
        q: "How do I know whether it is empty or truncated?",
        a: "Log the text length and the last 100 characters before parsing. Zero length means empty. Text that ends mid-structure means it was cut off.",
      },
      {
        q: "Can Fix JSON repair truncated JSON?",
        a: "It can often close the missing brackets, which is useful to inspect what you received. It cannot recover data that never arrived, so fix the cause as well.",
      },
    ],
    related: ["unexpected-token-less-than", "expected-comma-or-closing-brace"],
  },
  {
    slug: "expected-property-name-or-close-brace",
    h1: "Expected property name or '}' in JSON",
    title: "Expected property name or '}' in JSON: Single Quotes and Unquoted Keys",
    description:
      "Fix \"Expected property name or '}' in JSON at position 1\": caused by single quotes or unquoted keys. See how JavaScript objects and Python dicts differ from JSON.",
    messages: ["Expected property name or '}' in JSON at position 1 (line 1 column 2)", "Unexpected token ' in JSON at position 1 (older Chrome and Node.js)"],
    summary:
      "A JSON object has to start with a double-quoted key. The parser found something else where a key should be, usually a single quote or a bare word, so it complains that it expected a property name or the closing brace.",
    causes: [
      {
        t: "Single quotes instead of double quotes",
        p: "JSON allows only double quotes, for keys and for string values. JavaScript, Python and many config formats allow single quotes, so text copied from them is not valid JSON.",
        bad: `{'name': 'Ada'}`,
        good: `{"name": "Ada"}`,
      },
      {
        t: "Unquoted keys",
        p: "A JavaScript object literal does not need quotes around simple keys. JSON does.",
        bad: `{name: "Ada", age: 36}`,
        good: `{"name": "Ada", "age": 36}`,
      },
      {
        t: "Text copied from console.log or a Python print",
        p: "Printing an object shows a human-friendly form with single quotes, and Python also prints True, False and None. These are not JSON. Generate the text with JSON.stringify in JavaScript or json.dumps in Python instead of copying printed output.",
        bad: `{'active': True, 'manager': None}`,
        good: `{"active": true, "manager": null}`,
      },
      {
        t: "A trailing or leading character",
        p: "An invisible byte-order mark or a stray character before the opening brace can also trigger this. Delete anything before the first {.",
      },
    ],
    code: {
      label: "Produce valid JSON instead of copying printed output",
      text: `// JavaScript
const text = JSON.stringify({ name: "Ada", active: true, manager: null });

# Python
import json
text = json.dumps({"name": "Ada", "active": True, "manager": None})`,
    },
    sample: `{
  'name': 'Ada',
  age: 36
}`,
    faq: [
      {
        q: "Does JSON allow single quotes anywhere?",
        a: "No. Strings and keys must use double quotes. A single quote is only valid inside a double-quoted string, for example \"it's fine\".",
      },
      {
        q: "Can I convert a JavaScript object to JSON automatically?",
        a: "Yes: press Fix JSON, which rewrites single quotes and unquoted keys. In code, build the data as an object and call JSON.stringify.",
      },
    ],
    related: ["trailing-comma", "unexpected-token-nan-bom"],
  },
  {
    slug: "trailing-comma",
    h1: "Trailing comma in JSON",
    title: "Trailing Comma in JSON: Expected double-quoted property name",
    description:
      "JSON does not allow a comma after the last item. See the exact error messages, why tsconfig and ESLint files differ, and how to remove trailing commas.",
    messages: ["Expected double-quoted property name in JSON at position 8 (line 1 column 9)", `Unexpected token ']', "[1, 2, 3,]" is not valid JSON`],
    summary:
      "A comma after the last property of an object or the last item of an array is allowed in JavaScript but not in JSON. After the comma the parser expects another key (objects) or value (arrays) and finds a closing brace or bracket instead.",
    causes: [
      {
        t: "A comma after the last property",
        p: "This is the classic mistake when you delete the last line of an object and keep the comma of the line above it. The error names the missing key.",
        bad: `{"a": 1,}`,
        good: `{"a": 1}`,
      },
      {
        t: "A comma after the last array item",
        p: "Arrays fail with an error that mentions the closing bracket.",
        bad: `[1, 2, 3,]`,
        good: `[1, 2, 3]`,
      },
      {
        t: "A file that is really JSONC or JSON5",
        p: "tsconfig.json, VS Code settings and many tool configs allow comments and trailing commas because their own parsers accept JSONC. JSON.parse does not, so reading such a file with JSON.parse fails. Use a parser that supports JSONC or JSON5, or strip the extras first.",
      },
      {
        t: "Generated text with a loop that always adds a comma",
        p: "Building JSON by string concatenation easily leaves a final comma. Build objects and arrays in code and serialise them with JSON.stringify.",
      },
    ],
    code: {
      label: "Never build JSON by hand",
      text: `// Fragile: leaves a trailing comma
let out = "[";
for (const x of items) out += JSON.stringify(x) + ",";
out += "]";

// Correct
const out = JSON.stringify(items);`,
    },
    sample: `{
  "name": "Ada",
  "tags": ["math", "code",],
}`,
    faq: [
      {
        q: "Why do some editors accept trailing commas?",
        a: "They treat the file as JSONC or JSON5. That is a superset of JSON that JSON.parse and most APIs do not accept.",
      },
      {
        q: "Will Fix JSON remove them?",
        a: "Yes. Fix JSON removes trailing commas along with other common problems such as comments and single quotes.",
      },
    ],
    related: ["expected-property-name-or-close-brace", "expected-comma-or-closing-brace"],
  },
  {
    slug: "expected-comma-or-closing-brace",
    h1: "Expected ',' or '}' after property value in JSON",
    title: "Expected ',' or '}' after property value in JSON: Missing Comma",
    description:
      "Fix \"Expected ',' or '}' after property value in JSON\": a missing comma, a comment or a merge conflict in your JSON. Includes the array version of the error.",
    messages: ["Expected ',' or '}' after property value in JSON at position 8 (line 1 column 9)", "Expected ',' or ']' after array element in JSON at position 3 (line 1 column 4)"],
    summary:
      "After a value, the parser needs either a comma (more items follow) or the closing brace or bracket. It found something else, most often the start of the next key because a comma is missing.",
    causes: [
      {
        t: "A missing comma between properties",
        p: "Typically after adding a new line by hand. The reported position is the start of the second key, because that is where the parser gave up.",
        bad: `{"a": 1 "b": 2}`,
        good: `{"a": 1, "b": 2}`,
      },
      {
        t: "A missing comma between array items",
        p: "The array version of the same mistake mentions a closing bracket.",
        bad: `[1 2]`,
        good: `[1, 2]`,
      },
      {
        t: "Comments in the JSON",
        p: "// and /* */ comments are not part of JSON. After a value, a comment looks like an unexpected character, so you get this same error.",
        bad: `{"a": 1 // note\n}`,
        good: `{"a": 1}`,
      },
      {
        t: "A merge conflict or pasted text",
        p: "Lines such as <<<<<<< HEAD left over from a merge, or a log line pasted in the middle of the data, break the structure at that point.",
      },
    ],
    code: {
      label: "Find the first broken line quickly",
      text: `try {
  JSON.parse(text);
} catch (err) {
  // Newer engines include the line and column in the message
  console.error(err.message);
}`,
    },
    sample: `{
  "name": "Ada"
  "age": 36 // years
}`,
    faq: [
      {
        q: "The error points at the second key, but the missing comma is above it. Why?",
        a: "The parser only notices a problem when it reads the next token. The real mistake is the end of the previous line, where a comma should be.",
      },
      {
        q: "Does JSON have comments?",
        a: "No. If you need comments, keep them in a separate field such as \"_comment\", or use a format that supports them like JSONC or YAML.",
      },
    ],
    related: ["trailing-comma", "unexpected-end-of-json-input"],
  },
  {
    slug: "undefined-is-not-valid-json",
    h1: "\"undefined\" is not valid JSON",
    title: "\"undefined\" or \"[object Object]\" is not valid JSON",
    description:
      "JSON.parse(undefined) and JSON.parse of an object both fail. Understand why, how to avoid double parsing, and how to guard against undefined input.",
    messages: [`"undefined" is not valid JSON`, `"[object Object]" is not valid JSON`],
    summary:
      "JSON.parse converts its argument to a string first. undefined becomes the text undefined, and an object becomes [object Object]. Neither is JSON, so you get an error that quotes what the parser actually saw. The problem is in your code, not in the data.",
    causes: [
      {
        t: "The variable is undefined",
        p: "A property that does not exist, a value that was not loaded yet, or an unset environment variable passed to JSON.parse.",
        bad: `JSON.parse(undefined)`,
      },
      {
        t: "You parse something that is already an object",
        p: "Libraries such as axios and fetch's res.json() already return parsed data. Parsing it again turns the object into the text [object Object].",
        bad: `const { data } = await axios.get(url);\nJSON.parse(data);`,
        good: `const { data } = await axios.get(url); // already an object`,
      },
      {
        t: "A value was stored with String() or without stringify",
        p: "localStorage only stores strings. Writing an object directly stores the text [object Object]. Always use JSON.stringify when saving and JSON.parse when reading.",
        bad: `localStorage.setItem("user", user);`,
        good: `localStorage.setItem("user", JSON.stringify(user));`,
      },
    ],
    code: {
      label: "Guard against non-string input",
      text: `function safeParse(value) {
  if (typeof value !== "string") return value; // already parsed (or undefined)
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}`,
    },
    sample: `undefined`,
    faq: [
      {
        q: "What does JSON.parse(null) do?",
        a: "It returns null, because null is converted to the text null, which is valid JSON. That is why reading a missing localStorage key does not throw.",
      },
      {
        q: "Is undefined a JSON value?",
        a: "No. JSON has null but no undefined. JSON.stringify leaves undefined properties out of objects and turns them into null inside arrays.",
      },
    ],
    related: ["unexpected-end-of-json-input", "unexpected-token-less-than"],
  },
  {
    slug: "bad-control-character-in-string",
    h1: "Bad control character in string literal in JSON",
    title: "Bad control character in string literal in JSON (and Bad escaped character)",
    description:
      "Fix \"Bad control character in string literal\" and \"Bad escaped character\": raw newlines, tabs and Windows paths inside JSON strings. Learn the escape rules.",
    messages: ["Bad control character in string literal in JSON at position 12 (line 1 column 13)", "Bad escaped character in JSON at position 13 (line 1 column 14)"],
    summary:
      "Inside a JSON string, characters below U+0020 (new lines, tabs and other control characters) must be written as escape sequences, and a backslash must start a valid escape. A raw line break inside a string, or a backslash followed by an unknown character, is rejected.",
    causes: [
      {
        t: "A real line break inside a string",
        p: "Pasting multi-line text between the quotes puts an actual newline in the string. Write it as \\n instead.",
        bad: `{"note": "line one\nline two"}`,
        good: `{"note": "line one\\nline two"}`,
      },
      {
        t: "A raw tab character",
        p: "Tabs copied from a spreadsheet or a code editor are control characters too. Use \\t.",
      },
      {
        t: "Windows paths and other backslashes",
        p: "A backslash begins an escape such as \\n or \\u. In C:\\Users the \\U is not a valid escape. Double every backslash.",
        bad: `{"path": "C:\\Users\\ada"}`,
        good: `{"path": "C:\\\\Users\\\\ada"}`,
      },
    ],
    code: {
      label: "Let JSON.stringify do the escaping",
      text: `const note = "line one\\nline two";
const path = "C:\\\\Users\\\\ada";
const json = JSON.stringify({ note, path });
// {"note":"line one\\nline two","path":"C:\\\\Users\\\\ada"}`,
    },
    sample: `{
  "note": "line one
line two",
  "path": "C:\\Users\\ada"
}`,
    faq: [
      {
        q: "Which escapes are valid in JSON?",
        a: "\\\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX for any code point. Anything else after a backslash is an error.",
      },
      {
        q: "Does Fix JSON handle this?",
        a: "Yes, it escapes line breaks inside strings and repairs common backslash problems. Check the result for paths, because the intended meaning is sometimes ambiguous.",
      },
    ],
    related: ["expected-property-name-or-close-brace", "unexpected-token-nan-bom"],
  },
  {
    slug: "unexpected-non-whitespace-after-json",
    h1: "Unexpected non-whitespace character after JSON",
    title: "Unexpected non-whitespace character after JSON at position N",
    description:
      "Why JSON.parse reports extra data after the JSON: concatenated objects, JSON Lines, an extra closing brace or trailing text. How to parse multiple documents.",
    messages: ["Unexpected non-whitespace character after JSON at position 7 (line 1 column 8)", "Unexpected non-whitespace character after JSON at position 8 (line 1 column 9)"],
    summary:
      "The parser read one complete JSON value successfully and then found more text after it. A JSON document may contain exactly one top-level value, optionally surrounded by whitespace, so anything after it is an error.",
    causes: [
      {
        t: "Several JSON documents in one text",
        p: "Two objects side by side, or one per line (JSON Lines or NDJSON), are not one JSON document. This is the usual cause for log files and streaming exports.",
        bad: `{"a": 1}\n{"b": 2}`,
        good: `[{"a": 1}, {"b": 2}]`,
      },
      {
        t: "An extra closing brace or bracket",
        p: "One closing character too many, often after editing by hand. The position points at the extra character.",
        bad: `{"a": 1}}`,
        good: `{"a": 1}`,
      },
      {
        t: "Trailing text after the JSON",
        p: "A semicolon from a JavaScript file (such as module.exports = {...};), a log timestamp, or a leftover line break with text. Cut everything after the final closing brace.",
      },
    ],
    code: {
      label: "Parse JSON Lines one line at a time",
      text: `const records = text
  .split("\\n")
  .filter((line) => line.trim() !== "")
  .map((line) => JSON.parse(line));`,
    },
    sample: `{"id": 1, "name": "Ada"}
{"id": 2, "name": "Alan"}`,
    faq: [
      {
        q: "How do I view a JSON Lines file here?",
        a: "Paste one line at a time, or wrap all lines in square brackets and separate them with commas to turn them into a single array.",
      },
      {
        q: "Is there a way to parse the first value and ignore the rest?",
        a: "Not with JSON.parse. Cut the text at the end of the first value, or use a streaming parser that can read several values from one stream.",
      },
    ],
    related: ["expected-comma-or-closing-brace", "unexpected-end-of-json-input"],
  },
  {
    slug: "unexpected-token-nan-bom",
    h1: "Unexpected token 'N' or an invisible character in JSON",
    title: "Unexpected token 'N' (NaN, Infinity) or Invisible Character in JSON",
    description:
      "NaN, Infinity, undefined and a byte-order mark (BOM) are not valid JSON. See the errors they cause and how to export and read JSON correctly.",
    messages: [`Unexpected token 'N', "{"a": NaN}" is not valid JSON`, `Unexpected token '﻿', "﻿{}" is not valid JSON (the quoted first character is an invisible U+FEFF)`],
    summary:
      "Two unrelated things produce \"Unexpected token\" errors that are hard to see. JavaScript values that JSON cannot represent, such as NaN and Infinity, and an invisible byte-order mark (BOM) at the very start of a file.",
    causes: [
      {
        t: "NaN, Infinity or undefined as values",
        p: "JSON has only numbers, strings, booleans, null, arrays and objects. NaN and Infinity are not numbers in JSON, and undefined does not exist. Python's json.dumps writes NaN by default, which is a common source of invalid files.",
        bad: `{"score": NaN, "ratio": Infinity}`,
        good: `{"score": null, "ratio": null}`,
      },
      {
        t: "A byte-order mark at the start of the file",
        p: "Some Windows editors save UTF-8 files with a BOM, the invisible character U+FEFF. It is not whitespace for JSON, so parsing fails on the first character even though the file looks fine. Save as UTF-8 without BOM, or strip it before parsing.",
      },
      {
        t: "Other invisible characters",
        p: "Non-breaking spaces and zero-width characters copied from web pages or documents look like spaces but are not valid between JSON tokens.",
      },
    ],
    code: {
      label: "Strip a BOM and forbid NaN when exporting",
      text: `// JavaScript: strip a BOM before parsing
const data = JSON.parse(text.replace(/^\\uFEFF/, ""));

# Python: read a BOM file, and refuse NaN when writing
data = json.load(open("data.json", encoding="utf-8-sig"))
json.dumps(data, allow_nan=False)`,
    },
    sample: `{
  "score": NaN,
  "ratio": Infinity,
  "name": "Ada"
}`,
    faq: [
      {
        q: "How can I see an invisible character?",
        a: "Check the length of the text or its first character code, for example text.charCodeAt(0) is 65279 for a BOM. Many editors can also show invisible characters.",
      },
      {
        q: "What should NaN become?",
        a: "Usually null, which means \"no value\". Decide this in your data pipeline instead of letting NaN reach the JSON.",
      },
    ],
    related: ["expected-property-name-or-close-brace", "bad-control-character-in-string"],
  },
];

export const LOCATE_STEPS = LOCATE;
export const errorPageBySlug = (slug: string) => ERROR_PAGES.find((p) => p.slug === slug);
