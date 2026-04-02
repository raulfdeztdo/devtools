# Architecture

> Technical architecture documentation for the `devtools` project.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Vue 3 (Composition API) | ^3.3.8 |
| Router | Vue Router | ^5.0.3 |
| Build Tool | Vite | ^7.3.1 |
| CSS Framework | Tailwind CSS | ^3.3.6 |
| PostCSS | autoprefixer | ^10.4.16 |
| JSON Schema | AJV + ajv-formats + ajv-errors + ajv-draft-04 | ^8.17.1 |
| i18n | vue-i18n | ^11.3.0 |
| Icons | lucide-vue-next | ^1.0.0 |
| Markdown | marked | ^17.0.5 |
| SQL | sql-formatter | ^15.7.3 |
| Code formatting | prettier | ^3.8.1 |
| YAML | js-yaml | ^4.1.1 |
| TOML | smol-toml | ^1.6.1 |
| QR codes | qrcode | ^1.5.4 |
| Text diff | diff | ^8.0.4 |
| TOML (alt) | @iarna/toml | ^2.2.5 |

## Application Architecture

### SPA Structure

```
Browser
  └── index.html
        └── #app (Vue mount point)
              └── App.vue (root component)
                    ├── <header> (navigation)
                    │     ├── Logo/title link
                    │     ├── Desktop nav (Home + Tools dropdown)
                    │     ├── Theme toggle
                    │     ├── Language switcher
                    │     └── Mobile hamburger menu
                    └── <main>
                          └── <router-view /> (dynamic)
                                ├── Home.vue (/)
                                ├── JSONLint.vue (/jsonlint)
                                ├── JSONSchemaValidator.vue (/json-schema-validator)
                                ├── JSONCompare.vue (/json-compare)
                                ├── UUIDGenerator.vue (/uuid-generator)
                                ├── PasswordGenerator.vue (/password-generator)
                                ├── TimestampConverter.vue (/timestamp-converter)
                                ├── Base64Converter.vue (/base64-converter)
                                ├── URLConverter.vue (/url-converter)
                                ├── ColorPaletteGenerator.vue (/color-palette-generator)
                                ├── PHPSerializer.vue (/php-serializer)
                                ├── HashGenerator.vue (/hash-generator)
                                ├── JwtDecoder.vue (/jwt-decoder)
                                ├── HtmlEntityEncoder.vue (/html-entity-encoder)
                                ├── RegexTester.vue (/regex-tester)
                                ├── SqlFormatter.vue (/sql-formatter)
                                ├── CssJsMinifier.vue (/css-js-minifier)
                                ├── LoremIpsum.vue (/lorem-ipsum)
                                ├── CronParser.vue (/cron-parser)
                                ├── HttpStatusCodes.vue (/http-status-codes)
                                ├── UserAgentParser.vue (/user-agent-parser)
                                ├── FaviconGenerator.vue (/favicon-generator)
                                ├── TextDiff.vue (/text-diff)
                                ├── CaseConverter.vue (/case-converter)
                                ├── StringCounter.vue (/string-counter)
                                ├── QrGenerator.vue (/qr-generator)
                                ├── MarkdownPreview.vue (/markdown-preview)
                                ├── YamlJsonConverter.vue (/yaml-json)
                                ├── TomlJsonConverter.vue (/toml-json)
                                └── XmlJsonConverter.vue (/xml-json)
```

### Component Inventory

