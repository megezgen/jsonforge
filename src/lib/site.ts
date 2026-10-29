import type { CodeLang, IndentOption } from "./types";
import type { OutputTab } from "@/store/app-store";

export const SITE_NAME = "JSON Forge";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://jsonforge.dev").replace(/\/$/, "");

export interface Faq {
  q: string;
  a: string;
}

export interface ToolPage {
  slug: string; // "" for the home page
  title: string;
  description: string;
  h1: string;
  intro: string;
  tab: OutputTab;
  lang?: CodeLang;
  indent?: IndentOption;
  /** Extra unique prose rendered below the how-to. */
  sections?: { h: string; p: string }[];
  howTo: { title: string; steps: string[] };
  faq: Faq[];
  keywords: string[];
}

export const COMMON_FAQ: Faq[] = [
  {
    q: "Is my JSON uploaded to a server?",
    a: "No. Parsing, validation, formatting, diffing and code generation all run inside your browser, using a Web Worker. Your data is never sent to any server, which makes the tool safe for API responses, configuration files and other sensitive payloads.",
  },
  {
    q: "How large a JSON file can I open?",
    a: "Files of 20 MB and more work. Parsing happens off the main thread and the tree view is virtualized, so only the rows you can see are rendered. The editor switches to a lighter mode for very large documents.",
  },
  {
    q: "What is the difference between formatting and minifying JSON?",
    a: "Formatting (pretty printing) adds line breaks and indentation so people can read the data. Minifying removes all optional whitespace to make the payload as small as possible for network transfer or storage. Both produce identical data.",
  },
];

