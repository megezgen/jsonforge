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
  sortKeys?: boolean;
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
    q: "Does it work offline?",
    a: "Yes, after the first visit. The editor and tools are stored in your browser, so you can use them without a connection. Only the TypeScript, CSS and HTML language workers used for extra highlighting in the Code tab are downloaded the first time you use them.",
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
      "Free online JSON viewer with a fast, searchable tree view. Open 20MB+ files in seconds, format, validate and convert JSON. 100% client-side: your data never leaves your browser.",
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
        h: "Works offline",
        p: "After your first visit the app keeps its code and editor in your browser, so you can open it with no connection: paste JSON, format, validate, convert and diff as usual. Pages you have not opened yet fall back to the main tool. You can also install it from your browser's menu (Install app) to get a window of its own. Because everything already runs locally, going offline changes nothing about your data.",
      },
      {
        h: "Share JSON without uploading it",
        p: "Press Share to put your JSON into a link. The data is compressed and stored in the part of the address after the # sign, which browsers never send to any server, so there is no upload and no account. Anyone with the link sees the same JSON. Links are limited to roughly 8,000 characters after compression, so they suit snippets, configs and API samples rather than huge files. Treat a link like the data itself: do not paste it anywhere public if the JSON is sensitive.",
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
        a: "Yes. Open the Schema tab, paste a JSON Schema (or generate one from your data) and the editor content is validated against it, with the path and reason for every problem. See the JSON Schema Validator page for details.",
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
  {
    slug: "large-json-viewer",
    title: "Large JSON Viewer Online: Open 20MB+ Files Without Freezing",
    description: "View very large JSON files online without lag. Background parsing and a virtualized tree handle 20MB+ documents, and nothing is uploaded.",
    h1: "Large JSON Viewer",
    intro: "Open multi-megabyte JSON files that make other online viewers freeze. Parsing runs in a background thread and only the visible tree rows are drawn.",
    tab: "tree",
    howTo: {
      title: "How to open a large JSON file",
      steps: [
        "Press Open and choose your file, or drag it onto the editor. You can also use Load Sample, then Large, to try a 20 MB example.",
        "Wait for the status bar to show Valid JSON with the size, depth and node count.",
        "Collapse everything, then expand only the branch you need, or use search to jump to a key or value.",
      ],
    },
    sections: [
      {
        h: "Why big JSON files freeze most viewers",
        p: "Most tools parse on the main browser thread and build a DOM element for every node. A file with a million nodes means a million elements, which locks the page. This viewer parses in a Web Worker and renders only the few dozen rows that fit on screen, so scrolling, searching and expanding stay smooth whatever the file size. Loading the text into the editor still runs on the main thread, so very large files can pause the page briefly while they load (see the benchmarks page for measured numbers).",
      },
      {
        h: "What to expect with huge files",
        p: "On a desktop computer with Chrome a 25 MB file is parsed and shown as valid in roughly two to three seconds, and the page can pause for a second or two while the editor loads the text (measured numbers are on the benchmarks page). For very large inputs the editor switches to a lighter mode without minimap or language services. The tree view lists at most 250,000 rows at once; if you expand everything on a bigger file, collapse some branches or use search to narrow it down.",
      },
      {
        h: "Your data stays on your device",
        p: "Large files often contain real production exports, logs or customer data. Nothing is uploaded: the file is read by your browser and processed locally, so you can inspect sensitive dumps without sending them to a third party.",
      },
    ],
    faq: [
      { q: "What is the maximum file size?", a: "There is no fixed limit; the practical limit is your browser memory. Files above 20 MB open on typical machines. Very large files may take a few seconds to parse." },
      { q: "Can I search inside a large file?", a: "Yes. The Tree tab search matches keys and values, shows the number of matches and opens the path to each one." },
      ...COMMON_FAQ,
    ],
    keywords: ["large json viewer", "open large json file", "big json viewer", "json viewer for large files"],
  },
  {
    slug: "json-tree-viewer",
    title: "JSON Tree Viewer Online: Explore JSON as an Expandable Tree",
    description: "Explore JSON as a collapsible tree with colour-coded types, search and one-click copy of values and paths. Free and 100% client-side.",
    h1: "JSON Tree Viewer",
    intro: "See any JSON document as an expandable tree. Objects and arrays fold and unfold, types are colour coded and every node shows how many children it has.",
    tab: "tree",
    howTo: {
      title: "How to use the JSON tree viewer",
      steps: [
        "Paste JSON into the editor. The tree on the right updates as you type.",
        "Click a row to expand or collapse it. Use Expand and Collapse to open or fold the whole document.",
        "Hover a row and use the icons to copy the value or its path, for example $.users[0].name.",
      ],
    },
    sections: [
      {
        h: "Reading the tree",
        p: "Each row shows a key and its value. Objects show the number of keys and arrays show the number of items, so you can judge the size of a branch without opening it. Array items are labelled with their index, which is the number you need in a path expression.",
      },
      {
        h: "Search and copy paths",
        p: "Type in the search box to filter the tree to rows whose key or value matches; parents of every match open automatically. Copying a path gives you a JavaScript-style accessor you can paste into code, or into a JSONPath tool, to read the same value programmatically.",
      },
    ],
    faq: [
      { q: "Can I edit values in the tree?", a: "The tree is read-only. Edit the JSON in the editor on the left and the tree updates immediately." },
      ...COMMON_FAQ,
    ],
    keywords: ["json tree viewer", "json tree view online", "json viewer tree", "expandable json viewer"],
  },
  {
    slug: "json-file-viewer",
    title: "JSON File Viewer Online: Open and Read .json Files Privately",
    description: "Open a .json file from your computer and read it as a tree or formatted text. The file is never uploaded; everything runs in your browser.",
    h1: "JSON File Viewer",
    intro: "Open a .json file straight from your computer, or drag it onto the editor, and read it as a tree or as formatted text. The file never leaves your device.",
    tab: "tree",
    howTo: {
      title: "How to open a JSON file",
      steps: [
        "Press Open and pick a .json file, or drag the file onto the editor.",
        "Read the structure in the Tree tab, or switch to Formatted for indented text.",
        "Use Download to save a formatted or minified copy.",
      ],
    },
    sections: [
      {
        h: "Opening files without uploading them",
        p: "The file is read with your browser's file API and handed to the same in-page engine used for pasted text. There is no upload step, no server and no copy of your data kept anywhere else, which is what you want for exports, backups and configuration files.",
      },
      {
        h: "Files that will not open",
        p: "If the file is not valid JSON the status bar shows the error with its line and column. Common causes are a byte-order mark, trailing commas, comments, or several JSON documents in one file (JSON Lines). Use Fix JSON for the first three; for JSON Lines, paste a single line at a time.",
      },
    ],
    faq: [
      { q: "Which file types are supported?", a: "Any text file that contains valid JSON, usually .json. Plain .txt files work too." },
      ...COMMON_FAQ,
    ],
    keywords: ["json file viewer", "open json file online", "json file reader", "view json file"],
  },
  {
    slug: "json-sorter",
    title: "JSON Sorter Online: Sort JSON Keys Alphabetically",
    description: "Sort JSON object keys alphabetically at every level. Great for clean diffs and consistent config files. Free, instant and 100% client-side.",
    h1: "JSON Sorter",
    intro: "Sort the keys of every object in your JSON alphabetically, at every level of nesting. Array order is left untouched.",
    tab: "text",
    sortKeys: true,
    howTo: {
      title: "How to sort JSON keys",
      steps: [
        "Paste your JSON into the editor.",
        "Keep Sort keys ticked in the Formatted tab, which is on by default on this page.",
        "Press Format to write the sorted JSON back into the editor, or copy it from the Formatted tab.",
      ],
    },
    sections: [
      {
        h: "Why sort keys?",
        p: "JSON objects have no defined order, so reordering keys never changes the meaning of the data. Sorting makes files deterministic: the same data always produces the same text, so version-control diffs only show real changes and two exports compare equal.",
      },
      {
        h: "What is and is not sorted",
        p: "Object keys are sorted alphabetically (by code unit order) at every depth. Arrays keep their original order, because order is meaningful in an array. Values are not modified.",
      },
    ],
    faq: [
      { q: "Does sorting change my data?", a: "No. Only the order of keys inside objects changes. Values and array order stay the same." },
      ...COMMON_FAQ,
    ],
    keywords: ["json sorter", "sort json keys", "sort json online", "alphabetize json"],
  },
  {
    slug: "json-to-zod",
    title: "JSON to Zod Schema Generator Online",
    description: "Generate Zod schemas and inferred TypeScript types from JSON. Handles nested objects, arrays, optional and nullable fields. Runs in your browser.",
    h1: "JSON to Zod",
    intro: "Turn a JSON sample into Zod schemas plus inferred TypeScript types, ready to validate API responses at runtime.",
    tab: "code",
    lang: "zod",
    howTo: {
      title: "How to convert JSON to a Zod schema",
      steps: ["Paste a representative JSON sample into the editor.", "Open the Code tab and choose Zod.", "Copy the schemas and call Root.parse(data) to validate real data."],
    },
    sections: [
      {
        h: "Runtime validation, not just types",
        p: "TypeScript interfaces disappear at runtime, so they cannot check what an API actually returns. A Zod schema validates the data and gives you the matching static type through z.infer, so one definition covers both compile time and runtime.",
      },
      {
        h: "How fields are mapped",
        p: "Whole numbers become z.number().int(), values that can be null get .nullable(), and keys missing from some objects get .optional(). Nested objects become their own named schemas, defined before they are used.",
      },
    ],
    faq: [{ q: "Which Zod version does the output target?", a: "The schemas use APIs that are the same in Zod 3 and Zod 4: z.object, z.array, z.union, z.number().int(), nullable and optional." }, ...COMMON_FAQ],
    keywords: ["json to zod", "zod schema generator", "generate zod from json"],
  },
  {
    slug: "json-to-rust",
    title: "JSON to Rust Struct Generator (serde)",
    description: "Convert JSON to Rust structs with serde Serialize and Deserialize derives. Handles nested objects, Option fields and renamed keys. Runs in your browser.",
    h1: "JSON to Rust",
    intro: "Generate Rust structs with serde derives from a JSON sample. Keys are converted to snake_case and renamed back with serde attributes.",
    tab: "code",
    lang: "rust",
    howTo: {
      title: "How to convert JSON to Rust structs",
      steps: ["Paste your JSON into the editor.", "Open the Code tab and choose Rust.", "Copy the structs and deserialize with serde_json::from_str."],
    },
    sections: [
      {
        h: "serde attributes explained",
        p: "Rust field names are snake_case, so a key such as userId becomes user_id with #[serde(rename = \"userId\")]. Optional and nullable fields become Option<T> with default and skip_serializing_if, so missing keys parse and None values are omitted when serializing.",
      },
      {
        h: "Types used",
        p: "Strings are String, whole numbers i64, decimals f64 and booleans bool. Arrays become Vec<T>. Values whose type cannot be pinned down, such as mixed types or bare null, fall back to serde_json::Value.",
      },
    ],
    faq: [{ q: "Do I need extra crates?", a: "Yes: serde with the derive feature and serde_json, for example cargo add serde --features derive and cargo add serde_json." }, ...COMMON_FAQ],
    keywords: ["json to rust", "json to rust struct", "serde struct generator"],
  },
  {
    slug: "json-to-java",
    title: "JSON to Java Class (Record) Generator Online",
    description: "Convert JSON to Java records with Jackson annotations. Handles nested objects, lists and renamed keys. Free and processed in your browser.",
    h1: "JSON to Java",
    intro: "Generate Java records with Jackson @JsonProperty annotations from a JSON sample. Nested objects become their own records and arrays become List<T>.",
    tab: "code",
    lang: "java",
    howTo: {
      title: "How to convert JSON to Java classes",
      steps: ["Paste your JSON into the editor.", "Open the Code tab and choose Java.", "Copy the records into your project and read data with ObjectMapper.readValue."],
    },
    sections: [
      {
        h: "Records instead of boilerplate classes",
        p: "Java 16 and newer support records, which give you an immutable class with constructor, accessors, equals and hashCode in one line. They work with Jackson 2.12 and later, so the output stays short and readable.",
      },
      {
        h: "Type mapping",
        p: "Strings become String, whole numbers Long, decimals Double and booleans Boolean, using boxed types so missing values can be null. Arrays become List<T>. Mixed or unknown values fall back to Object. Keys that are not valid camelCase Java identifiers are renamed and annotated with @JsonProperty.",
      },
    ],
    faq: [{ q: "Which Java version is required?", a: "Java 16 or later for records, and Jackson 2.12 or later to deserialize them." }, ...COMMON_FAQ],
    keywords: ["json to java", "json to java class", "json to pojo", "json to java record"],
  },
  {
    slug: "json-schema-validator",
    title: "JSON Schema Validator Online: Validate JSON Against a Schema",
    description: "Validate JSON against a JSON Schema online. Supports draft-04, draft-07, 2019-09 and 2020-12, lists every problem with its path, and runs in your browser.",
    h1: "JSON Schema Validator",
    intro: "Check JSON against a JSON Schema and see every problem with the exact path and reason. Draft-04, draft-07, 2019-09 and 2020-12 are supported, and nothing leaves your browser.",
    tab: "schema",
    howTo: {
      title: "How to validate JSON against a schema",
      steps: [
        "Paste your JSON into the editor on the left.",
        "In the Schema tab, paste your JSON Schema, or press Generate from JSON to start from a schema inferred from your data.",
        "Read the result: a green message when the JSON is valid, or a list of problems, each with its path such as $.users[0].age and the failing keyword.",
      ],
    },
    sections: [
      {
        h: "Which drafts are supported?",
        p: "The validator reads the $schema keyword to pick the draft: draft-04, draft-07 (also used for draft-06), 2019-09 and 2020-12. Without a $schema keyword it assumes 2020-12. The schema itself must be valid JSON.",
      },
      {
        h: "Reading validation errors",
        p: "Each problem shows the location of the failing value and the keyword that failed, for example required, type, minimum or additionalProperties, followed by a plain message. When one value breaks several rules you will see one entry per rule, so you can fix them all in one pass.",
      },
      {
        h: "Start from a generated schema",
        p: "Generate from JSON infers a schema from your data: property types, required keys (keys present in every object of an array) and array item types. It is a starting point; tighten it by adding keywords such as minLength, enum, pattern or format.",
      },
    ],
    faq: [
      { q: "Does it support $ref?", a: "Local references inside the same schema, such as #/$defs/address, are supported. Remote references are not fetched, because the tool never makes network requests with your data." },
      { q: "Is format validation included?", a: "Common formats such as email, date-time, uri and uuid are checked." },
      ...COMMON_FAQ,
    ],
    keywords: ["json schema validator", "validate json against schema", "json schema online", "json schema checker"],
  },
  {
    slug: "json-to-json-schema",
    title: "JSON to JSON Schema Generator Online",
    description: "Generate a JSON Schema (draft 2020-12) from sample JSON. Infers types, required properties and array items. Free and 100% client-side.",
    h1: "JSON to JSON Schema",
    intro: "Infer a JSON Schema from a JSON sample: property types, required keys and array item types, ready to refine and use for validation.",
    tab: "code",
    lang: "jsonschema",
    howTo: {
      title: "How to generate a JSON Schema from JSON",
      steps: ["Paste a representative JSON sample into the editor.", "Open the Code tab and choose JSON Schema.", "Copy the schema, or open the Schema tab to validate your data against it."],
    },
    sections: [
      {
        h: "What the generator infers",
        p: "Strings, numbers, integers, booleans and null map to their JSON Schema types. Objects become type object with properties; a key is listed as required only if it appears in every object seen. Arrays get an items schema merged from all elements, and mixed value types become a type list or anyOf.",
      },
      {
        h: "Make the schema stricter",
        p: "A schema inferred from one sample describes that sample, not your intent. Add constraints by hand: minimum and maximum for numbers, enum for fixed sets, pattern or format for strings, and additionalProperties set to false to reject unknown keys.",
      },
    ],
    faq: [{ q: "Which draft does the output use?", a: "Draft 2020-12, declared with the $schema keyword. The keywords used (type, properties, required, items, anyOf) work in older drafts too." }, ...COMMON_FAQ],
    keywords: ["json to json schema", "generate json schema from json", "json schema generator", "infer json schema"],
  },
  {
    slug: "jsonpath-tester",
    title: "JSONPath Tester Online: Evaluate JSONPath Expressions",
    description: "Test JSONPath expressions against your JSON online. See every match with its full path, filter with conditions and copy the results. Runs in your browser.",
    h1: "JSONPath Tester",
    intro: "Write a JSONPath expression and see every match with its full path and value, live. Filters, wildcards, recursive descent and slices are supported, and nothing leaves your browser.",
    tab: "query",
    howTo: {
      title: "How to test a JSONPath expression",
      steps: [
        "Paste your JSON into the editor on the left.",
        "Type an expression in the Query tab, for example $.users[*].name, or click one of the examples.",
        "Read the matches with their paths, and press Copy values to copy all matched values as a JSON array.",
      ],
    },
    sections: [
      {
        h: "JSONPath syntax cheat sheet",
        p: "$ is the root. .name or ['name'] selects a key, [0] an array index and [*] or .* every child. .. searches all levels, so $..price finds every price anywhere. [0:3] slices an array, [0,2] picks several indexes, and [?(@.price < 10)] filters items by a condition, where @ is the current item.",
      },
      {
        h: "Filters and comparisons",
        p: "Filter expressions compare values of the current item, for example $.books[?(@.price > 10 && @.inStock == true)].title. Strings must be quoted, and a filter on a missing key simply does not match. Filters are evaluated by a built-in parser, not by running JavaScript.",
      },
      {
        h: "Using the paths in code",
        p: "Each match is shown with a JavaScript-style accessor such as $.users[0].name. In the Tree tab you can also hover any row and copy its path, which is the quickest way to build an expression for a value you can see.",
      },
    ],
    faq: [
      { q: "Which JSONPath implementation is used?", a: "The tool uses the widely used jsonpath-plus library in its safe mode. It supports the common JSONPath syntax; implementations differ in edge cases, so check unusual expressions against your own library." },
      { q: "Does it run my expression as JavaScript?", a: "No. Filter expressions are parsed by a built-in evaluator, so arbitrary code cannot run." },
      ...COMMON_FAQ,
    ],
    keywords: ["jsonpath tester", "jsonpath online", "jsonpath evaluator", "jsonpath expression tester"],
  },
  {
    slug: "json-path-finder",
    title: "JSON Path Finder Online: Click a Value, Copy Its Path",
    description: "Find the path of any value in your JSON. Click through the tree, search by key or value, and copy the exact path. Free and 100% client-side.",
    h1: "JSON Path Finder",
    intro: "Find the exact path to any value in a JSON document. Explore the tree, search for the value you need and copy its path with one click.",
    tab: "tree",
    howTo: {
      title: "How to find the path of a value",
      steps: [
        "Paste your JSON into the editor.",
        "Search for the key or value in the Tree tab, or expand the branches until you see it.",
        "Hover the row and press the link icon to copy its path, for example $.users[0].address.city.",
      ],
    },
    sections: [
      {
        h: "Why you need the path",
        p: "Reading a nested API response in code means addressing a value by its path: which keys to follow and which array indexes to use. Counting brackets by eye is error-prone, so selecting the value in a tree and copying its path avoids off-by-one mistakes.",
      },
      {
        h: "From a path to a query",
        p: "The copied path points at one specific value. To select many values at once, for example the name of every user, switch to the Query tab and replace the index with a wildcard: $.users[*].name.",
      },
    ],
    faq: [{ q: "Which path format is copied?", a: "A JavaScript-style accessor starting with $, such as $.users[0].name. Keys that are not valid identifiers use bracket notation, for example $[\"first name\"]." }, ...COMMON_FAQ],
    keywords: ["json path finder", "find json path", "json path online", "get json path"],
  },
];

/** Pages that exist besides the tools; they appear in the sitemap and footer. */
export const INFO_PAGES = [
  { slug: "about", label: "About" },
  { slug: "benchmarks", label: "Benchmarks" },
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Use" },
] as const;

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
/** Optional donation or sponsorship page. The footer link is hidden until this is set. */
export const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "";
export const REPO_URL = "https://github.com/megezgen/jsonforge";

export function pageUrl(slug: string) {
  return slug ? `${SITE_URL}/${slug}/` : `${SITE_URL}/`;
}
