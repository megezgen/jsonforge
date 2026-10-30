/** Compact reference pages. Rows are [syntax, meaning, example]. */
export interface CheatTable {
  h: string;
  note?: string;
  head: [string, string, string];
  rows: [string, string, string][];
}

export interface CheatSheet {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  tables: CheatTable[];
  tips: string[];
  tool: { href: string; label: string };
}

export const CHEAT_SHEETS: CheatSheet[] = [
  {
    slug: "json-syntax",
    h1: "JSON Syntax Cheat Sheet",
    title: "JSON Syntax Cheat Sheet: Types, Escapes and Rules",
    description: "A one-page JSON syntax reference: the six value types, string escapes, number rules, what is not allowed and the most common mistakes. Printable.",
    intro: "Everything you need to write valid JSON on one page. Use your browser's print command (Ctrl+P) to save it as a PDF.",
    tables: [
      {
        h: "The six value types",
        head: ["Type", "Rule", "Example"],
        rows: [
          ["object", "Key and value pairs in { }. Keys are strings in double quotes.", `{"name": "Ada", "age": 36}`],
          ["array", "An ordered list in [ ], items separated by commas.", `[1, 2, 3]`],
          ["string", "Text in double quotes. Single quotes are not allowed.", `"hello"`],
          ["number", "Integer or decimal, optional minus and exponent. No NaN, Infinity or leading zeros.", `-12.5e3`],
          ["boolean", "Lowercase true or false, no quotes.", `true`],
          ["null", "Lowercase null, an explicit empty value.", `null`],
        ],
      },
      {
        h: "String escapes",
        note: "A backslash starts an escape. Any other character after a backslash is an error.",
        head: ["Escape", "Meaning", "Example"],
        rows: [
          [`\\"`, "Double quote", `"say \\"hi\\""`],
          [`\\\\`, "Backslash", `"C:\\\\Users"`],
          [`\\/`, "Slash (optional)", `"a\\/b"`],
          [`\\n  \\r  \\t`, "Line feed, carriage return, tab", `"line1\\nline2"`],
          [`\\b  \\f`, "Backspace, form feed", `"\\b"`],
          [`\\uXXXX`, "Any character by its four-digit hex code", `"\\u00e9" is é`],
        ],
      },
      {
        h: "Not allowed in JSON",
        head: ["Not allowed", "Why", "Use instead"],
        rows: [
          ["Comments (// or /* */)", "JSON has no comments.", `A "_comment" key, or JSONC/YAML`],
          ["Trailing commas", "A comma after the last item is an error.", "Remove the last comma"],
          ["Single-quoted strings", "Only double quotes are valid.", `"text"`],
          ["Unquoted keys", "Keys must be strings.", `{"key": 1}`],
          ["undefined, NaN, Infinity", "They are not JSON values.", "null, or a string"],
          ["Raw line breaks inside strings", "Control characters must be escaped.", `\\n`],
          ["Multiple top-level values", "A document has exactly one value.", "Wrap them in an array"],
        ],
      },
    ],
    tips: [
      "JSON text is UTF-8 and may start with any value, not only an object.",
      "Numbers have no type: 1 and 1.0 are the same. Integers above 9,007,199,254,740,991 lose precision in JavaScript, so send them as strings.",
      "Dates have no type. Use ISO 8601 strings such as 2026-10-30T12:00:00Z.",
      "Duplicate keys are allowed by the syntax but undefined in meaning. Avoid them.",
    ],
    tool: { href: "/json-validator/", label: "Validate your JSON" },
  },
  {
    slug: "jsonpath",
    h1: "JSONPath Cheat Sheet",
    title: "JSONPath Cheat Sheet: Syntax, Filters and Examples",
    description: "A one-page JSONPath reference with every operator, filter and slice, and examples checked against a real engine. Printable.",
    intro: "JSONPath selects values from a JSON document. The expressions below were run against the engine used by the JSONPath tester, with a bookstore sample.",
    tables: [
      {
        h: "Operators",
        head: ["Syntax", "Meaning", "Example"],
        rows: [
          ["$", "The root of the document", "$"],
          [". or ['key']", "Child key (brackets for keys with spaces or dots)", "$.store.book  or  $['store']['book']"],
          ["[n]", "Array item by index, starting at 0", "$.store.book[0]"],
          ["[*] or .*", "Every child", "$.store.book[*].author"],
          ["..", "Recursive descent: search at any depth", "$..price"],
          ["[a,b]", "Union of indexes or keys", "$.store.book[0,2].title"],
          ["[start:end]", "Slice, end excluded", "$.store.book[0:2].title"],
          ["[-1:]", "The last item (negative start in a slice)", "$.store.book[-1:]"],
        ],
      },
      {
        h: "Filters",
        note: "Inside [?( )], @ is the item being tested. Strings must be quoted.",
        head: ["Syntax", "Meaning", "Example"],
        rows: [
          ["[?(@.k < n)]", "Compare a number", "$.store.book[?(@.price < 10)].title"],
          ["[?(@.k == 'x')]", "Compare a string", "$.store.book[?(@.category == 'fiction')].title"],
          ["[?(@.k)]", "Key exists", "$..book[?(@.isbn)].title"],
          ["&& and ||", "Combine conditions", "$.store.book[?(@.price < 10 && @.inStock == true)].title"],
        ],
      },
      {
        h: "Results on the sample bookstore",
        head: ["Expression", "Returns", "Count"],
        rows: [
          ["$.store.book[*].author", "all authors", "4"],
          ["$.store.book[?(@.price < 10)].title", "titles of books under 10", "3"],
          ["$..price", "every price, at any depth", "5"],
          ["$.store.book[0,2].title", "first and third title", "2"],
        ],
      },
    ],
    tips: [
      "Implementations differ in edge cases; RFC 9535 standardised JSONPath in 2024, but many libraries predate it. Plain [-1] is not supported by every implementation, use the slice [-1:].",
      "A filter on a missing key does not match instead of raising an error.",
      "kubectl accepts JSONPath templates and the AWS CLI uses JMESPath, a different language, so check the dialect of the tool you use.",
    ],
    tool: { href: "/jsonpath-tester/", label: "Try JSONPath expressions" },
  },
  {
    slug: "json-schema",
    h1: "JSON Schema Cheat Sheet",
    title: "JSON Schema Cheat Sheet: Keywords for Every Type",
    description: "A one-page JSON Schema keyword reference for types, objects, arrays, strings, numbers and combinations, with the differences between drafts. Printable.",
    intro: "The keywords you use most often when writing a JSON Schema, grouped by what they validate.",
    tables: [
      {
        h: "Any value",
        head: ["Keyword", "Meaning", "Example"],
        rows: [
          ["type", "Allowed type(s): string, number, integer, boolean, object, array, null", `{"type": "string"}`],
          ["enum", "Value must be one of a fixed list", `{"enum": ["admin", "viewer"]}`],
          ["const", "Value must equal exactly this", `{"const": "v1"}`],
        ],
      },
      {
        h: "Objects",
        head: ["Keyword", "Meaning", "Example"],
        rows: [
          ["properties", "Schema for each known key", `{"properties": {"id": {"type": "integer"}}}`],
          ["required", "Keys that must be present", `{"required": ["id", "email"]}`],
          ["additionalProperties", "false rejects keys not listed", `{"additionalProperties": false}`],
          ["minProperties / maxProperties", "Limit the number of keys", `{"minProperties": 1}`],
        ],
      },
      {
        h: "Arrays",
        head: ["Keyword", "Meaning", "Example"],
        rows: [
          ["items", "Schema for every element", `{"items": {"type": "string"}}`],
          ["minItems / maxItems", "Limit the length", `{"minItems": 1}`],
          ["uniqueItems", "No duplicates", `{"uniqueItems": true}`],
          ["prefixItems (2020-12)", "A different schema per position (tuples)", `{"prefixItems": [{"type": "number"}, {"type": "string"}]}`],
        ],
      },
      {
        h: "Strings and numbers",
        head: ["Keyword", "Meaning", "Example"],
        rows: [
          ["minLength / maxLength", "String length limits", `{"minLength": 1}`],
          ["pattern", "Regular expression the string must match", `{"pattern": "^[a-z]+$"}`],
          ["format", "email, date-time, uri, uuid and others", `{"format": "email"}`],
          ["minimum / maximum", "Inclusive numeric limits", `{"minimum": 0}`],
          ["exclusiveMinimum / exclusiveMaximum", "Exclusive limits (numbers since draft-06; booleans in draft-04)", `{"exclusiveMinimum": 0}`],
          ["multipleOf", "Must be a multiple of", `{"multipleOf": 0.01}`],
        ],
      },
      {
        h: "Combining and reusing",
        head: ["Keyword", "Meaning", "Example"],
        rows: [
          ["allOf", "Must match every schema", `{"allOf": [{...}, {...}]}`],
          ["anyOf", "Must match at least one", `{"anyOf": [{"type": "string"}, {"type": "null"}]}`],
          ["oneOf", "Must match exactly one", `{"oneOf": [{...}, {...}]}`],
          ["not", "Must not match", `{"not": {"type": "null"}}`],
          ["if / then / else (draft-07+)", "Conditional rules", `{"if": {...}, "then": {...}}`],
          ["$defs and $ref", "Define a part once and reuse it (older drafts: definitions)", `{"$ref": "#/$defs/address"}`],
        ],
      },
    ],
    tips: [
      "Set $schema (for example https://json-schema.org/draft/2020-12/schema) so tools know which draft you mean.",
      "format may be treated as an annotation only by some validators; test the formats you rely on.",
      "A required error points at the object that is missing the key, because the key itself does not exist.",
    ],
    tool: { href: "/json-schema-validator/", label: "Validate against a schema" },
  },
];

export const cheatSheetBySlug = (slug: string) => CHEAT_SHEETS.find((c) => c.slug === slug);
