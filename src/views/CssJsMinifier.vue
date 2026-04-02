<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Code2,
  Minimize2,
  Wand2,
  Trash2,
  ClipboardCopy,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-vue-next'
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue'

const { t } = useI18n()

const language = ref('css')
const input = ref('')
const output = ref('')
const error = ref('')
const loading = ref(false)
const copied = ref(false)

const inputSizeBytes = computed(() => new Blob([input.value]).size)
const outputSizeBytes = computed(() => new Blob([output.value]).size)
const sizeDiff = computed(() => {
  if (!input.value || !output.value) return null
  const diff = outputSizeBytes.value - inputSizeBytes.value
  const pct = inputSizeBytes.value > 0 ? Math.round((diff / inputSizeBytes.value) * 100) : 0
  return { diff, pct }
})

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  return (bytes / 1024).toFixed(1) + ' KB'
}

// ── Basic CSS beautifier ──────────────────────────────────────────────────────
function formatCss(css) {
  let result = ''
  let indent = 0
  // Normalize whitespace
  const tokens = css
    .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' {\n')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/;\s*/g, ';\n')
    .split('\n')

  for (let line of tokens) {
    line = line.trim()
    if (!line) continue
    if (line.startsWith('}')) indent = Math.max(0, indent - 1)
    result += '  '.repeat(indent) + line + '\n'
    if (line.endsWith('{')) indent++
  }
  return result.trim()
}

// ── Basic JS beautifier ───────────────────────────────────────────────────────
function formatJs(js) {
  let result = ''
  let indent = 0
  const tokens = js
    .replace(/\/\*[\s\S]*?\*\//g, '') // strip block comments
    .replace(/\/\/[^\n]*/g, '')        // strip line comments
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' {\n')
    .replace(/\s*}\s*/g, '\n}\n')
    .replace(/;\s*/g, ';\n')
    .split('\n')

  for (let line of tokens) {
    line = line.trim()
    if (!line) continue
    if (line.startsWith('}')) indent = Math.max(0, indent - 1)
    result += '  '.repeat(indent) + line + '\n'
    if (line.endsWith('{')) indent++
  }
  return result.trim()
}

function formatCode() {
  error.value = ''
  if (!input.value.trim()) {
    error.value = t('tools.cssJsMinifier.errorEmpty')
    return
  }
  loading.value = true
  output.value = ''
  try {
    output.value = language.value === 'css'
      ? formatCss(input.value)
      : formatJs(input.value)
  } catch (e) {
    error.value = t('tools.cssJsMinifier.errorFormat') + ': ' + e.message
  } finally {
    loading.value = false
  }
}

function minifyCode() {
  error.value = ''
  if (!input.value.trim()) {
    error.value = t('tools.cssJsMinifier.errorEmpty')
    return
  }
  try {
    let result = input.value

    if (language.value === 'js') {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '')
      result = result.replace(/\/\/[^\n]*/g, '')
    } else {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '')
    }

    result = result.replace(/\s+/g, ' ')

    if (language.value === 'css') {
      result = result.replace(/\s*([{};:,>~+])\s*/g, '$1')
      result = result.replace(/;}/g, '}')
    } else {
      result = result.replace(/\s*([{}();,])\s*/g, '$1')
    }

    output.value = result.trim()
  } catch (e) {
    error.value = t('tools.cssJsMinifier.errorMinify') + ': ' + e.message
  }
}

function clearAll() {
  input.value = ''
  output.value = ''
  error.value = ''
  copied.value = false
}

function loadSample() {
  if (language.value === 'css') {
    input.value = `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  margin: 0 auto;
  max-width: 1200px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}`
  } else {
    input.value = `// Utility function to debounce expensive operations
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}`
  }
}

