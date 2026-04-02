# AGENTS.md

> Agent instructions for the `devtools` project. This file provides context, rules, skill references, MCP integration, and parallel execution strategies for any AI agent working on this codebase.

## Project Overview

**devtools** is a fully-offline developer utility suite built with Vue 3 + Vite + Tailwind CSS. It provides multiple browser-based tools for common developer tasks (JSON validation, UUID generation, password generation, encoding/decoding, etc.). All processing happens client-side with zero external API calls.

- **Stack:** Vue 3.3, Vue Router 5, Vite 7, Tailwind CSS 3, AJV 8, vue-i18n 11, Lucide Vue Next, Prettier, Marked, sql-formatter, js-yaml, smol-toml, qrcode, diff
- **Language:** JavaScript (no TypeScript yet)
- **UI language:** Bilingual -- Spanish (es) and English (en), auto-detected from browser locale with manual override
- **Icons:** Lucide Vue Next (no emojis in UI)
- **Design:** Dark blue + orange pastel brand palette, frosted-glass navigation, bento grid Home page, dark/light mode

## Directory Structure

```
devtools/
├── .agents/                        # Agent skills and instructions
│   ├── context-docs/
│   │   ├── architecture.md         # Technical architecture reference
│   │   └── non-negotiable.md       # Hard rules (MUST read before coding)
│   └── skills/
│       ├── accessibility/          # WCAG 2.2 audit and a11y improvements
│       ├── add-tool/               # Workflow for adding new tools (custom)
│       ├── frontend-design/        # Production-grade UI design patterns
│       ├── i18n-translation/       # Internationalization workflow (custom)
│       ├── nodejs-backend-patterns/# Node.js backend patterns (reference)
│       ├── nodejs-best-practices/  # Node.js decision-making principles (reference)
│       ├── seo/                    # SEO audit and optimization
│       ├── tailwind-css-patterns/  # Tailwind CSS utility-first patterns
│       ├── vite/                   # Vite build tool and plugin API
│       ├── vue/                    # Vue 3 core patterns (by Anthony Fu)
│       ├── vue-best-practices/     # Vue 3 coding standards (by Anthony Fu)
│       ├── vue-debug-guides/       # Vue 3 debugging and error handling
│       └── worktree-parallel-agents/ # Git worktrees + parallel subagent orchestration (custom)
├── src/
│   ├── App.vue                     # Root shell: nav, theme toggle, locale switcher, footer
│   ├── main.js                     # Entry point: createApp, router, i18n, routes
│   ├── style.css                   # Tailwind layers: base, components, utilities
│   ├── i18n/
│   │   ├── index.js                # i18n config with browser locale detection
│   │   └── locales/
│   │       ├── es.json             # Spanish translations (~900+ keys)
│   │       └── en.json             # English translations (~900+ keys)
│   ├── components/
│   │   └── LineNumberedTextarea.vue # Shared textarea with line numbers
│   └── views/                      # 29 tool views + Home
│       ├── Home.vue                # Bento grid tool index
│       ├── JSONLint.vue            # JSON validator/formatter
│       ├── JSONSchemaValidator.vue  # JSON Schema validation (uses AJV)
│       ├── JSONCompare.vue         # Side-by-side JSON diff
│       ├── UUIDGenerator.vue       # UUID v1-v5 generator
│       ├── PasswordGenerator.vue   # Secure password generator
│       ├── TimestampConverter.vue  # Unix timestamp converter
│       ├── Base64Converter.vue     # Base64 encode/decode
│       ├── URLConverter.vue        # URL encode/decode + builder
│       ├── ColorPaletteGenerator.vue # Color palette generator
│       ├── PHPSerializer.vue       # PHP serialize/unserialize
│       ├── HashGenerator.vue       # MD5/SHA hash generator
│       ├── JwtDecoder.vue          # JWT decoder
│       ├── HtmlEntityEncoder.vue   # HTML entity encode/decode
│       ├── RegexTester.vue         # Regex tester with match highlighting
│       ├── SqlFormatter.vue        # SQL formatter
│       ├── CssJsMinifier.vue       # CSS/JS minifier (Prettier)
│       ├── LoremIpsum.vue          # Lorem Ipsum generator
│       ├── CronParser.vue          # Cron expression parser/builder
│       ├── HttpStatusCodes.vue     # HTTP status code reference
│       ├── UserAgentParser.vue     # User-Agent string parser
│       ├── FaviconGenerator.vue    # Favicon generator (canvas)
│       ├── TextDiff.vue            # Text diff viewer
│       ├── CaseConverter.vue       # Case conversion (camel, snake, kebab...)
│       ├── StringCounter.vue       # Character/word/byte counter
│       ├── QrGenerator.vue         # QR code generator
│       ├── MarkdownPreview.vue     # Markdown editor + preview
│       ├── YamlJsonConverter.vue   # YAML <-> JSON converter
│       ├── TomlJsonConverter.vue   # TOML <-> JSON converter
│       └── XmlJsonConverter.vue    # XML <-> JSON converter
├── public/                         # Static assets (favicon.svg, fonts)
├── netlify.toml                    # Netlify build config + SPA redirect rule
├── tailwind.config.js              # Brand color palette, fonts, animations
├── vite.config.js                  # Vite config with @ alias
├── package.json                    # Dependencies and scripts
├── opencode.jsonc                  # OpenCode config: MCP servers + agents (gitignored — contains API key)
├── skills-lock.json                # Installed skills registry (do not edit manually)
├── AGENTS.md                       # This file
└── README.md                       # Project documentation
```