| Component | External Deps | Shared Component Used |
|-----------|---------------|----------------------|
| App.vue | lucide-vue-next, vue-i18n | -- |
| Home.vue | lucide-vue-next, vue-i18n | -- |
| JSONLint.vue | lucide-vue-next, vue-i18n | LineNumberedTextarea |
| JSONSchemaValidator.vue | ajv, ajv-formats, ajv-errors, ajv-draft-04, lucide-vue-next, vue-i18n | LineNumberedTextarea |
| JSONCompare.vue | lucide-vue-next, vue-i18n | LineNumberedTextarea |
| UUIDGenerator.vue | lucide-vue-next, vue-i18n | -- |
| PasswordGenerator.vue | lucide-vue-next, vue-i18n | -- |
| TimestampConverter.vue | lucide-vue-next, vue-i18n | -- |
| Base64Converter.vue | lucide-vue-next, vue-i18n | -- |
| URLConverter.vue | lucide-vue-next, vue-i18n | -- |
| ColorPaletteGenerator.vue | lucide-vue-next, vue-i18n | -- |
| PHPSerializer.vue | lucide-vue-next, vue-i18n | -- |
| HashGenerator.vue | lucide-vue-next, vue-i18n | -- |
| JwtDecoder.vue | lucide-vue-next, vue-i18n | -- |
| HtmlEntityEncoder.vue | lucide-vue-next, vue-i18n | -- |
| RegexTester.vue | lucide-vue-next, vue-i18n | -- |
| SqlFormatter.vue | sql-formatter, lucide-vue-next, vue-i18n | LineNumberedTextarea |
| CssJsMinifier.vue | prettier, lucide-vue-next, vue-i18n | LineNumberedTextarea |
| LoremIpsum.vue | lucide-vue-next, vue-i18n | -- |
| CronParser.vue | lucide-vue-next, vue-i18n | -- |
| HttpStatusCodes.vue | lucide-vue-next, vue-i18n | -- |
| UserAgentParser.vue | lucide-vue-next, vue-i18n | -- |
| FaviconGenerator.vue | lucide-vue-next, vue-i18n | -- |
| TextDiff.vue | diff, lucide-vue-next, vue-i18n | -- |
| CaseConverter.vue | lucide-vue-next, vue-i18n | -- |
| StringCounter.vue | lucide-vue-next, vue-i18n | -- |
| QrGenerator.vue | qrcode, lucide-vue-next, vue-i18n | -- |
| MarkdownPreview.vue | marked, lucide-vue-next, vue-i18n | -- |
| YamlJsonConverter.vue | js-yaml, lucide-vue-next, vue-i18n | LineNumberedTextarea |
| TomlJsonConverter.vue | smol-toml, lucide-vue-next, vue-i18n | LineNumberedTextarea |
| XmlJsonConverter.vue | lucide-vue-next, vue-i18n | LineNumberedTextarea |
| LineNumberedTextarea.vue | -- | -- |

All 31 components use Composition API with `<script setup>`.

### State Management

**There is no global state management.** Each view is completely self-contained:

- Views own their state via `ref()`/`reactive()`/`computed()`
- No Vuex, no Pinia, no provide/inject across views
- The only shared state is the dark mode flag and locale in `App.vue` (stored in `localStorage`)
- Navigation tool list is a const array in `App.vue`, not reactive global state

### Data Flow

```
App.vue
  │
  ├── isDark (ref) ←→ localStorage('theme')
  ├── locale (ref) ←→ localStorage('locale')
  ├── tools[] (const array) → dropdown + mobile menu
  └── <router-view />
        └── ViewComponent.vue
              ├── Own state (ref/reactive/data)
              ├── Own methods
              ├── Own computed properties
              └── [optional] LineNumberedTextarea
                    ├── Props: modelValue, placeholder, readonly, etc.
                    └── Emits: update:modelValue
```

## Routing

Defined in `src/main.js` using `createRouter` with `createWebHistory()`:

```javascript
const routes = [
  { path: "/", component: Home },
  { path: "/jsonlint", component: JSONLint },
  { path: "/json-schema-validator", component: JSONSchemaValidator },
  { path: "/uuid-generator", component: UUIDGenerator },
  { path: "/password-generator", component: PasswordGenerator },
  { path: "/timestamp-converter", component: TimestampConverter },
  { path: "/base64-converter", component: Base64Converter },
  { path: "/url-converter", component: URLConverter },
  { path: "/color-palette-generator", component: ColorPaletteGenerator },
  { path: "/php-serializer", component: PHPSerializer },
  { path: "/json-compare", component: JSONCompare },
  { path: "/hash-generator", component: HashGenerator },
  { path: "/jwt-decoder", component: JwtDecoder },
  { path: "/html-entity-encoder", component: HtmlEntityEncoder },
  { path: "/regex-tester", component: RegexTester },
  { path: "/sql-formatter", component: SqlFormatter },
  { path: "/css-js-minifier", component: CssJsMinifier },
  { path: "/lorem-ipsum", component: LoremIpsum },
  { path: "/cron-parser", component: CronParser },
  { path: "/http-status-codes", component: HttpStatusCodes },
  { path: "/user-agent-parser", component: UserAgentParser },
  { path: "/favicon-generator", component: FaviconGenerator },
  { path: "/text-diff", component: TextDiff },
  { path: "/case-converter", component: CaseConverter },
  { path: "/string-counter", component: StringCounter },
  { path: "/qr-generator", component: QrGenerator },
  { path: "/markdown-preview", component: MarkdownPreview },
  { path: "/yaml-json", component: YamlJsonConverter },
  { path: "/toml-json", component: TomlJsonConverter },
  { path: "/xml-json", component: XmlJsonConverter },
]
```

**Note:** All components are eagerly imported (no lazy loading). Single JS bundle.

**Note:** There is no 404 catch-all route. Unknown paths render blank.

## Styling Architecture

### Tailwind Configuration

**Color Palette** (`tailwind.config.js`):

```
brand-blue:          #3d6494  (primary)
brand-blue-dark:     #2d4a6e
brand-blue-light:    #5a82b4
brand-blue-lighter:  #8aaac8
brand-blue-lightest: #c8daea
brand-orange:        #d4845a  (accent)
brand-orange-dark:   #bc6e46
brand-orange-vivid:  #e8621a  (DO NOT use as text in light mode)
brand-orange-light:  #e0a07a
brand-orange-lighter:#ecc4a8
brand-muted:         #7a8fa6
brand-muted-light:   #a0b4c4
brand-muted-dark:    #2c3a4a

night-bg:            #1a2332  (dark mode base background)
night-card:          #243044  (dark mode card surface)
night-card-inner:    #2c3a52  (dark mode inner card / nested surface)
night-border:        #334466  (dark mode border)
```

**Dark Mode:** `darkMode: 'class'` -- toggled by adding/removing `dark` class on `<html>`.

### Custom Component Classes (`src/style.css`)

Defined in `@layer components`:

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Blue branded button |
| `.btn-secondary` | Muted gray button |
| `.card` | White card with border, shadow, rounded corners |
| `.card-hover` | Hover effect for cards (shadow + translate + border) |
| `.input-field` | Text input with focus ring |
| `.textarea-field` | Monospace textarea |
| `.checkbox` | Styled checkbox |
| `.radio` | Styled radio button |
| `.result-display` | Monospace read-only output area |

Utility classes in `@layer utilities`:

| Class | Purpose |
|-------|---------|
| `.text-gradient` | Blue-to-orange gradient text |
| `.shadow-brand` | Blue-tinted shadow |
| `.fill-brand-blue` | SVG fill blue |
| `.fill-brand-orange` | SVG fill orange |

### Design System Patterns

**Navigation** (App.vue):
- Frosted glass: `bg-white/70 backdrop-blur-xl dark:bg-gray-950/70`
- Sticky: `sticky top-0 z-50`
- Subtle border: `border-b border-gray-200/60 dark:border-gray-800/60`

**Home Page** (Home.vue):
- Bento grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[180px]`
- Featured card (JSONLint): `sm:col-span-2 sm:row-span-2`
- Wide cards: `sm:col-span-2`
- Card hover: `hover:shadow-lg hover:border-brand-blue/40`

**Tool Views** (standard container pattern for all views):
```html
<div class="py-8">
  <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Title</h1>
      <p class="text-gray-600 dark:text-gray-400">Description</p>
    </div>
    <!-- Content grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="p-6 card">...</div>
      <div class="p-6 card">...</div>
    </div>
  </div>