export const PAGES: ToolPage[] = [
  {
    slug: "",
    title: "JSON Viewer Online: Tree View, Formatter & Validator",
    description:
      "Free online JSON viewer with a fast, searchable tree view. Open 20MB+ files without freezing, format, validate and convert JSON. 100% client-side: your data never leaves your browser.",
    h1: "JSON Viewer Online",
    intro:
      "View, search and edit JSON in a fast tree view, with instant validation and one-click formatting. Everything runs in your browser, so your data never leaves your device.",
    tab: "tree",
    howTo: {
      title: "How to view JSON online",
      steps: [
        "Paste your JSON into the editor on the left, drop a file onto it, or press Open.",
        "Explore the result in the Tree tab, search keys and values, and copy any value or path.",
        "Press Format (Ctrl+Enter) to beautify it with 2 or 4 spaces, or Minify to compact it.",
        "Use Copy Output or Download to take the formatted JSON with you.",
      ],
    },
    sections: [
      {
        h: "What can you do with the JSON viewer?",
        p: "Paste JSON, drop a file onto the editor or press Open, and the tree view shows the structure instantly. Click any object or array to expand or collapse it, use Expand and Collapse to open everything or fold it back to the first level, and search keys and values at the same time. Hover a row to copy its value or its path, for example $.users[0].address.city, ready to paste into code.",
      },
      {
        h: "Tree view or formatted text?",
        p: "The Tree tab is best for exploring: it shows types by colour, counts the children of every node and lets you jump to what you need. The Formatted tab shows the same data as indented text with 2 spaces, 4 spaces or compact output, and optional alphabetical key sorting. Use Format to write the pretty version back into the editor, or Minify to compress it.",
      },
      {
        h: "Understanding the colours and types",
        p: "Strings are shown in orange, numbers in green, booleans in blue and null in purple, so a value of the wrong type stands out at a glance. A number written as a string, such as \"42\", keeps its quotes and its string colour, which is one of the quickest ways to spot a data-type bug in an API response.",
      },
      {
        h: "Working with API responses",
        p: "Copy a response from your browser's network tab, curl output or a log line and paste it in. If the text contains single quotes, comments or trailing commas, press Fix JSON. Use the status bar to see the size, depth and number of nodes, which helps you estimate how heavy a payload is before it reaches production.",
      },
      {
        h: "Tips for very large JSON files",
        p: "Collapse everything first and expand only the branch you care about. Search narrows the tree to matching paths, which is faster than scrolling through hundreds of thousands of rows. For files above a few megabytes the editor automatically switches to a lighter mode, but parsing and the tree stay responsive because they run off the main thread.",
      },
      {
        h: "A viewer built for large files",
        p: "Most online formatters freeze on big payloads because they render every node. This tool parses in a background thread and virtualizes the tree, drawing only the rows on screen, so multi-megabyte API dumps and exports stay responsive. Search matches keys and values and opens the path to each hit.",
      },
      {
        h: "Private by design",
        p: "There is no upload step and no backend. Your JSON is processed by JavaScript running in your own browser tab, so tokens, customer records or internal configuration never reach a third-party server. You can verify this in your browser's network tab.",
      },
    ],
    faq: [
      {
        q: "How do I fix invalid JSON?",
        a: "Press Fix JSON. It repairs common problems such as single quotes, unquoted keys, trailing commas, comments and missing brackets. If something remains broken, the status bar and Go to error button point to the exact line and column.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json viewer", "json viewer online", "json tree viewer", "json file viewer", "json formatter", "json beautifier"],
  },
  {
    slug: "json-validator",
    title: "JSON Validator Online: Check Syntax & Find Errors Instantly",
    description:
      "Validate JSON online with exact line and column error locations. Free, instant and private: your JSON is checked in your browser and never uploaded.",
    h1: "JSON Validator",
    intro:
      "Check whether your JSON is valid as you type. Errors are reported with the exact line and column, and the Fix JSON button can repair the most common mistakes automatically.",
    tab: "tree",
    howTo: {
      title: "How to validate JSON",
      steps: [
        "Paste or type your JSON in the editor. Validation runs automatically while you type.",
        "Read the status bar: a green badge means valid, a red message shows the error and its position.",
        "Press Go to error to jump to the problem, or Fix JSON to attempt an automatic repair.",
      ],
    },
    sections: [
      {
        h: "Reading a JSON error message",
        p: "Parsers report the position where they gave up, which is often one token after the real mistake. If the error points at a closing brace, check the line above for a missing comma or an unclosed string. Unexpected end of input almost always means a bracket was never closed.",
      },
      {
        h: "Strict JSON versus JavaScript objects",
        p: "Object literals copied from JavaScript code frequently fail validation: they use single quotes, unquoted keys, trailing commas or comments, and may contain undefined or NaN. JSON allows none of these, which is why Fix JSON can rewrite them into valid syntax.",
      },
    ],
    faq: [
      {
        q: "What are the most common JSON syntax errors?",
        a: "Trailing commas after the last item, single quotes instead of double quotes, unquoted property names, comments, and missing closing brackets or braces. Standard JSON allows none of them.",
      },
      {
        q: "Does the validator support JSON Schema?",
        a: "This tool checks JSON syntax. Schema validation is not included yet.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json validator", "validate json", "json lint", "json syntax checker"],
  },
  {
    slug: "json-to-typescript",
    title: "JSON to TypeScript Interface Generator Online",
    description:
      "Convert JSON to TypeScript interfaces instantly. Handles nested objects, arrays, optional fields and union types. Runs in your browser, nothing is uploaded.",
    h1: "JSON to TypeScript",
    intro:
      "Generate clean TypeScript interfaces from any JSON sample. Nested objects become named interfaces, arrays are merged into one element type, and fields missing from some items become optional.",
    tab: "code",
    lang: "typescript",
    howTo: {
      title: "How to convert JSON to TypeScript",
      steps: [
        "Paste a representative JSON sample (an API response works well) into the editor.",
        "Open the Code tab and pick TypeScript. Set the root interface name if you like.",
        "Copy the generated interfaces into your project.",
      ],
    },
    sections: [
      {
        h: "How the types are inferred",
        p: "The generator reads every element of an array and merges their shapes. Whole numbers and decimals both become number, mixed value types become union types such as string | null, and objects with the same structure share one interface instead of producing duplicates.",
      },
      {
        h: "Tips for accurate types",
        p: "Use a sample that includes the optional and nullable cases, ideally several records rather than one. A single example cannot reveal that a field is sometimes missing. Treat the output as a starting point and tighten it, for example by replacing string with a literal union.",
      },
    ],
    faq: [
      {
        q: "How are optional fields detected?",
        a: "When a key appears in some objects of an array but not in others, it is emitted as optional (key?: type). Fields whose values differ in type become union types.",
      },
      {
        q: "Should I use interface or type?",
        a: "The generator emits interfaces for objects, which are easy to extend and give clearer error messages. Rename or convert them freely.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json to typescript", "json to ts interface", "generate typescript types from json"],
  },
  {
    slug: "json-to-go",
    title: "JSON to Go Struct Converter Online",
    description: "Convert JSON to Go structs with correct json tags, pointers for optional fields and idiomatic field names. Fast, free and 100% client-side.",
    h1: "JSON to Go Struct",
    intro: "Turn a JSON sample into Go structs with json tags. Initialisms such as ID and URL are capitalized, and optional fields become pointers with omitempty.",
    tab: "code",
    lang: "go",
    howTo: {
      title: "How to convert JSON to a Go struct",
      steps: [
        "Paste your JSON into the editor.",
        "Open the Code tab and choose Go.",
        "Copy the structs into your package and adjust field types where you need more precision.",
      ],
    },
    sections: [
      {
        h: "Idiomatic Go output",
        p: "Field names are exported (capitalized) and common initialisms such as ID, URL and API follow Go naming conventions. The original JSON key is preserved in the struct tag, so encoding/json maps it correctly in both directions.",
      },
      {
        h: "Optional and nullable fields",
        p: "A field that is missing from some objects, or is sometimes null, becomes a pointer, and optional fields get omitempty. That lets you tell the difference between a missing value and a zero value, which a plain int or string cannot express.",
      },
    ],
    faq: [
      {
        q: "Which Go types are used for numbers?",
        a: "Whole numbers become int64 and numbers with a fraction become float64. If a field mixes both, float64 is used.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json to go", "json to golang struct", "json to struct"],
  },
  {
    slug: "json-to-python",
    title: "JSON to Python Pydantic Model Generator",
    description: "Generate Pydantic models from JSON. Supports nested models, lists, Optional and Union types. Free, private and runs in your browser.",
    h1: "JSON to Python (Pydantic)",
    intro: "Create Pydantic v2 models from a JSON sample. Keys that are not valid Python identifiers are mapped with aliases, and optional fields default to None.",
    tab: "code",
    lang: "python",
    howTo: {
      title: "How to convert JSON to Pydantic models",
      steps: [
        "Paste your JSON into the editor.",
        "Open the Code tab and choose Python (Pydantic).",
        "Copy the models and validate data with Model.model_validate(data).",
      ],
    },
    sections: [
      {
        h: "Why Pydantic?",
        p: "Pydantic validates data at runtime and gives you typed attributes and editor autocompletion. It is the model layer behind FastAPI, so the generated classes can be used directly as request and response schemas.",
      },
      {
        h: "Nested models and ordering",
        p: "Each nested object becomes its own BaseModel, defined before the model that uses it so the file runs top to bottom without forward references. Lists use List[...] and mixed values use Union or Optional.",
      },
    ],
    faq: [
      {
        q: "Are keys renamed?",
        a: "Keys are converted to snake_case. When the Python name differs from the JSON key, the field gets Field(alias=...) so parsing keeps working.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json to pydantic", "json to python class", "pydantic model generator"],
  },
  {
    slug: "json-diff",
    title: "JSON Diff Online: Compare Two JSON Documents",
    description:
      "Compare two JSON documents and see added and removed lines highlighted. Option to ignore key order. Private, fast and runs entirely in your browser.",
    h1: "JSON Diff",
    intro:
      "Find out exactly what changed between two JSON documents. Both sides are normalized first, so formatting differences and (optionally) key order do not show up as noise.",
    tab: "diff",
    howTo: {
      title: "How to compare two JSON files",
      steps: [
        "Put the first JSON in the editor on the left.",
        "Paste the second JSON into the comparison box in the Diff tab.",
        "Review added (green) and removed (red) lines. Turn on Changes only to hide everything else.",
      ],
    },
    sections: [
      {
        h: "How the comparison works",
        p: "Both documents are parsed, normalized to the same indentation and, by default, sorted by key. A line-by-line diff then highlights what was added and removed. This avoids the false positives you get when comparing raw text where only the formatting differs.",
      },
      {
        h: "Common uses",
        p: "Compare API responses before and after a deploy, check a config change, verify a data migration, or find out why two environments behave differently. Turn on Changes only to collapse everything that is identical.",
      },
    ],
    faq: [
      {
        q: "Does key order matter?",
        a: "By default it is ignored: keys are sorted before comparing, so only real data changes are highlighted. Untick Ignore key order to compare documents exactly as they are.",
      },
      ...COMMON_FAQ,
    ],
    keywords: ["json diff", "compare json", "json compare online", "json difference"],
  },
  {
    slug: "json-minify",
    title: "JSON Minifier Online: Compress & Minify JSON Instantly",
    description: "Minify JSON online by removing whitespace and line breaks. See the size saved, copy or download the result. Private and 100% client-side.",
    h1: "JSON Minifier",
    intro: "Strip every unnecessary space and line break from your JSON to make it as small as possible. Nothing is uploaded: the work happens in your browser.",
    tab: "text",
    indent: "compact",
    howTo: {
      title: "How to minify JSON",
      steps: [
        "Paste your JSON into the editor.",
        "Press Minify (Ctrl+Shift+Enter). The editor content is replaced by the compact version.",
        "Compare the size in the status bar, then copy or download the result.",
      ],
    },
    sections: [
      {
        h: "When should you minify JSON?",
        p: "Minify JSON before sending it over the network, embedding it in a script tag, storing it in a cookie or a database column, or putting it in a config value. Whitespace carries no meaning in JSON, so the data stays identical while the payload shrinks, often by 20 to 40 percent for pretty-printed files.",
      },
      {
        h: "Minifying versus compressing",
        p: "Minification removes characters; gzip or Brotli compression then encodes what remains more efficiently. They stack: a minified file compresses a little better than a pretty-printed one. For public APIs, enable HTTP compression on the server and minify as an extra step.",
      },
    ],
    faq: [
      { q: "Does minifying change my data?", a: "No. Only insignificant whitespace is removed. Keys, values, order and types stay exactly the same." },
      ...COMMON_FAQ,
    ],
    keywords: ["json minify", "minify json online", "compress json", "json compactor"],
  },
  {
    slug: "json-pretty-print",
    title: "JSON Pretty Print Online: Beautify & Indent JSON",
    description: "Pretty print JSON with 2 or 4 space indentation and optional key sorting. Free, instant and processed locally in your browser.",
    h1: "JSON Pretty Print",
    intro: "Turn dense, single-line JSON into readable, indented text. Choose 2 or 4 spaces and optionally sort keys alphabetically.",
    tab: "text",
    indent: "2",
    howTo: {
      title: "How to pretty print JSON",
      steps: [
        "Paste the JSON into the editor.",
        "Choose the indentation (2 or 4 spaces) in the Formatted tab, and tick Sort keys if you want alphabetical order.",
        "Press Format to write the pretty version back into the editor, or use Copy Output.",
      ],
    },
    sections: [
      {
        h: "2 spaces or 4 spaces?",
        p: "Two spaces is the common default in the JavaScript ecosystem and keeps deeply nested documents narrow. Four spaces is popular in Python, Java and many API documentation styles. Pick whichever matches the files already in your repository so diffs stay small.",
      },
      {
        h: "Why sort keys?",
        p: "JSON objects are unordered, so sorting keys changes nothing semantically. It makes files deterministic, which means version-control diffs only show real changes and two exports of the same data compare equal.",
      },
    ],
    faq: [
      { q: "Is pretty printed JSON still valid?", a: "Yes. Indentation and line breaks are insignificant whitespace in JSON, so the parsed data is identical." },
      ...COMMON_FAQ,
    ],
    keywords: ["json pretty print", "json beautifier", "format json online", "indent json"],
  },
  {
    slug: "json-to-yaml",
    title: "JSON to YAML Converter Online",
    description: "Convert JSON to clean, valid YAML instantly. Handles nested objects, arrays and special strings. Free and 100% client-side.",
    h1: "JSON to YAML",
    intro: "Convert JSON into readable YAML for Kubernetes, CI pipelines and configuration files. Strings that YAML could misread are quoted automatically.",
    tab: "code",
    lang: "yaml",
    howTo: {
      title: "How to convert JSON to YAML",
      steps: ["Paste your JSON into the editor.", "Open the Code tab and choose YAML.", "Copy the YAML into your config file."],
    },
    sections: [
      {
        h: "JSON and YAML compared",
        p: "In practice every JSON document can be written as YAML, which uses indentation instead of braces and brackets and allows comments. It is popular for configuration because it is easy to read and edit by hand, while JSON remains the safer choice for machine-to-machine exchange.",
      },
      {
        h: "Strings that need quotes",
        p: "Values such as yes, no, on, null, 1.0 or text containing a colon followed by a space would be read as booleans, numbers or nested maps in YAML. The converter wraps these in double quotes so the original type is preserved when the YAML is parsed back.",
      },
    ],
    faq: [{ q: "Will comments be preserved?", a: "JSON has no comments, so there is nothing to carry over. You can add comments to the YAML after converting." }, ...COMMON_FAQ],
    keywords: ["json to yaml", "convert json to yaml", "json yaml converter"],
  },
  {
    slug: "json-to-csv",
    title: "JSON to CSV Converter Online (Nested JSON Supported)",
    description: "Convert a JSON array to CSV with automatic headers and flattened nested fields. Private, instant and runs in your browser.",
    h1: "JSON to CSV",
    intro: "Convert a JSON array of objects into CSV for Excel, Google Sheets or a database import. Nested objects are flattened using dot notation such as address.city.",
    tab: "code",
    lang: "csv",
    howTo: {
      title: "How to convert JSON to CSV",
      steps: ["Paste a JSON array of objects into the editor.", "Open the Code tab and choose CSV.", "Copy the result and save it as a .csv file, or paste it straight into a spreadsheet."],
    },
    sections: [
      {
        h: "How nested data is flattened",
        p: "CSV is flat, so nested objects become columns named with dot notation (address.city) and array items are numbered (tags.0, tags.1). Columns are the union of all keys found in the array, so records that miss a field simply get an empty cell.",
      },
      {
        h: "Quoting and escaping",
        p: "Cells containing commas, quotes or line breaks are wrapped in double quotes, and inner quotes are doubled, following RFC 4180. That keeps the file readable by Excel, Google Sheets and every mainstream CSV parser.",
      },
    ],
    faq: [{ q: "What if my JSON is a single object?", a: "A single object produces one row. A JSON array of primitives produces a single column called value." }, ...COMMON_FAQ],
    keywords: ["json to csv", "convert json to csv", "json to excel", "nested json to csv"],
  },
  {
    slug: "json-to-xml",
    title: "JSON to XML Converter Online",
    description: "Convert JSON to well-formed XML with escaped values and valid element names. Free, fast and processed locally in your browser.",
    h1: "JSON to XML",
    intro: "Convert JSON into indented, well-formed XML. Special characters are escaped and keys are turned into valid element names.",
    tab: "code",
    lang: "xml",
    howTo: {
      title: "How to convert JSON to XML",
      steps: ["Paste your JSON into the editor.", "Open the Code tab and choose XML. Set the root element name if needed.", "Copy the XML output."],
    },
    sections: [
      {
        h: "How JSON maps to XML",
        p: "Objects become nested elements, and each key becomes a tag. Arrays repeat the element once per item, null becomes an empty element, and a top-level array is wrapped in the root element with one item element per entry.",
      },
      {
        h: "Invalid element names",
        p: "XML names cannot contain spaces or start with a digit. Keys like first name or 1st are rewritten (first_name, _1st) so the output is always well-formed.",
      },
    ],
    faq: [{ q: "Are attributes supported?", a: "No. Every value becomes element text, which keeps the conversion predictable and reversible." }, ...COMMON_FAQ],
    keywords: ["json to xml", "convert json to xml", "json xml converter"],
  },
];

/** Pages that exist besides the tools; they appear in the sitemap and footer. */
export const INFO_PAGES = [
  { slug: "about", label: "About" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Use" },
] as const;

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";

export function pageUrl(slug: string) {
  return slug ? `${SITE_URL}/${slug}/` : `${SITE_URL}/`;
}
