---
name: add-tool
description: >
  Step-by-step workflow for adding a new developer tool to the devtools suite.
  Use this skill whenever the user asks to add a new tool, utility, or converter.
  Covers: creating the view component, registering the route, updating navigation,
  updating the Home page bento grid, and verifying the build. Ensures design
  consistency with existing tools and follows all project conventions.
---

# add-tool: Adding a New Developer Tool

Complete workflow for adding a new tool to the devtools suite. Follow every step in order. Skipping steps will result in broken navigation or inconsistent UI.

## Pre-Flight Checklist

Before starting, verify:

- [ ] Read `non-negotiable.md` for hard rules
- [ ] Understand the tool's purpose and features
- [ ] Confirm the URL slug (e.g., `/my-tool`)
- [ ] Confirm the display name (e.g., "My Tool")
- [ ] Choose an emoji for the tool icon
- [ ] Decide if external dependencies are needed (prefer native APIs)

## Step 1: Create the View Component

Create `src/views/YourToolName.vue` using the Composition API with `<script setup>`.

### Template Structure

Follow the exact layout pattern used by all existing tools:

```vue
<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Tool Name
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Brief description of what this tool does.
        </p>
      </div>

      <!-- Controls (if needed) -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <button @click="doAction" class="btn-primary">Action</button>
        <button @click="clear" class="btn-secondary">Limpiar</button>
      </div>

      <!-- Main content grid -->
      <div class="grid gap-6 lg:grid-cols-2">

        <!-- Input panel -->
        <div class="p-6 card">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Input Title
          </h2>
          <!-- Use textarea-field for text input -->
          <textarea v-model="input" class="textarea-field h-64"
            placeholder="Introduce datos aqui..."></textarea>
          <!-- Or use LineNumberedTextarea for code input -->
          <!-- <LineNumberedTextarea v-model="input" placeholder="..." /> -->
        </div>

        <!-- Output panel -->
        <div class="p-6 card">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Output Title
          </h2>
          <div class="result-display min-h-[16rem]">
            {{ output }}
          </div>
          <button v-if="output" @click="copyToClipboard(output)"
            class="mt-3 btn-secondary">
            Copiar
          </button>
        </div>

      </div>

      <!-- Information section (optional) -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Information
        </h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 class="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              Fact Title
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Explanation text.
            </p>
          </div>
          <!-- More fact cards... -->
        </div>
      </div>

    </div>
  </div>
</template>
```

### Script Structure

```vue
<script setup>
import { ref, computed, watch } from 'vue'
// Only import if the tool needs code input with line numbers:
// import LineNumberedTextarea from '@/components/LineNumberedTextarea.vue'

// --- State ---
const input = ref('')
const output = ref('')
const error = ref('')

// --- Core logic ---
const doAction = () => {
  try {
    error.value = ''
    // Process input...
    output.value = processedResult
  } catch (e) {
    error.value = e.message
  }
}

// --- Utilities ---
const clear = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
</script>
```

### Design Rules

1. **Use custom classes** from `style.css`: `card`, `btn-primary`, `btn-secondary`, `input-field`, `textarea-field`, `result-display`, `checkbox`, `radio`
2. **Dark mode**: Every element needs `dark:` variants. Use `text-gray-900 dark:text-white` for headings, `text-gray-600 dark:text-gray-400` for descriptions.
3. **Brand colors**: Use `brand-blue` for primary actions, `brand-orange` for accents/badges. Never use `brand-orange-vivid` as text color in light mode.
4. **Responsive**: Use `lg:grid-cols-2` for main content. Controls should `flex-wrap`.
5. **Max width**: Always wrap content in `max-w-7xl mx-auto`.
6. **Copy to clipboard**: Every output should have a copy button. Use the pattern above.
7. **Error display**: Show errors with red styling: `bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-300`.
8. **Prefer native APIs**: Use Web Crypto, Clipboard, FileReader, URL, btoa/atob, Intl, etc. Only add npm packages with user approval.