async function copyToClipboard() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = output.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          <Code2 class="inline-block w-6 h-6 mr-2" />{{ t('tools.cssJsMinifier.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('tools.cssJsMinifier.subtitle') }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <!-- Language selector -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.cssJsMinifier.languageLabel') }}</label>
          <div class="flex rounded-lg overflow-hidden border border-gray-300 dark:border-night-border">
            <button
              @click="language = 'css'; output = ''; error = ''"
              :class="language === 'css'
                ? 'bg-brand-blue text-white'
                : 'bg-white dark:bg-night-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-card-inner'"
              class="px-4 py-2 text-sm font-medium transition-colors"
            >CSS</button>
            <button
              @click="language = 'js'; output = ''; error = ''"
              :class="language === 'js'
                ? 'bg-brand-blue text-white'
                : 'bg-white dark:bg-night-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-night-card-inner'"
              class="px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-night-border"
            >JavaScript</button>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="formatCode" :disabled="loading" class="btn-primary flex items-center gap-1.5">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Wand2 v-else class="w-4 h-4" />
            {{ t('tools.cssJsMinifier.formatBtn') }}
          </button>
          <button @click="minifyCode" :disabled="loading" class="btn-secondary flex items-center gap-1.5">
            <Minimize2 class="w-4 h-4" /> {{ t('tools.cssJsMinifier.minifyBtn') }}
          </button>
          <button @click="loadSample" class="btn-secondary flex items-center gap-1.5">
            <Code2 class="w-4 h-4" /> {{ t('tools.cssJsMinifier.sampleBtn') }}
          </button>
          <button @click="clearAll" class="btn-secondary flex items-center gap-1.5">
            <Trash2 class="w-4 h-4" /> {{ t('common.clear') }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300 text-sm">
        {{ error }}
      </div>

      <!-- Size comparison -->
      <div v-if="output && sizeDiff" class="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner border border-gray-200 dark:border-night-border flex flex-wrap gap-4 text-sm">
        <span class="text-gray-700 dark:text-gray-300">
          {{ t('tools.cssJsMinifier.inputSize') }}: <strong>{{ formatBytes(inputSizeBytes) }}</strong>
        </span>
        <span class="text-gray-700 dark:text-gray-300">
          {{ t('tools.cssJsMinifier.outputSize') }}: <strong>{{ formatBytes(outputSizeBytes) }}</strong>
        </span>
        <span :class="sizeDiff.diff <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
          {{ sizeDiff.diff <= 0 ? '▼' : '▲' }} {{ Math.abs(sizeDiff.pct) }}%
          {{ sizeDiff.diff <= 0 ? t('tools.cssJsMinifier.smaller') : t('tools.cssJsMinifier.larger') }}
        </span>
      </div>

      <!-- Main grid -->
      <div class="grid gap-6 lg:grid-cols-2">

        <!-- Input -->
        <div class="p-6 card">
          <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">
            {{ t('tools.cssJsMinifier.inputLabel') }}
          </h2>
          <LineNumberedTextarea
            v-model="input"
            minHeight="24rem"
            :placeholder="language === 'css' ? t('tools.cssJsMinifier.cssPlaceholder') : t('tools.cssJsMinifier.jsPlaceholder')"
          />
        </div>

        <!-- Output -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('tools.cssJsMinifier.outputLabel') }}
            </h2>
            <button
              v-if="output"
              @click="copyToClipboard"
              class="btn-secondary flex items-center gap-1.5"
            >
              <CheckCircle v-if="copied" class="w-4 h-4 text-green-400" />
              <ClipboardCopy v-else class="w-4 h-4" />
              {{ copied ? t('common.copied') : t('common.copy') }}
            </button>
          </div>

          <div v-if="loading" class="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Loader2 class="w-6 h-6 animate-spin mr-2" />
            {{ t('tools.cssJsMinifier.formatting') }}
          </div>
          <LineNumberedTextarea
            v-else
            :modelValue="output"
            readonly
            minHeight="24rem"
            :placeholder="t('tools.cssJsMinifier.outputPlaceholder')"
          />
        </div>

      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.cssJsMinifier.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-3">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.cssJsMinifier.infoFormatLabel') }}</div>
            <p class="text-xs">{{ t('tools.cssJsMinifier.infoFormat') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.cssJsMinifier.infoMinifyLabel') }}</div>
            <p class="text-xs">{{ t('tools.cssJsMinifier.infoMinify') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.cssJsMinifier.infoPrivacyLabel') }}</div>
            <p class="text-xs">{{ t('tools.cssJsMinifier.infoPrivacy') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
