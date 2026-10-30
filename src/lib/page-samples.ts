/**
 * Each tool page opens with data that suits what the page is for, so that the
 * page demonstrates its own feature immediately (and no two pages look alike).
 */
export interface PageSample {
  json: string;
  schema?: string;
  query?: string;
  compare?: string;
}

const API_USERS = JSON.stringify(
  {
    page: 1,
    total: 2,
    users: [
      { id: 101, name: "Ada Lovelace", email: "ada@example.com", active: true, roles: ["admin", "editor"], address: { city: "London", zip: "N1 9GU" }, lastLogin: "2026-10-12T08:30:00Z" },
      { id: 102, name: "Alan Turing", email: null, active: false, roles: ["viewer"], address: { city: "Wilmslow" }, score: 9.5 },
    ],
  },
  null,
  2,
);

const STORE = JSON.stringify(
  {
    store: {
      name: "Corner Books",
      book: [
        { category: "reference", author: "N. Wirth", title: "Algorithms + Data Structures", price: 8.95, inStock: true },
        { category: "fiction", author: "A. Clarke", title: "Rendezvous with Rama", price: 12.99, inStock: true },
        { category: "fiction", author: "U. Le Guin", title: "The Dispossessed", price: 7.5, inStock: false },
        { category: "science", author: "R. Feynman", title: "Six Easy Pieces", price: 9.99, inStock: true },
      ],
      bicycle: { color: "red", price: 199.95 },
    },
  },
  null,
  2,
);

export const PAGE_SAMPLES: Record<string, PageSample> = {
  "json-validator": {
    // Deliberately broken: single quotes, unquoted key, trailing commas.
    json: `{\n  name: 'Ada',\n  "age": 36,\n  "tags": ["math", "code",],\n}`,
  },
  "json-minify": { json: API_USERS },
  "json-pretty-print": {
    json: '{"order":{"id":"A-1042","customer":{"name":"Ada","vip":true},"items":[{"sku":"X1","qty":2,"price":9.5},{"sku":"Y7","qty":1,"price":24}],"paid":false}}',
  },
  "json-sorter": {
    json: '{"zebra":1,"apple":{"mango":3,"banana":2,"cherry":[{"y":2,"x":1}]},"middle":true}',
  },
  "json-diff": {
    json: JSON.stringify({ name: "api-server", version: "1.4.0", replicas: 2, features: { cache: true, beta: false }, regions: ["eu-west", "us-east"] }, null, 2),
    compare: JSON.stringify({ name: "api-server", version: "1.5.0", replicas: 3, features: { cache: true, beta: true, tracing: true }, regions: ["eu-west", "us-east", "ap-south"] }, null, 2),
  },
  "json-schema-validator": {
    json: JSON.stringify({ id: "42", name: "", email: "not-an-email", age: -3, tags: ["a", "a"] }, null, 2),
    schema: JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: { type: "integer" },
          name: { type: "string", minLength: 1 },
          email: { type: "string", format: "email" },
          age: { type: "integer", minimum: 0 },
          tags: { type: "array", items: { type: "string" }, uniqueItems: true },
        },
        additionalProperties: false,
      },
      null,
      2,
    ),
  },
  "jsonpath-tester": { json: STORE, query: "$.store.book[?(@.price < 10)].title" },
  "json-path-finder": { json: API_USERS },
  "json-tree-viewer": { json: API_USERS },
  "json-file-viewer": { json: API_USERS },
  "json-to-typescript": { json: API_USERS },
  "json-to-go": { json: API_USERS },
  "json-to-python": { json: API_USERS },
  "json-to-zod": { json: API_USERS },
  "json-to-rust": { json: API_USERS },
  "json-to-java": { json: API_USERS },
  "json-to-json-schema": { json: API_USERS },
  "json-to-csv": {
    json: JSON.stringify(
      [
        { id: 1, name: "Ada", city: "London", tags: ["math", "code"], balance: 1200.5 },
        { id: 2, name: "Alan", city: "Wilmslow", tags: ["logic"], balance: 80 },
        { id: 3, name: 'Grace "Amazing"', city: "New York", balance: 4300.25 },
      ],
      null,
      2,
    ),
  },
  "json-to-yaml": {
    json: JSON.stringify(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name: "web", labels: { app: "web", tier: "frontend" } },
        spec: { replicas: 3, template: { spec: { containers: [{ name: "web", image: "nginx:1.27", ports: [{ containerPort: 80 }], env: [{ name: "DEBUG", value: "false" }] }] } } },
      },
      null,
      2,
    ),
  },
  "json-to-xml": {
    json: JSON.stringify(
      {
        catalog: { book: [{ id: "b1", title: "Dune & Beyond", price: 9.99, tags: ["sci-fi", "classic"] }, { id: "b2", title: "The <Hobbit>", price: 7.5, tags: ["fantasy"] }] },
      },
      null,
      2,
    ),
  },
};
