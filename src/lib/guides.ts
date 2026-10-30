/**
 * Long-form guides shown below the standard sections of the most important pages.
 * Plain text only; `code` is rendered in a <pre> block.
 */
export interface GuideSection {
  h: string;
  paras: string[];
  code?: string;
}

export const GUIDES: Record<string, GuideSection[]> = {
  "": [
    {
      h: "A practical guide to reading JSON",
      paras: [
        "JSON documents are made of only six kinds of value: objects (key and value pairs in braces), arrays (ordered lists in square brackets), strings, numbers, true or false, and null. Everything else is built by nesting these. Reading an unfamiliar document is mostly a matter of finding out which keys an object has, how deep it goes, and whether the items of an array all look the same.",
        "A good way to explore a response is top-down. Collapse the whole tree, look at the keys of the root object and their types, and expand the branch that holds the data you need. The count shown next to every object and array tells you how big a branch is before you open it, so you can skip a list of ten thousand items and go straight to the metadata beside it.",
      ],
    },
    {
      h: "Walking through an API response",
      paras: [
        "Paginated APIs usually wrap their data in an envelope: the items live under a key such as data, results or items, and the rest of the object holds paging information (a total, a next-page cursor, links). When a value is not where you expect it, look at the envelope first.",
        "The example below has a users array whose items do not all have the same shape. The second user has no score key at all, and email is null. In code these are different cases: a missing key is undefined in JavaScript, while null is an explicit empty value. The tree view shows null in its own colour so that you can tell them apart at a glance.",
      ],
      code: `{
  "page": 1,
  "total": 2,
  "users": [
    { "id": 101, "name": "Ada", "email": "ada@example.com", "score": 9.5 },
    { "id": 102, "name": "Alan", "email": null }
  ]
}`,
    },
    {
      h: "Things that surprise people in JSON",
      paras: [
        "Numbers are not typed. JSON has one number format, so 1 and 1.0 are the same value, and parsers that use floating point (JavaScript included) cannot represent integers above 9,007,199,254,740,991 exactly. IDs that large are normally sent as strings. If you see a long number whose last digits look rounded, that is the reason.",
        "A number in quotes is a string. The value \"42\" and the value 42 are different, and sorting or comparing them in code gives different results. The tree view keeps the quotes and colours strings and numbers differently, which makes this kind of bug easy to spot.",
        "Duplicate keys are allowed by the syntax but their meaning is undefined: most parsers keep the last one and silently drop the others. JSON has no comments and no trailing commas, and keys must be in double quotes. Files that allow those things are usually JSONC (JSON with comments), JSON5, or JavaScript object literals, not JSON. The Fix JSON button repairs the common cases.",
        "Text is Unicode. Characters can appear escaped (for example \\u00e9 for the letter é) and the viewer shows them decoded. Control characters inside strings must be escaped, which is why a raw line break inside a string makes a document invalid.",
      ],
    },
    {
      h: "JSON, JSON Lines and related formats",
      paras: [
        "JSON Lines (also called NDJSON) stores one complete JSON value per line, with no enclosing array. It is common in logs and data exports because files can be appended to and processed line by line. A JSON Lines file is not valid JSON as a whole, so paste one line at a time, or wrap the lines in an array and separate them with commas.",
        "YAML is a superset of JSON in practice and is often preferred for hand-written configuration. CSV is flat and cannot express nesting, so nested JSON is flattened with dotted column names when you convert it. The converters in the Code tab cover YAML, CSV and XML.",
      ],
    },
    {
      h: "Working faster",
      paras: [
        "Press Ctrl+Enter (Cmd+Enter on a Mac) to format, and Ctrl+Shift+Enter to minify. Use the search box in the Tree tab to find a key or value anywhere in the document; every parent of a match opens automatically. Hover a row to copy its value or its path, which you can paste straight into code or into the JSONPath tester to select many similar values at once.",
        "Use the status bar as a quick health check: the size, depth and node count tell you how heavy a payload is. A response with a great depth or a very large node count can be a sign that an API is returning more than the client needs.",
      ],
    },
  ],

  "large-json-viewer": [
    {
      h: "Why large JSON files are hard to work with",
      paras: [
        "JSON is verbose. Every record repeats all of its key names, and pretty-printing adds indentation on top. A file of a few hundred thousand small records easily reaches tens of megabytes even though the information in it is modest, and the same data stored as CSV or in a binary format is often much smaller.",
        "Memory matters as much as file size. When a program parses JSON it builds objects, arrays and strings in memory, and the result is usually several times larger than the text it came from. That is why a 25 MB file can make a tab use hundreds of megabytes, and why very large documents run into browser limits long before they run into disk limits.",
      ],
    },
    {
      h: "Browser limits you can run into",
      paras: [
        "In Chrome and other engines based on V8, a single string cannot be longer than about 512 million characters (2 to the power 29, minus 24). A JSON document is first read as one string, so files near that size cannot be opened in a browser at all, whatever tool you use. Memory limits per tab are lower and depend on the device, so phones and low-memory machines struggle with much smaller files than a desktop does.",
        "Rendering is the other limit. Showing every node as a page element does not scale: a million nodes means a million elements and a frozen page. This viewer draws only the rows that fit on screen and asks a background thread for the rest, which is why expanding and scrolling stay smooth. Loading the raw text into the editor still takes time in proportion to its size; the benchmarks page has the measured numbers.",
      ],
    },
    {
      h: "A workflow for big files",
      paras: [
        "Start with the shape rather than the contents. Open the file, wait for the status bar to show the size, depth and node count, collapse everything, and look at the top-level keys. Most large files are one big array of similar records, or an object with one huge array inside it. Expand only the first item or two to learn what a record looks like.",
        "Then search instead of scrolling. The search box matches keys and values and shows how many matches there are, and it opens the path to each one. When you need the same field from every record, switch to the Query tab and write a JSONPath expression, for example $.records[*].email, then copy all matches as a JSON array.",
        "If you only need part of the file, cut it down first. Convert it to CSV with the converter if you want a spreadsheet, or generate a schema from it to understand its structure without reading it.",
      ],
      code: `$.records[*].email
$.records[?(@.active == false)].id
$.records[0:10]`,
    },
    {
      h: "When a browser is the wrong tool",
      paras: [
        "For files above about a hundred megabytes, or when you need to process many files, use a command-line tool. jq can filter and reshape JSON as a stream without loading it all into memory in some modes, and tools that read newline-delimited JSON handle files of any size one line at a time. A browser viewer is best for the case this page is for: looking at a large file, understanding it and extracting pieces of it.",
      ],
    },
  ],

  "json-to-typescript": [
    {
      h: "From a JSON sample to useful types",
      paras: [
        "Generated types are a starting point, not a specification. The generator reads the sample you give it and describes exactly that: it cannot know which strings are really dates, which numbers are really enums, or which fields might be missing in a response you have not seen. The more varied your sample, the better the result. If you paste an array of records, every record is merged into one interface, so a key that is absent from some of them becomes optional.",
      ],
      code: `// Input
{ "id": 7, "name": "Ada", "email": null, "roles": ["admin"], "address": { "city": "London" } }

// Output
export interface Root {
  id: number;
  name: string;
  email: null;
  roles: string[];
  address: Address;
}

export interface Address {
  city: string;
}`,
    },
    {
      h: "Optional, nullable and missing are three different things",
      paras: [
        "In TypeScript, name?: string means the key may be absent. name: string | null means the key is always present but may hold null. A value that can be absent or null is written name?: string | null. APIs differ in which one they use, and the difference matters for code that checks `in`, `=== undefined` or `=== null`.",
        "When your sample has a field that is null in every record, the generator can only say null, because it has no way to know what the real type would be. Replace it by hand with the type you expect, for example string | null, or give the generator a record where that field is filled in.",
      ],
    },
    {
      h: "Dates, enums and other things JSON cannot say",
      paras: [
        "JSON has no date type. A timestamp arrives as a string, so the generated type is string. If your code converts it to a Date, keep the wire type as string and convert in one place. The same applies to enums: a field that only ever holds one of a few strings is typed as string until you narrow it, for example to \"active\" | \"disabled\".",
        "Large integers are another trap. JavaScript numbers are 64-bit floats, so ids above 9,007,199,254,740,991 lose precision when parsed. If an API sends such ids, ask for them as strings or parse them with a library that supports big integers.",
      ],
    },
    {
      h: "Types disappear at runtime: validate the data",
      paras: [
        "A TypeScript interface is erased when your code is compiled, so it cannot check what an API actually returns. If the server changes a field, the compiler will not notice and the error will show up later as a confusing crash. For data that crosses a trust boundary, validate it at runtime. The Zod output of this tool generates a schema that both validates the data and gives you the static type with z.infer, so one definition covers both.",
        "The Schema tab can also validate your JSON against a JSON Schema, which is useful for checking sample responses against a contract before you write any code.",
      ],
    },
    {
      h: "Naming and structure",
      paras: [
        "Nested objects become their own interfaces, named after the key that holds them, with the singular form for arrays (a users array of objects gives User). When two different shapes would get the same name, a number is added so that nothing is overwritten, and identical shapes are reused. Change the root name in the field above the output, then rename the rest in your editor.",
      ],
    },
  ],

  "json-schema-validator": [
    {
      h: "JSON Schema in five minutes",
      paras: [
        "A JSON Schema is a JSON document that describes what other JSON documents must look like. The keyword type says what kind of value is allowed. For objects, properties describes each key, required lists the keys that must be present, and additionalProperties set to false rejects keys you did not list. For arrays, items describes the elements. Numbers can be limited with minimum and maximum, strings with minLength, maxLength, pattern and format, and any value can be limited to a fixed set with enum.",
      ],
      code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "email"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "email": { "type": "string", "format": "email" },
    "role": { "enum": ["admin", "editor", "viewer"] },
    "tags": { "type": "array", "items": { "type": "string" }, "uniqueItems": true }
  },
  "additionalProperties": false
}`,
    },
    {
      h: "Reading the error list",
      paras: [
        "Every problem is shown with the location of the failing value and the keyword that failed. A required error points at the object that is missing a key, not at the key itself, because the key does not exist. A type error points at the value that has the wrong type; the most common cause is a number sent as a string. An additionalProperties error means the object contains a key your schema does not allow, which is often a typo in the key name.",
        "When one value breaks several rules you see one entry per rule. For example, the value -3 for an age with a minimum of 0 and a type of integer fails only minimum, but the string \"3\" fails type and also cannot be compared for minimum, so fix the type first.",
      ],
    },
    {
      h: "Drafts and what changed between them",
      paras: [
        "The validator reads the $schema keyword to choose a draft. Draft-04 uses exclusiveMinimum and exclusiveMaximum as booleans next to minimum and maximum; draft-06 and later made them numbers. Draft-07 added if, then and else. Draft 2019-09 introduced $defs for reusable parts (older drafts used definitions) and unevaluatedProperties. Draft 2020-12 changed how tuples are written: prefixItems replaces the array form of items.",
        "If your schema was written for one draft and behaves oddly, set $schema explicitly. Without it, 2020-12 is assumed.",
      ],
    },
    {
      h: "Combining and reusing schemas",
      paras: [
        "allOf requires a value to match every sub-schema, anyOf at least one, and oneOf exactly one. oneOf is the cause of many confusing errors, because a value that matches two branches fails it. Use $ref with $defs to reuse a definition, for example \"$ref\": \"#/$defs/address\". References to other files or URLs are not fetched by this tool, because it never makes network requests with your data; paste the referenced definitions into one schema instead.",
        "format is a hint in the specification and validators may treat it as an annotation only. This tool checks common formats such as email, date-time, uri and uuid, but it is worth testing the formats you rely on with your production validator as well.",
      ],
    },
    {
      h: "Using the schema elsewhere",
      paras: [
        "Once a schema works here you can use it in your own code or pipeline with a validator library for your language, and in editors that understand JSON Schema to get completion and inline errors for configuration files. Start from the Generate from JSON button, which writes a first schema from your data, then tighten it by hand with the keywords above.",
      ],
    },
  ],

  "jsonpath-tester": [
    {
      h: "What JSONPath is",
      paras: [
        "JSONPath is a query language for JSON, modelled on XPath for XML. An expression starts at the root, written $, and walks down through keys and array indexes to select one or many values. It was described informally in 2007 and standardised as RFC 9535 in 2024, but many implementations predate the standard and differ in details, so an expression that works in one library can behave differently in another.",
      ],
    },
    {
      h: "Syntax cheat sheet",
      paras: [
        "$ is the root. .key or ['key'] selects a child, and bracket notation is needed for keys with spaces or dots. [0] selects an array item. A slice with a negative start such as [-1:] selects the last item (and [-2:] the last two); plain [-1] is not supported by every implementation, and it returns nothing here. [*] or .* selects every child. .. is recursive descent: $..price finds every key named price at any depth. [0:3] is a slice, [0,2] picks several indexes, and ['a','b'] picks several keys.",
        "A filter selects the items that satisfy a condition: [?(@.price < 10)], where @ is the item being tested. Conditions can combine comparisons with && and ||, and can test whether a key exists with [?(@.isbn)].",
      ],
      code: `$.store.book[*].author                 all authors
$.store.book[?(@.price < 10)].title    titles of cheap books
$..price                               every price, at any depth
$.store.book[0,2]                      the first and third book
$.store.book[-1:]                      the last book (a slice)
$..book[?(@.isbn)]                     books that have an isbn`,
    },
    {
      h: "Worked example",
      paras: [
        "The bookstore sample loaded on this page has four books. The expression $.store.book[?(@.price < 10)].title returns the titles of the three books under ten, and adding && @.inStock == true narrows that to the ones you can buy. Try changing the number, then switch to $..author to see how recursive descent collects values from different levels.",
        "Results are listed in the order the engine finds them, normally document order, each with its full path. Use Copy values to copy all matched values as a JSON array.",
      ],
    },
    {
      h: "Common mistakes",
      paras: [
        "Strings in filters must be quoted: [?(@.category == 'fiction')]. A filter on a key that is missing from an item simply does not match, rather than raising an error. Recursive descent over a large document can return a very large number of matches; narrow it with a more specific path. If a result is empty, check key spelling and case first, then whether the value sits one level deeper than you expected, which is where the tree view and its copy path button help.",
        "Filter expressions here are evaluated by a built-in parser, not by running JavaScript, which is safer but means that arbitrary JavaScript inside a filter is not supported.",
      ],
    },
    {
      h: "JSONPath compared with jq and JMESPath",
      paras: [
        "jq is a command-line language that can filter, transform and reshape JSON, with its own syntax and functions; it is a good choice for scripts. JMESPath is a different query language with a formal specification, used for example by the AWS CLI for its --query option. kubectl accepts JSONPath templates for its -o jsonpath output, with a few differences from the generic syntax. When you copy an expression into a tool, check that tool's documentation for the dialect it supports.",
      ],
    },
  ],
};
