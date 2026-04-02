# Non-Negotiable Rules

> Hard rules for this project. Violations break the project or the user's trust.
> Every agent MUST read this file before writing any code.

## 1. Brand Identity

- **Title:** `</devTools>` -- always rendered in `font-mono`, always as `&lt;/devTools&gt;` in HTML
- **No logo image** in the header. Only the text title.
- **Color palette** (defined in `tailwind.config.js`):
  - Primary: dark blue (`brand-blue: #2d4a6e`)
  - Accent: warm orange (`brand-orange: #d4845a`)
  - **Never use `brand-orange-vivid` (#e8621a) as text color in light mode.** It was explicitly rejected.
- **Badge colors:** Orange-themed. In dark mode, badge text MUST be readable (use `text-brand-orange-light` or `dark:text-white`).

## 2. Privacy and Offline-First

- **Zero external API calls** from the application. All processing is client-side.
- **No telemetry**, no analytics, no tracking scripts.
- **No CDN dependencies** at runtime. All assets are bundled or served locally (Inter font loads from `/fonts/inter.css`).
- The only acceptable external dependency is npm packages installed at build time.

## 3. Dark Mode Support

- **Every UI element** must work in both light and dark mode.
- Dark mode is class-based (`darkMode: 'class'` in Tailwind config).
- The user's system preference is respected on first visit (`prefers-color-scheme`).
- Choice is persisted in `localStorage` under the key `theme`.
- **Never remove** the dark mode toggle from the navigation.

## 4. Mobile Responsiveness

- **Every page** must be usable on mobile devices.
- The mobile hamburger menu must always be preserved.
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) consistently.
- Navigation must collapse to mobile menu at the `md` breakpoint.

## 5. Vue Composition API

- **All components** use `<script setup>` (Composition API). The migration is complete.
- **Do not mix** Options API and Composition API within the same component.
- **SFC order:** `<script>` -> `<template>` -> `<style>` (if any).

## 6. Minimal Dependencies

- Do not add npm packages without explicit user approval.
- Prefer native browser APIs (Web Crypto, Clipboard, FileReader, URL, btoa/atob, Intl) over external libraries.
- The only heavy dependency is `ajv` (JSON Schema validation). Everything else is vanilla.

## 7. Self-Contained Views

- Each tool view is **fully self-contained** -- all logic lives within the view file.
- **No shared state management** (no Vuex, no Pinia). Each view manages its own state.
- The only shared component is `LineNumberedTextarea.vue`. Do not create shared state providers.

## 8. Route Registration

When adding a new tool, **all three locations** must be updated together:

1. `src/main.js` -- Add the route
2. `src/App.vue` -- Add to the `tools` array (navigation dropdown + mobile menu)
3. `src/views/Home.vue` -- Add a card to the bento grid

Missing any of these creates a broken navigation state.

## 9. Build Verification

- **Never commit** code that fails `npm run build`.
- After any change, verify the build succeeds.
- Tailwind purges unused classes in production -- verify custom classes are actually applied.

## 10. Language and Locale

- The UI is **bilingual** — Spanish (es) and English (en), auto-detected from browser locale.
- If the browser locale starts with `es`, default to Spanish; otherwise English.
- If `localStorage.getItem('locale')` exists, use that override. Persist manual language choice.
- Tool names may use English technical terms (JSONLint, UUID Generator, Base64, etc.) — this is intentional.
- Do not translate technical terms unless the user asks.
- All user-facing strings MUST use `vue-i18n` `t()` calls — no hardcoded strings in templates.

## 11. No Secrets in Version Control

- `opencode.jsonc` contains an API key. **Never commit API keys.** If creating a new config that requires secrets, use environment variables or `.env` files (already in `.gitignore`).
- Always check `.gitignore` before adding new config files.

## 12. Netlify Deployment

- The project deploys to **Netlify** via Git integration (not Docker, not GitHub Actions).
- Build configuration lives in `netlify.toml` at the project root. Do not delete it.
- The `[[redirects]]` rule (`/* -> /index.html 200`) is **required** for Vue Router history mode. Never remove it.
- Node version is pinned to **22** in `netlify.toml`. Do not downgrade without explicit user approval.
- There is no Dockerfile, no nginx config, and no CI/CD pipeline. Netlify handles all of this.