## Critical Rules

**Before writing any code, read `.agents/context-docs/non-negotiable.md`.** It contains hard rules that cannot be violated under any circumstance. Violations will break the project or the user's trust.

---

## MCP Integration

### Context7 (Documentation Lookup)

This project has [Context7](https://context7.com) configured as a remote MCP server for real-time documentation lookups. It is defined in `opencode.jsonc`.

**When to use Context7:**
- Looking up **vue-i18n** API (`useI18n`, `t()`, pluralization, interpolation)
- Looking up **Vue 3** Composition API patterns (`ref`, `computed`, `watch`, lifecycle)
- Looking up **Tailwind CSS** utility classes and responsive design patterns
- Looking up **Vite** configuration and plugin API
- Looking up **AJV** JSON Schema validation API
- Looking up **lucide-vue-next** icon names and usage

**When NOT to use Context7:**
- For project-specific patterns -- read the actual source files instead
- For information already in AGENTS.md, non-negotiable.md, or architecture.md
- For simple questions that don't need documentation lookup

---

## Skills

Skills live in `.agents/skills/` and provide specialized workflows. There are **13 skills** available: 3 custom (project-specific) and 10 installed from community sources.

### Custom Skills (Project-Specific)

#### `add-tool`
**When to load:** Any task that adds a new developer tool to the suite.
**What it does:** Step-by-step checklist for adding a tool: creating the view, registering the route, updating the navigation, updating the Home page, and ensuring design consistency.
**This is the most common task for this project.** See `.agents/skills/add-tool/SKILL.md` for the complete workflow.
**Key steps:** Create view -> Register route in `main.js` -> Add to `tools` array in `App.vue` -> Add bento card in `Home.vue` -> Add i18n keys -> Verify build.

#### `i18n-translation`
**When to load:** Any task involving internationalization, adding languages, or translating UI strings.
**What it does:** Systematic workflow for achieving 100% i18n coverage using `vue-i18n`. Covers string extraction, namespace organization, component migration, and validation.
**Key details specific to this project:**
- Uses `vue-i18n` (not i18next) -- already installed and configured
- Base language is Spanish (es), secondary is English (en) -- both fully translated
- All views now use Composition API with `useI18n()` / `t()`
- Translation files are in `src/i18n/locales/{lang}.json` (~900+ keys each)
- Language switcher in App.vue header, locale persisted in `localStorage`

#### `worktree-parallel-agents`
**When to load:** Tasks that can be parallelized (adding multiple tools, bulk i18n, cross-cutting audits), or when the user requests worktree-based development.
**What it does:** Comprehensive workflow for git worktree management and parallel subagent orchestration. Covers worktree lifecycle, branch strategy, subagent delegation patterns, conflict prevention, and merge workflows.
**Key concepts:**
- **Worktrees** provide full file isolation per feature branch
- **Subagents** (`general` for read-write, `explore` for read-only) execute independent tasks in parallel
- The **primary agent orchestrates**: creates worktrees, delegates to subagents, merges results, resolves conflicts
- **Conflict prevention**: subagents working in parallel must NOT modify the same files unless using separate worktrees
- **Context7 integration**: subagents can use `context7` tools for documentation lookups

### Installed Skills (Community)

#### `vue-best-practices`
**Source:** `antfu/skills` | **When to load:** Any task that creates or modifies `.vue` files.
**What it does:** Enforces Vue 3 Composition API patterns, SFC structure, reactivity best practices, component boundaries, and data flow contracts.
**Key rules:**
- Use `<script setup>` for all new components
- Keep SFC order: `<script>` -> `<template>` -> `<style>`
- Split components with 3+ distinct UI sections
- Props down, events up
- Extract reusable logic into composables (`src/composables/useXxx.js`)

#### `vue`
**Source:** `antfu/skills` | **When to load:** General Vue 3 reference for core API patterns.
**What it does:** Vue 3 core framework reference covering reactivity, components, composables, and lifecycle hooks.

#### `vue-debug-guides`
**Source:** `hyf0/vue-skills` | **When to load:** Diagnosing or fixing Vue runtime errors, reactivity bugs, watcher issues, SSR/hydration problems.
**What it does:** Debugging reference for reactivity tracing, ref/reactive gotchas, computed side effects, watcher pitfalls, template ref issues, and lifecycle errors.

#### `vite`
**Source:** `antfu/skills` | **When to load:** Modifying `vite.config.js`, adding plugins, optimizing builds, or troubleshooting Vite.
**What it does:** Vite build tool configuration, plugin API, HMR, and environment handling. Based on Vite 8 beta (Rolldown-powered).

#### `tailwind-css-patterns`
**Source:** `giuseppe-trisciuoglio/developer-kit` | **When to load:** Complex Tailwind layouts, responsive design patterns, or utility composition.
**What it does:** Comprehensive Tailwind CSS utility-first styling patterns including responsive design, flexbox, grid, spacing, typography, colors, and dark mode.

#### `accessibility`
**Source:** `addyosmani/web-quality-skills` | **When to load:** Accessibility audits, WCAG compliance, screen reader support, keyboard navigation.
**What it does:** WCAG 2.2 guidelines covering POUR principles (Perceivable, Operable, Understandable, Robust), semantic HTML, ARIA patterns, color contrast, and focus management.

#### `seo`
**Source:** `addyosmani/web-quality-skills` | **When to load:** SEO optimization, meta tags, structured data, or performance audits.
**What it does:** SEO best practices for web applications including meta tags, Open Graph, structured data, and Core Web Vitals.

#### `frontend-design`
**Source:** `anthropics/skills` | **When to load:** Designing distinctive, production-grade interfaces or improving visual design quality.
**What it does:** Guides creation of polished frontend interfaces with intentional aesthetic direction. Covers typography, color theory, spacing, and creative design choices.

#### `nodejs-best-practices`
**Source:** `sickn33/antigravity-awesome-skills` | **When to load:** Node.js architecture decisions, framework selection, async patterns. (Reference only -- this project is frontend-only.)
**What it does:** Node.js development principles and decision-making for framework selection, async patterns, security, and architecture.

#### `nodejs-backend-patterns`
**Source:** `wshobson/agents` | **When to load:** Building backend services. (Reference only -- this project is frontend-only.)
**What it does:** Production-ready Node.js backend patterns with Express/Fastify, middleware, authentication, and API design.

---

## Agent Configuration

This project defines custom agents in `opencode.jsonc` alongside the MCP configuration. These agents complement the built-in agents (Build, Plan) with project-specific behavior.

### Primary Agents (Built-in + Customized)

| Agent | Mode | Purpose |
|-------|------|---------|
| `build` | Primary | Default agent with full tool access. Use for all coding tasks. |
| `plan` | Primary | Read-only analysis agent. Cannot modify files. Use for architecture review, planning, and implementation strategies. Switch with **Tab**. |

### Custom Subagents (Project-Specific)

These are defined in `opencode.jsonc` and can be invoked via `@mention` or automatically by the primary agent.

| Agent | Mode | Purpose |
|-------|------|---------|
| `orchestrator` | Subagent | Worktree and parallel task coordinator. Creates worktrees, delegates to other subagents, merges branches, resolves conflicts in shared files. |
| `reviewer` | Subagent | Read-only code auditor. Reviews Vue components for best practices, a11y, i18n, dark mode, and responsiveness. Cannot modify files. |
| `tool-builder` | Subagent | Specialized tool creator. Follows the `add-tool` skill to create complete, self-contained Vue 3 tool views with all integrations. |

### When to Use Each Agent

```
Need to code something?
  -> Use build (default, Tab to switch)

Need to plan or analyze without making changes?
  -> Use plan (Tab to switch)

Need to add multiple tools in parallel?
  -> @orchestrator (creates worktrees, delegates to tool-builder agents)

Need a code quality audit?
  -> @reviewer (reads and reports, never modifies)

Need to add a single new tool?
  -> @tool-builder (follows add-tool skill end-to-end)
```

---

## Subagent Strategy

OpenCode provides built-in subagent types plus the custom agents above. All can be invoked via the Task tool:

| Subagent | Type | Capabilities | Use For |
|----------|------|-------------|---------|
| `general` | Built-in | All tools (read, write, edit, bash, glob, grep, webfetch) | Multi-step tasks, file creation/modification, running builds |
| `explore` | Built-in | Read, grep, glob only | Codebase research, finding patterns, answering questions |
| `orchestrator` | Custom | All tools + task delegation | Worktree management, parallel coordination |
| `reviewer` | Custom | Read-only + limited bash (git, build) | Code audits, quality checks |
| `tool-builder` | Custom | All tools + skill loading | Creating new devtools views end-to-end |

### When to Use Subagents

- **Research phase:** Launch parallel `explore` agents to gather context from different parts of the codebase
- **Single tool addition:** Invoke `@tool-builder` to handle the full add-tool workflow
- **Multiple tool additions:** Invoke `@orchestrator` to parallelize via worktrees, delegating to `tool-builder` agents
- **Code audit:** Invoke `@reviewer` to check quality without risk of file modifications
- **Independent file creation:** Launch parallel `general` agents to create separate `.vue` files
- **Bulk migrations:** Launch parallel `general` agents to migrate different views (one per agent)
- **Cross-cutting audits:** Launch parallel `explore` agents to audit all views, then fix sequentially

### Subagent Rules for This Project

1. **Never assign the same file to multiple parallel subagents** -- this causes conflicts
2. **Shared files** (`main.js`, `App.vue`, `Home.vue`, `es.json`, `en.json`) are updated by the **primary agent only** (or `orchestrator`) after all subagents complete
3. **Each subagent prompt must be self-contained** -- include all context needed
4. **Specify exact files** to read/modify and what NOT to touch
5. **Request structured output** -- ask subagents to return lists, keys, or summaries
6. **For full file isolation**, use git worktrees (see `worktree-parallel-agents` skill)

### Parallelization Decision Tree

```
Is the task a single file change?
  YES -> Do it directly. No parallelization needed.
  NO  -> Are the changes in independent files?
    YES -> Can the files be grouped into non-overlapping sets?
      YES -> Launch parallel subagents (one per group)
      NO  -> Use worktrees for full isolation (@orchestrator)
    NO  -> Execute sequentially
```

---

## Coding Standards

### Vue Components
- **All components** use Composition API with `<script setup>` (fully migrated)
- **Shared component:** `LineNumberedTextarea.vue` is the only shared component. Use it for any multi-line code/text input.
- **Icons:** All icons use `lucide-vue-next`. No emojis, no inline SVGs, no render function icon components.

### Styling
- **Framework:** Tailwind CSS 3 with custom `@layer components` classes
- **Custom classes:** Use `card`, `btn-primary`, `btn-secondary`, `input-field`, `textarea-field`, `checkbox`, `radio`, `result-display` from `src/style.css`
- **Brand colors:** All in `tailwind.config.js` under `brand-*` namespace:
  - Blue: `brand-blue` (#3d6494), `-dark` (#2d4a6e), `-light` (#5a82b4), `-lighter` (#8aaac8), `-lightest` (#c8daea)
  - Orange: `brand-orange` (#d4845a), `-dark` (#bc6e46), `-vivid` (#e8621a), `-light` (#e0a07a), `-lighter` (#ecc4a8)
  - Muted: `brand-muted` (#7a8fa6), `-light` (#a0b4c4), `-dark` (#2c3a4a)
  - Night (dark mode surfaces): `night-bg` (#1a2332), `night-card` (#243044), `night-card-inner` (#2c3a52), `night-border` (#334466)
- **Dark mode:** Use Tailwind `dark:` prefix. Dark mode is class-based (`darkMode: 'class'`).
- **Backgrounds:** Light = `bg-gray-50`, Dark = `bg-gray-950`
- **No emojis in code/comments** unless the user explicitly requests them.

### Navigation
- Tool list is data-driven from the `tools` array in `App.vue`
- When adding a tool, update: `tools` array in `App.vue`, routes in `main.js`, cards in `Home.vue`

### Dependencies
- **Minimize external deps.** Runtime deps are `ajv` family (JSON Schema), `vue-i18n` (translations), and `lucide-vue-next` (icons). All tools use native browser APIs (Web Crypto, Clipboard, FileReader, URL, btoa/atob, etc.).
- **No state management library.** Each view is self-contained.
- **No UI component library.** All UI is custom Tailwind.

| Task | Skill to Load | Key Files |
|------|--------------|-----------|
| Add new tool | `add-tool` | `main.js`, `App.vue`, `Home.vue`, new `views/Xxx.vue` |
| Add multiple tools at once | `add-tool` + `worktree-parallel-agents` | All tool files + shared files |
| Modify existing tool | `vue-best-practices` | `src/views/Xxx.vue` |
| Change navigation/layout | `vue-best-practices` | `src/App.vue`, `src/style.css` |
| Add i18n / new language | `i18n-translation` | `src/i18n/`, all `.vue` files |
| Bulk i18n migration | `i18n-translation` + `worktree-parallel-agents` | All views + locale JSONs |
| Accessibility audit | `accessibility` | All `.vue` files |
| Improve UI design | `frontend-design` + `tailwind-css-patterns` | `.vue` files, `style.css` |
| Debug Vue issues | `vue-debug-guides` | Affected `.vue` files |
| Optimize Vite build | `vite` | `vite.config.js` |
| Change color scheme | `tailwind-css-patterns` | `tailwind.config.js`, `src/style.css` |
| SEO improvements | `seo` | `index.html`, `App.vue` |
| Look up library docs | -- (use `context7` MCP) | N/A |

---

## Build & Run

```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run serve        # Serve on port 8080
```

## Verification After Changes

After any code change, always:

1. Run `npm run build` to verify no compilation errors
2. If touching Tailwind classes, check both light and dark mode visually
3. If adding a route, verify navigation dropdown and mobile menu include it
4. If modifying a view, verify it works independently (each view is self-contained)
5. If using worktrees, verify build succeeds in each worktree before merging
6. After merging worktrees, run `npm run build` again in the main working directory
