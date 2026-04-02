<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import {
  FileText,
  Eye,
  Columns,
  ClipboardCopy,
  Download,
  CheckCircle,
  Info
} from 'lucide-vue-next'
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue'

const { t } = useI18n()

const SAMPLE_MD = `# Welcome to Markdown Preview

This is a **live preview** editor. Write Markdown on the left and see the result on the right.

## Features

- Real-time preview
- Copy rendered HTML
- Download as \`.md\` file
- *Italic*, **bold**, and \`inline code\`

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

## Blockquote

> "The best tool is the one you actually use."

## Links and more

Visit [example.com](https://example.com) for more info.

1. First item
2. Second item
3. Third item

---

That's it! Start writing your own Markdown above.
`

const content = ref(SAMPLE_MD)
const viewMode = ref('split') // 'editor' | 'split' | 'preview'
const copiedHtml = ref(false)

const renderedHtml = computed(() => {
  try {
    return marked(content.value || '', { breaks: true, gfm: true })
  } catch {
    return ''
  }
})

const VIEW_MODES = ['editor', 'split', 'preview']

function copyHtml() {
  navigator.clipboard.writeText(renderedHtml.value).catch(() => {
    const el = document.createElement('textarea')
    el.value = renderedHtml.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
  copiedHtml.value = true
  setTimeout(() => { copiedHtml.value = false }, 1500)
}

function downloadMd() {
  const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.md'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-6 text-center">
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          <FileText class="inline-block w-6 h-6 mr-2 text-brand-orange" />
          {{ t('tools.markdownPreview.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('tools.markdownPreview.subtitle') }}
        </p>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <!-- View mode toggle -->
        <div class="flex rounded-lg border border-gray-300 dark:border-night-border overflow-hidden">
          <button
            v-for="mode in VIEW_MODES"
            :key="mode"
            @click="viewMode = mode"
            class="px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5"
            :class="viewMode === mode
              ? 'bg-brand-blue text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-night-card-inner'"
          >
            <Eye v-if="mode === 'preview'" class="w-3.5 h-3.5" />
            <Columns v-else-if="mode === 'split'" class="w-3.5 h-3.5" />
            <FileText v-else class="w-3.5 h-3.5" />
            {{ t(`tools.markdownPreview.mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`) }}
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button @click="copyHtml" class="btn-secondary flex items-center gap-1.5">
            <CheckCircle v-if="copiedHtml" class="w-4 h-4 text-green-500" />
            <ClipboardCopy v-else class="w-4 h-4" />
            {{ t('tools.markdownPreview.copyHtml') }}
          </button>
          <button @click="downloadMd" class="btn-secondary flex items-center gap-1.5">
            <Download class="w-4 h-4" />
            {{ t('tools.markdownPreview.downloadMd') }}
          </button>
        </div>
      </div>

      <!-- Editor / Preview panels -->
      <div
        class="grid gap-4"
        :class="{
          'lg:grid-cols-2': viewMode === 'split',
          'grid-cols-1': viewMode !== 'split'
        }"
      >
        <!-- Editor -->
        <div v-show="viewMode === 'editor' || viewMode === 'split'" class="p-4 card flex flex-col">
          <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.markdownPreview.editorLabel') }}
          </div>
          <LineNumberedTextarea
            v-model="content"
            minHeight="520px"
            :placeholder="t('tools.markdownPreview.editorPlaceholder')"
            :spellcheck="false"
          />
        </div>

        <!-- Preview -->
        <div v-show="viewMode === 'preview' || viewMode === 'split'" class="p-4 card overflow-auto">
          <div class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.markdownPreview.previewLabel') }}
          </div>
          <div
            class="prose-content text-gray-900 dark:text-gray-100"
            style="min-height: 520px"
            v-html="renderedHtml"
          ></div>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.markdownPreview.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.markdownPreview.infoSyntaxLabel') }}</div>
            <p class="text-xs">{{ t('tools.markdownPreview.infoSyntax') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.markdownPreview.infoListsLabel') }}</div>
            <p class="text-xs">{{ t('tools.markdownPreview.infoLists') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.markdownPreview.infoGfmLabel') }}</div>
            <p class="text-xs">{{ t('tools.markdownPreview.infoGfm') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.markdownPreview.infoExportLabel') }}</div>
            <p class="text-xs">{{ t('tools.markdownPreview.infoExport') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
.prose-content h1,
.prose-content h2,
.prose-content h3,
.prose-content h4 {
  font-weight: bold;
  margin: 0.75em 0 0.4em;
  line-height: 1.3;
}
.prose-content h1 { font-size: 1.6em; }
.prose-content h2 { font-size: 1.3em; }
.prose-content h3 { font-size: 1.1em; }
.prose-content p { margin: 0.6em 0; line-height: 1.65; }
.prose-content ul,
.prose-content ol { padding-left: 1.5em; margin: 0.5em 0; }
.prose-content li { margin: 0.2em 0; }
.prose-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.88em;
  background: rgba(0, 0, 0, 0.07);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
.dark .prose-content code {
  background: rgba(255, 255, 255, 0.1);
}
.prose-content pre {
  background: rgba(0, 0, 0, 0.06);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75em 0;
}
.dark .prose-content pre {
  background: rgba(255, 255, 255, 0.06);
}
.prose-content pre code {
  background: none;
  padding: 0;
  font-size: 0.875em;
}
.prose-content blockquote {
  border-left: 3px solid #d4845a;
  padding-left: 1em;
  color: #6b7280;
  margin: 0.75em 0;
  font-style: italic;
}
.dark .prose-content blockquote { color: #9ca3af; }
.prose-content a { color: #2d4a6e; text-decoration: underline; }
.dark .prose-content a { color: #93b4d4; }
.prose-content hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.25em 0;
}
.dark .prose-content hr { border-color: #374151; }
.prose-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75em 0;
}
.prose-content th,
.prose-content td {
  border: 1px solid #e5e7eb;
  padding: 0.4em 0.75em;
  text-align: left;
}
.dark .prose-content th,
.dark .prose-content td { border-color: #374151; }
.prose-content th { background: rgba(0,0,0,0.04); font-weight: 600; }
.dark .prose-content th { background: rgba(255,255,255,0.05); }
</style>