</div>
```

## Build & Deploy

### Development

```bash
npm run dev           # Vite dev server, port 3000, HMR
```

### Production Build

```bash
npm run build         # Outputs to dist/
npm run preview       # Preview on port 8080
```

Vite config (`vite.config.js`):
- `@` alias resolves to `src/`
- No manual chunks (single bundle)

### Deploy (Netlify)

The project deploys to Netlify via Git integration (push to `main` triggers deploy).
Configuration is defined in `netlify.toml` at the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The SPA redirect rule is required because Vue Router uses `createWebHistory()` (clean URLs without `#`).

### Port Map

| Context | Port |
|---------|------|
| Vite dev server | 3000 |
| Vite preview | 8080 |

## External Dependencies

### Runtime (in browser)

| Package | Purpose | Used By |
|---------|---------|---------|
| `vue` | UI framework | All components |
| `vue-router` | Client-side routing | main.js |
| `vue-i18n` | Internationalization (ES/EN) | All components |
| `lucide-vue-next` | SVG icon library | All components |
| `ajv` | JSON Schema validation engine | JSONSchemaValidator.vue |
| `ajv-formats` | Standard format validators | JSONSchemaValidator.vue |
| `ajv-errors` | Custom error messages | JSONSchemaValidator.vue |
| `ajv-draft-04` | Draft-04 schema support | JSONSchemaValidator.vue |
| `marked` | Markdown to HTML rendering | MarkdownPreview.vue |
| `sql-formatter` | SQL query formatting | SqlFormatter.vue |
| `prettier` | CSS/JS code formatting | CssJsMinifier.vue |
| `js-yaml` | YAML parsing and serialization | YamlJsonConverter.vue |
| `smol-toml` | TOML parsing and serialization | TomlJsonConverter.vue |
| `@iarna/toml` | TOML serialization (stringify) | TomlJsonConverter.vue |
| `qrcode` | QR code generation (canvas) | QrGenerator.vue |
| `diff` | Text diff algorithm (LCS) | TextDiff.vue |

### Native Browser APIs Used

| API | Used By |
|-----|---------|
| `crypto.subtle.digest` | HashGenerator (SHA-1, SHA-256, SHA-512), UUIDGenerator (v3/v5) |
| `navigator.clipboard.writeText` | All tools (copy to clipboard) |
| `FileReader` | Base64Converter (file encoding), FaviconGenerator (image upload) |
| `URL` / `URLSearchParams` | URLConverter |
| `btoa` / `atob` | Base64Converter |
| `encodeURIComponent` / `decodeURIComponent` | URLConverter, HtmlEntityEncoder |
| `Intl.DateTimeFormat` | TimestampConverter |
| `HTMLCanvasElement` | FaviconGenerator, QrGenerator |
| `localStorage` | Theme persistence (`theme`), locale persistence (`locale`) |
| `matchMedia` | System dark mode detection (`prefers-color-scheme`) |
| `navigator.userAgent` | UserAgentParser |

## Known Technical Debt

1. **No lazy loading** — All views are eagerly imported in `main.js`. This produces a single large JS bundle (~1.1 MB minified, ~322 KB gzipped).
2. **No 404 route** — Unknown paths render a blank page.
3. **No error boundaries** — No global Vue error handling (`app.config.errorHandler`).
4. **No tests** — Zero test coverage (unit or e2e).
5. **API key in config** — `opencode.jsonc` contains a plaintext API key (gitignored).
6. **Slider hardcoded color** — `PasswordGenerator.vue` has a hardcoded `#10b981` for the range slider thumb (Tailwind cannot style native range inputs without arbitrary values or plugins).