## Step 2: Register the Route

Edit `src/main.js`:

1. Add the import at the top with the other view imports:
   ```javascript
   import YourToolName from "./views/YourToolName.vue";
   ```

2. Add the route to the `routes` array:
   ```javascript
   { path: "/your-tool-slug", component: YourToolName },
   ```

**URL slug conventions:**
- Lowercase, hyphenated: `/json-compare`, `/uuid-generator`
- Match the tool's identity: a "Hash Generator" becomes `/hash-generator`

## Step 3: Update Navigation in App.vue

Edit `src/App.vue`. Add the tool to the `tools` array in the `<script setup>` section:

```javascript
const tools = [
  // ... existing tools ...
  { path: "/your-tool-slug", name: "Your Tool Name", emoji: "\uXXXX" },
];
```

This single array drives **both** the desktop dropdown menu and the mobile navigation menu. No need to edit the template.

**Emoji notes:**
- Use Unicode escape sequences for consistency: `"\uD83D\uDD0D"` instead of literal emoji
- Choose an emoji that represents the tool's function
- Common choices: magnifying glass for search, lock for security, globe for web, etc.

## Step 4: Update the Home Page Bento Grid

Edit `src/views/Home.vue`. Add a card to the bento grid.

### Decide Card Size

| Size | Class | When to Use |
|------|-------|-------------|
| Standard (1x1) | (none) | Most tools |
| Wide (2x1) | `sm:col-span-2` | Tools with longer descriptions, uses horizontal layout |
| Featured (2x2) | `sm:col-span-2 sm:row-span-2` | Reserved for the most important tool (currently JSONLint) |

### Standard Card Template (1x1)

```html
<!-- Your Tool Name Card -->
<router-link to="/your-tool-slug" class="group">
  <div
    class="flex flex-col justify-between h-full p-5 transition-all duration-300 bg-white border border-gray-200 dark:bg-gray-900 rounded-2xl dark:border-gray-800 hover:shadow-lg hover:border-brand-blue/40 dark:hover:border-brand-blue-lighter/30">
    <div>
      <div
        class="flex items-center justify-center w-10 h-10 mb-3 text-lg rounded-lg bg-brand-blue/5 dark:bg-brand-blue/10">
        EMOJI
      </div>
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">Tool Name</h3>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Brief description</p>
    </div>
    <div class="flex flex-wrap gap-1 mt-2">
      <span
        class="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-orange/10 text-brand-orange-dark dark:bg-brand-orange/15 dark:text-brand-orange-light">
        Tag1
      </span>
    </div>
  </div>
</router-link>
```

### Wide Card Template (2x1)

```html
<router-link to="/your-tool-slug" class="group sm:col-span-2">
  <div
    class="flex flex-col justify-between h-full p-5 transition-all duration-300 bg-white border border-gray-200 dark:bg-gray-900 rounded-2xl dark:border-gray-800 hover:shadow-lg hover:border-brand-blue/40 dark:hover:border-brand-blue-lighter/30">
    <div>
      <div class="flex items-center gap-4">
        <div
          class="flex items-center justify-center w-10 h-10 text-lg rounded-lg bg-brand-blue/5 dark:bg-brand-blue/10">
          EMOJI
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Tool Name</h3>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Longer description that takes advantage of the wider card
          </p>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-1.5 mt-3">
      <span
        class="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-orange/10 text-brand-orange-dark dark:bg-brand-orange/15 dark:text-brand-orange-light">
        Tag1
      </span>
      <span
        class="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-orange/10 text-brand-orange-dark dark:bg-brand-orange/15 dark:text-brand-orange-light">
        Tag2
      </span>
    </div>
  </div>
</router-link>
```

### Badge/Tag Rules

