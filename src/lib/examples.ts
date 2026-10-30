/**
 * Example JSON documents with explanations. All data is invented: names, ids, emails and coordinates
 * are made up and do not refer to real people, products or places.
 */
export interface ExampleField {
  path: string;
  type: string;
  note: string;
}

export interface ExamplePage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  data: unknown;
  fields: ExampleField[];
  uses: string[];
  tips: string[];
  /** Short snippets that read a value out of the example. */
  js: string;
  py: string;
  related: string[];
}

export const EXAMPLES: ExamplePage[] = [
  {
    slug: "simple-json-example",
    h1: "Simple JSON Example",
    title: "Simple JSON Example: All Six Value Types",
    description: "A small, valid JSON example that uses every JSON type: string, number, boolean, null, array and object. Copy it, open it in the viewer or download it.",
    intro: "This is the smallest useful JSON document: one object that contains every kind of value JSON supports. Use it to learn the syntax or as a quick test input.",
    data: {
      name: "Ada Lovelace",
      age: 36,
      isMember: true,
      balance: 1250.75,
      nickname: null,
      languages: ["English", "French"],
      address: { city: "London", country: "UK" },
    },
    fields: [
      { path: "name", type: "string", note: "Text in double quotes." },
      { path: "age", type: "number", note: "An integer. JSON does not distinguish integers from decimals." },
      { path: "isMember", type: "boolean", note: "true or false, written without quotes." },
      { path: "balance", type: "number", note: "A decimal number." },
      { path: "nickname", type: "null", note: "An explicit empty value, different from a missing key." },
      { path: "languages", type: "array of strings", note: "An ordered list in square brackets." },
      { path: "address", type: "object", note: "A nested set of key and value pairs." },
    ],
    uses: ["Learning JSON syntax", "A first input for formatters, validators and converters", "Checking that a parser handles every value type"],
    tips: ["Keys are always strings in double quotes.", "There is no comma after the last item of an object or array."],
    js: `const data = JSON.parse(text);\nconsole.log(data.address.city); // "London"`,
    py: `import json\ndata = json.loads(text)\nprint(data["address"]["city"])  # London`,
    related: ["json-array-example", "nested-json-example"],
  },
  {
    slug: "json-array-example",
    h1: "JSON Array Example",
    title: "JSON Array Example: Numbers, Strings, Objects and Mixed Lists",
    description: "JSON array examples: arrays of numbers, strings and objects, a mixed array, nested arrays and an empty array. Open the sample in the tree viewer.",
    intro: "Arrays hold ordered lists. This example shows the common shapes: a list of numbers, a list of strings, a list of records, a mixed list and an empty list.",
    data: {
      numbers: [1, 2, 3, 5, 8],
      colors: ["red", "green", "blue"],
      mixed: [1, "two", true, null, { id: 5 }, [6, 7]],
      records: [
        { id: 1, name: "Ada" },
        { id: 2, name: "Alan" },
      ],
      empty: [],
    },
    fields: [
      { path: "numbers", type: "array of numbers", note: "Every item has the same type." },
      { path: "colors", type: "array of strings", note: "Strings in double quotes, separated by commas." },
      { path: "mixed", type: "array", note: "JSON arrays may mix types, including objects and other arrays. Avoid this in APIs, it is hard to type." },
      { path: "records", type: "array of objects", note: "The most common shape in real APIs: a list of similar records." },
      { path: "empty", type: "array", note: "An empty list is valid and often means no results." },
    ],
    uses: ["Practising array access and iteration", "Testing converters on lists of records", "Showing how JSONPath wildcards select items"],
    tips: ["Array positions start at 0.", "Records in one array should share the same keys to keep code simple."],
    js: `const ids = data.records.map((r) => r.id); // [1, 2]\nconst last = data.numbers[data.numbers.length - 1]; // 8`,
    py: `ids = [r["id"] for r in data["records"]]  # [1, 2]\nlast = data["numbers"][-1]  # 8`,
    related: ["simple-json-example", "paginated-api-response-json"],
  },
  {
    slug: "nested-json-example",
    h1: "Nested JSON Example",
    title: "Nested JSON Example: Objects Inside Objects and Arrays",
    description: "A deeply nested JSON example (company, departments, teams, members) for practising paths, JSONPath queries and tree navigation.",
    intro: "Real data is rarely flat. This example nests objects and arrays four levels deep, which makes it a good sample for learning to navigate with paths and queries.",
    data: {
      company: {
        name: "Northwind Labs",
        founded: 2014,
        departments: [
          {
            name: "Engineering",
            teams: [
              { name: "Platform", members: [{ name: "Ada", role: "lead" }, { name: "Alan", role: "engineer" }] },
              { name: "Mobile", members: [{ name: "Grace", role: "engineer" }] },
            ],
          },
          { name: "Design", teams: [{ name: "Brand", members: [{ name: "Edsger", role: "lead" }] }] },
        ],
      },
    },
    fields: [
      { path: "company", type: "object", note: "The root of the structure." },
      { path: "company.departments", type: "array of objects", note: "Each department has a name and a list of teams." },
      { path: "company.departments[].teams", type: "array of objects", note: "Teams belong to a department." },
      { path: "company.departments[].teams[].members", type: "array of objects", note: "People, the deepest level here." },
    ],
    uses: ["Learning JSONPath: $..members[*].name finds every member at any depth", "Practising tree navigation and copying paths", "Testing code that walks recursive structures"],
    tips: ["Deep nesting is easy to read in a tree but awkward in code; flatten it when you can.", "Use the copy path button in the tree to get the exact path of any value."],
    js: `const first = data.company.departments[0].teams[0].members[0].name; // "Ada"`,
    py: `first = data["company"]["departments"][0]["teams"][0]["members"][0]["name"]  # Ada`,
    related: ["json-array-example", "user-profile-json"],
  },
  {
    slug: "user-profile-json",
    h1: "User Profile JSON Example",
    title: "User Profile JSON Example (API Response)",
    description: "A realistic user profile JSON: ids, nested profile and preferences, roles, ISO 8601 timestamps and a null field. Fake data for testing and documentation.",
    intro: "A typical response from a users endpoint: identifiers, a nested profile, preferences, roles and timestamps. All values are invented.",
    data: {
      id: 1042,
      username: "ada_l",
      email: "ada@example.com",
      emailVerified: true,
      profile: { displayName: "Ada Lovelace", avatarUrl: "https://example.com/avatars/1042.png", bio: null, location: "London, UK" },
      roles: ["admin", "editor"],
      preferences: { theme: "dark", language: "en", notifications: { email: true, push: false } },
      createdAt: "2026-01-15T09:30:00Z",
      lastLoginAt: "2026-10-28T18:05:42Z",
    },
    fields: [
      { path: "id", type: "number", note: "A numeric identifier. Very large ids should be sent as strings." },
      { path: "email", type: "string", note: "example.com is reserved for documentation, so it never belongs to a real person." },
      { path: "profile.bio", type: "null", note: "A field that exists but has no value yet." },
      { path: "roles", type: "array of strings", note: "Permissions as a list of names." },
      { path: "preferences.notifications", type: "object", note: "Grouped boolean settings." },
      { path: "createdAt", type: "string", note: "ISO 8601 UTC timestamp. JSON has no date type, so dates are strings." },
    ],
    uses: ["Mocking a users API in tests and documentation", "Generating TypeScript, Zod or Python models from a realistic response", "Trying the JSON Schema validator with required fields"],
    tips: ["Use ISO 8601 for dates and convert in your code.", "Prefer null for a known but empty value and omit keys that do not apply."],
    js: `const user = await (await fetch("/api/users/1042")).json();\nif (user.preferences.notifications.email) sendDigest(user.email);`,
    py: `user = requests.get(url).json()\nif user["preferences"]["notifications"]["email"]:\n    send_digest(user["email"])`,
    related: ["paginated-api-response-json", "nested-json-example"],
  },
  {
    slug: "paginated-api-response-json",
    h1: "Paginated API Response JSON Example",
    title: "Paginated API Response JSON Example (data, meta, links)",
    description: "A paginated REST API response in JSON with data, meta and links, plus notes on page-based versus cursor-based pagination.",
    intro: "List endpoints rarely return everything at once. This example shows the common envelope: the items under data, paging details under meta and navigation links under links.",
    data: {
      data: [
        { id: 4, title: "Parsing JSON in the browser", status: "published" },
        { id: 5, title: "Working with large files", status: "published" },
        { id: 6, title: "Validating with JSON Schema", status: "draft" },
      ],
      meta: { page: 2, perPage: 3, total: 14, totalPages: 5 },
      links: {
        self: "https://api.example.com/articles?page=2&perPage=3",
        first: "https://api.example.com/articles?page=1&perPage=3",
        prev: "https://api.example.com/articles?page=1&perPage=3",
        next: "https://api.example.com/articles?page=3&perPage=3",
        last: "https://api.example.com/articles?page=5&perPage=3",
      },
    },
    fields: [
      { path: "data", type: "array of objects", note: "The items of the current page." },
      { path: "meta.page / perPage", type: "number", note: "Where you are and how big a page is." },
      { path: "meta.total / totalPages", type: "number", note: "How many items and pages exist in total." },
      { path: "links.next / prev", type: "string or null", note: "Ready-made URLs. On the last page, next is usually null or missing." },
    ],
    uses: ["Testing a client that follows next links until none is left", "Mocking list endpoints", "Learning the envelope pattern used by many APIs"],
    tips: ["Page numbers are simple but can skip or repeat items when data changes between requests. Cursor-based pagination (a next token instead of page numbers) avoids that.", "Always stop when there is no next link instead of trusting totalPages."],
    js: `let url = firstUrl;\nconst all = [];\nwhile (url) {\n  const page = await (await fetch(url)).json();\n  all.push(...page.data);\n  url = page.links.next ?? null;\n}`,
    py: `url, items = first_url, []\nwhile url:\n    page = requests.get(url).json()\n    items += page["data"]\n    url = page["links"].get("next")`,
    related: ["json-array-example", "user-profile-json"],
  },
  {
    slug: "product-catalog-json",
    h1: "Product Catalog JSON Example",
    title: "Product Catalog JSON Example for E-commerce",
    description: "A product catalog in JSON with SKUs, prices, stock, tags, dimensions and variants. Fake data for building and testing shop interfaces.",
    intro: "A small store catalog with products, optional variants and nested dimensions. It is useful for building product lists, filters and cart logic against realistic data.",
    data: {
      store: "Corner Goods",
      currency: "EUR",
      products: [
        { sku: "MUG-001", name: "Enamel Mug", price: 12.5, inStock: true, tags: ["kitchen", "gift"], dimensions: { heightCm: 8, widthCm: 9 }, variants: [{ color: "white", stock: 24 }, { color: "navy", stock: 0 }] },
        { sku: "NBK-014", name: "Dotted Notebook", price: 7.9, inStock: true, tags: ["stationery"], dimensions: { heightCm: 21, widthCm: 14.8 }, variants: [] },
        { sku: "LMP-220", name: "Desk Lamp", price: 39, inStock: false, tags: ["lighting", "office"], dimensions: { heightCm: 42, widthCm: 15 }, variants: [{ color: "black", stock: 0 }] },
      ],
    },
    fields: [
      { path: "currency", type: "string", note: "An ISO 4217 code such as EUR. State it once for the whole document." },
      { path: "products[].sku", type: "string", note: "Stock keeping unit, a stable identifier for each product." },
      { path: "products[].price", type: "number", note: "Shown as a decimal here; see the tip about money." },
      { path: "products[].variants", type: "array", note: "Empty when a product has no options." },
      { path: "products[].dimensions", type: "object", note: "Grouped measurements with the unit in the key name." },
    ],
    uses: ["Prototyping a shop front end", "Practising filters: JSONPath $.products[?(@.inStock == true)].name", "Converting to CSV for a spreadsheet"],
    tips: ["Floating-point numbers are risky for money (0.1 + 0.2 is not 0.3). Many APIs send prices as integer cents or as strings.", "Put the unit in the key name (heightCm) so it cannot be misread."],
    js: `const inStock = data.products.filter((p) => p.inStock).map((p) => p.name);`,
    py: `in_stock = [p["name"] for p in data["products"] if p["inStock"]]`,
    related: ["order-invoice-json", "json-array-example"],
  },
  {
    slug: "order-invoice-json",
    h1: "Order and Invoice JSON Example",
    title: "Order / Invoice JSON Example with Line Items and Totals",
    description: "An e-commerce order in JSON: customer, line items, totals in integer cents, status and timestamps. Fake data to test checkout and invoicing code.",
    intro: "An order with a customer, line items and totals. Amounts are integers in cents, which avoids floating-point rounding errors.",
    data: {
      orderId: "ORD-2026-000187",
      status: "paid",
      placedAt: "2026-10-27T14:12:09Z",
      customer: { id: 1042, name: "Ada Lovelace", email: "ada@example.com" },
      shippingAddress: { line1: "12 Example Street", city: "London", postalCode: "N1 9GU", country: "GB" },
      items: [
        { sku: "MUG-001", name: "Enamel Mug", quantity: 2, unitPriceCents: 1250 },
        { sku: "NBK-014", name: "Dotted Notebook", quantity: 1, unitPriceCents: 790 },
      ],
      totals: { subtotalCents: 3290, shippingCents: 495, taxCents: 657, totalCents: 4442 },
      currency: "EUR",
    },
    fields: [
      { path: "orderId", type: "string", note: "A readable identifier. Strings avoid precision problems with long numbers." },
      { path: "status", type: "string", note: "One of a small set of values such as pending, paid or shipped." },
      { path: "items[].unitPriceCents", type: "number", note: "Price in the smallest currency unit, an integer." },
      { path: "totals", type: "object", note: "Computed amounts, also in cents. totalCents = subtotal + shipping + tax." },
      { path: "placedAt", type: "string", note: "ISO 8601 UTC timestamp." },
    ],
    uses: ["Testing checkout, invoicing and reporting code", "Validating the structure with a JSON Schema", "Generating typed models for an orders service"],
    tips: ["Use integers in the smallest unit (cents) or decimal strings for money, never binary floating point.", "Keep line items and totals consistent; recompute totals on the server instead of trusting the client."],
    js: `const total = data.items.reduce((sum, i) => sum + i.quantity * i.unitPriceCents, 0); // 3290`,
    py: `total = sum(i["quantity"] * i["unitPriceCents"] for i in data["items"])  # 3290`,
    related: ["product-catalog-json", "user-profile-json"],
  },
  {
    slug: "blog-posts-json",
    h1: "Blog Posts JSON Example",
    title: "Blog Posts JSON Example (Articles, Authors, Tags)",
    description: "A JSON feed of blog posts with authors, tags, dates and comment counts. Fake content for building blogs, lists and RSS-like feeds.",
    intro: "A list of articles with embedded authors and tags, the shape most blog and CMS APIs return.",
    data: {
      posts: [
        { id: 1, slug: "hello-json", title: "Hello, JSON", author: { name: "Ada Lovelace", handle: "ada_l" }, publishedAt: "2026-09-02T08:00:00Z", tags: ["json", "basics"], excerpt: "A short introduction to the format.", commentsCount: 4 },
        { id: 2, slug: "validating-data", title: "Validating data early", author: { name: "Alan Turing", handle: "alan_t" }, publishedAt: "2026-09-19T10:30:00Z", tags: ["json-schema", "quality"], excerpt: "Why schemas catch bugs before production.", commentsCount: 0 },
        { id: 3, slug: "large-files", title: "Working with large files", author: { name: "Ada Lovelace", handle: "ada_l" }, publishedAt: "2026-10-11T07:15:00Z", tags: ["performance"], excerpt: "Strategies for files that do not fit on screen.", commentsCount: 9 },
      ],
    },
    fields: [
      { path: "posts[].slug", type: "string", note: "A URL-friendly identifier used in links." },
      { path: "posts[].author", type: "object", note: "Embedded so one request is enough to display the list." },
      { path: "posts[].tags", type: "array of strings", note: "A many-to-many relation expressed as a list of names." },
      { path: "posts[].publishedAt", type: "string", note: "ISO 8601 timestamp, sortable as text." },
      { path: "posts[].commentsCount", type: "number", note: "A precomputed number so the list does not need the comments." },
    ],
    uses: ["Prototyping a blog or news list", "Grouping by author or tag with code or JSONPath", "Converting to YAML or XML for static site generators and feeds"],
    tips: ["Embedding the author repeats data in every post; referencing an authorId saves space but needs a second lookup.", "Sort by publishedAt: ISO 8601 strings sort correctly as plain text."],
    js: `const byAuthor = Object.groupBy(data.posts, (p) => p.author.handle);`,
    py: `from collections import defaultdict\nby_author = defaultdict(list)\nfor p in data["posts"]:\n    by_author[p["author"]["handle"]].append(p)`,
    related: ["paginated-api-response-json", "json-array-example"],
  },
  {
    slug: "package-json-example",
    h1: "package.json Example",
    title: "package.json Example for a Node.js Project (Explained)",
    description: "A complete package.json example with scripts, dependencies, devDependencies and engines, and an explanation of every field.",
    intro: "package.json describes a Node.js project: its name, version, scripts and dependencies. This example is a realistic small web project, with every field explained.",
    data: {
      name: "example-app",
      version: "1.2.0",
      description: "A small example web application",
      private: true,
      main: "dist/index.js",
      scripts: { dev: "vite", build: "tsc && vite build", test: "vitest run", lint: "eslint ." },
      dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
      devDependencies: { typescript: "^5.9.0", vite: "^7.0.0", vitest: "^3.0.0" },
      engines: { node: ">=20" },
      license: "MIT",
    },
    fields: [
      { path: "name / version", type: "string", note: "The package identity. Version numbers follow semantic versioning: major.minor.patch." },
      { path: "private", type: "boolean", note: "true prevents accidentally publishing the package to npm." },
      { path: "scripts", type: "object", note: "Named commands you run with npm run <name>." },
      { path: "dependencies", type: "object", note: "Packages needed at runtime. The ^ prefix allows compatible minor and patch updates." },
      { path: "devDependencies", type: "object", note: "Tools needed only for development and builds." },
      { path: "engines", type: "object", note: "Which Node.js versions the project supports." },
    ],
    uses: ["Understanding what each field does", "A starting point for a new project", "Practising edits in the tree view"],
    tips: ["package.json must be strict JSON: no comments and no trailing commas, unlike tsconfig.json.", "Commit the lockfile as well; it pins the exact versions that ranges like ^19.0.0 resolve to."],
    js: `import pkg from "./package.json" with { type: "json" };\nconsole.log(pkg.version);`,
    py: `import json\nversion = json.load(open("package.json"))["version"]`,
    related: ["app-config-json", "simple-json-example"],
  },
  {
    slug: "geojson-example",
    h1: "GeoJSON Example",
    title: "GeoJSON Example: Point, Polygon and FeatureCollection",
    description: "A valid GeoJSON FeatureCollection with a Point and a Polygon, plus the coordinate order rule (longitude, latitude) that trips up many developers.",
    intro: "GeoJSON is JSON for geographic data. This example is a FeatureCollection with one point and one polygon, using invented names at arbitrary coordinates.",
    data: {
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { name: "Example Cafe", kind: "cafe" }, geometry: { type: "Point", coordinates: [-0.1276, 51.5072] } },
        {
          type: "Feature",
          properties: { name: "Example Park", kind: "park" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.13, 51.505],
                [-0.125, 51.505],
                [-0.125, 51.509],
                [-0.13, 51.509],
                [-0.13, 51.505],
              ],
            ],
          },
        },
      ],
    },
    fields: [
      { path: "type", type: "string", note: "FeatureCollection holds a list of Feature objects." },
      { path: "features[].properties", type: "object", note: "Free-form attributes such as a name." },
      { path: "features[].geometry.type", type: "string", note: "Point, LineString, Polygon and others." },
      { path: "geometry.coordinates", type: "array", note: "Order is [longitude, latitude], the opposite of how most people say it." },
      { path: "Polygon ring", type: "array of positions", note: "The first and last position of a ring must be the same, so the shape is closed." },
    ],
    uses: ["Testing map libraries", "Learning the GeoJSON structure from RFC 7946", "Checking exports from GIS tools"],
    tips: ["Longitude comes first. Swapping the two is the most common GeoJSON bug and puts points in the wrong place.", "Coordinates are in WGS 84 degrees; large precision adds file size without adding useful accuracy."],
    js: `const [lng, lat] = data.features[0].geometry.coordinates;`,
    py: `lng, lat = data["features"][0]["geometry"]["coordinates"]`,
    related: ["nested-json-example", "json-array-example"],
  },
  {
    slug: "app-config-json",
    h1: "Application Config JSON Example",
    title: "Application Config JSON Example (Server, Database, Features)",
    description: "A configuration file in JSON with server, database, logging, feature flags and CORS settings, and advice on keeping secrets out of it.",
    intro: "Many applications read their settings from a JSON file. This example groups settings by area and shows common patterns such as feature flags and a list of allowed origins.",
    data: {
      server: { host: "0.0.0.0", port: 8080, requestTimeoutMs: 30000 },
      database: { host: "db.internal", port: 5432, name: "appdb", poolSize: 10 },
      logging: { level: "info", pretty: false },
      features: { newDashboard: true, betaExport: false },
      cors: { allowedOrigins: ["https://app.example.com", "https://admin.example.com"] },
    },
    fields: [
      { path: "server", type: "object", note: "Where and how the service listens." },
      { path: "database", type: "object", note: "Connection settings. Passwords are deliberately not stored here." },
      { path: "logging.level", type: "string", note: "One of a fixed set such as debug, info, warn or error." },
      { path: "features", type: "object of booleans", note: "Feature flags that switch behaviour without a deploy." },
      { path: "cors.allowedOrigins", type: "array of strings", note: "An allow-list of browser origins." },
    ],
    uses: ["A template for your own service configuration", "Validating configuration with a JSON Schema before deploying", "Converting to YAML for tools that prefer it"],
    tips: ["Keep secrets (passwords, API keys) in environment variables or a secret manager, not in a JSON file in your repository.", "Validate the file at startup so a typo fails fast instead of in production."],
    js: `const config = JSON.parse(fs.readFileSync("config.json", "utf8"));\nserver.listen(config.server.port, config.server.host);`,
    py: `config = json.load(open("config.json"))\nport = config["server"]["port"]`,
    related: ["package-json-example", "simple-json-example"],
  },
  {
    slug: "weather-api-json",
    h1: "Weather API JSON Example",
    title: "Weather API JSON Example (Current Conditions and Forecast)",
    description: "A weather API response in JSON with current conditions and a daily forecast array. Fake values for building weather widgets and charts.",
    intro: "A weather service typically returns the location, the current conditions and a short forecast. All numbers below are invented.",
    data: {
      location: { name: "Exampleville", country: "GB", latitude: 51.51, longitude: -0.13, timezone: "Europe/London" },
      current: { time: "2026-10-30T12:00:00Z", temperatureC: 11.4, feelsLikeC: 9.8, humidityPercent: 78, windKph: 17, condition: "Light rain" },
      forecast: [
        { date: "2026-10-31", minC: 7, maxC: 12, precipitationMm: 3.2, condition: "Showers" },
        { date: "2026-11-01", minC: 6, maxC: 10, precipitationMm: 0, condition: "Cloudy" },
        { date: "2026-11-02", minC: 4, maxC: 9, precipitationMm: 0.4, condition: "Clear" },
      ],
      units: { temperature: "celsius", wind: "kph", precipitation: "mm" },
    },
    fields: [
      { path: "location", type: "object", note: "Place details including the timezone name." },
      { path: "current", type: "object", note: "A snapshot of the conditions now." },
      { path: "forecast", type: "array of objects", note: "One entry per day, ideal for a chart." },
      { path: "units", type: "object", note: "Stating units explicitly avoids misreading 12 as Celsius or Fahrenheit." },
    ],
    uses: ["Building a weather widget or dashboard", "Drawing a chart of minC and maxC", "Mocking an external API in tests"],
    tips: ["Include units in key names (temperatureC) or in a units object.", "Send timestamps in UTC and convert to the viewer's timezone in the client."],
    js: `const highs = data.forecast.map((d) => d.maxC); // [12, 10, 9]`,
    py: `highs = [d["maxC"] for d in data["forecast"]]  # [12, 10, 9]`,
    related: ["json-array-example", "nested-json-example"],
  },
];

export const exampleBySlug = (slug: string) => EXAMPLES.find((e) => e.slug === slug);
export const exampleJson = (e: ExamplePage) => JSON.stringify(e.data, null, 2);