- Background: `bg-brand-orange/10` (light), `dark:bg-brand-orange/15` (dark)
- Text: `text-brand-orange-dark` (light), `dark:text-brand-orange-light` (dark)
- Shape: `rounded-full px-2 py-0.5 text-xs font-medium`
- Choose 1-2 tags that describe the tool's key capabilities

### Card Placement

Insert the card in a logical position within the grid. Group related tools:

1. **JSON tools** (JSONLint, Schema Validator, JSON Compare) - first
2. **Generators** (UUID, Password) - middle
3. **Converters** (Timestamp, Base64, URL) - middle
4. **Specialized** (Color Palette, PHP Serializer) - end
5. **New tools** - at the end unless they fit a category

## Step 5: Update Home.vue Tool Count

The `tools` array in `Home.vue` is used for the hero subtitle count. Update it to include the new tool name:

```javascript
const tools = [
  // ... existing tools ...
  "Your Tool Name",
];
```

## Step 6: Verify the Build

```bash
npm run build
```

The build MUST succeed. If it fails, fix all errors before continuing.

## Step 7: Manual Verification Checklist

After the build succeeds, verify:

- [ ] **Route works:** Navigate to `/your-tool-slug` directly
- [ ] **Desktop dropdown:** Tool appears in the "Herramientas" dropdown
- [ ] **Mobile menu:** Tool appears in the mobile hamburger menu
- [ ] **Home page card:** Card appears in the bento grid
- [ ] **Home page link:** Card links to the correct route
- [ ] **Light mode:** All elements are visible and properly styled
- [ ] **Dark mode:** All elements are visible and properly styled
- [ ] **Active state:** Dropdown highlights when on the tool's route
- [ ] **Tool functionality:** Core features work correctly
- [ ] **Copy buttons:** Clipboard copying works
- [ ] **Error handling:** Invalid input shows proper error messages
- [ ] **Mobile layout:** Tool is usable on small screens

## Quick Reference: Files to Edit

| File | Action |
|------|--------|
| `src/views/YourTool.vue` | **Create** new view component |
| `src/main.js` | Add import + route |
| `src/App.vue` | Add to `tools` array |
| `src/views/Home.vue` | Add bento grid card + update `tools` array |

**All four files must be updated for a complete tool addition.**

## Common Patterns by Tool Type

### Text Processor (encode/decode/convert)

Two-panel layout: Input left, Output right.

```
Controls: [Process] [Clear] [Load Sample]
Grid: Input textarea | Output textarea (readonly) + Copy button
Optional: Info section with 4 fact cards
```

Examples: Base64Converter, URLConverter, PHPSerializer

### Generator (UUID, password, hash)

Config panel + Output panel.

```
Grid (3-col): Config (1 col) | Generated output (2 cols)
Config: Options, checkboxes, dropdowns
Output: Generated values list, copy buttons, batch support
```

Examples: UUIDGenerator, PasswordGenerator

### Validator/Analyzer (JSON lint, schema)

Input + Results layout.

```
Controls: [Validate] [Format] [Clear] [Examples dropdown]
Grid: Input editor (LineNumberedTextarea) | Results panel
Results: Success/error badges, error details, statistics
```

Examples: JSONLint, JSONSchemaValidator

### Side-by-Side Comparator

Two inputs + Diff output.

```
Controls: [Compare] [Format] [Clear] [Swap]
Edit mode: Left input | Right input
Diff mode: Stats bar + Side-by-side diff display
```

Examples: JSONCompare

## Troubleshooting

### Tool doesn't appear in dropdown
Check that you added it to the `tools` array in `App.vue` `<script setup>`.

### Route shows blank page
Check the import in `main.js` and the path in the `routes` array.

### Card doesn't appear on Home page
Check that you added a `<router-link>` card in `Home.vue`.

### Styles look wrong in production
Tailwind purges unused classes. Make sure dynamic classes are written as complete strings, not concatenated.

### Build fails
Check for syntax errors in the new `.vue` file. Common issues: unclosed tags, missing imports, template syntax errors.
