<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'sql-formatter'
import {
  Database,
  Wand2,
  Minimize2,
  Trash2,
  ClipboardCopy,
  FileText,
  Info,
  CheckCircle
} from 'lucide-vue-next'
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue'

const { t } = useI18n()

const input = ref('')
const output = ref('')
const error = ref('')
const copied = ref(false)
const dialect = ref('sql')
const indentSize = ref(2)

const dialects = [
  { value: 'sql', label: 'SQL (Standard)' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' }
]

const outputStats = computed(() => {
  if (!output.value) return null
  const lines = output.value.split('\n').length
  const chars = output.value.length
  return { lines, chars }
})

function formatSQL() {
  error.value = ''
  if (!input.value.trim()) {
    error.value = t('tools.sqlFormatter.errorEmpty')
    return
  }
  try {
    output.value = format(input.value, {
      language: dialect.value,
      tabWidth: indentSize.value,
      useTabs: false,
      keywordCase: 'upper'
    })
  } catch (e) {
    error.value = t('tools.sqlFormatter.errorFormat') + ': ' + e.message
    output.value = ''
  }
}

function minifySQL() {
  error.value = ''
  if (!input.value.trim()) {
    error.value = t('tools.sqlFormatter.errorEmpty')
    return
  }
  try {
    // Remove single-line comments, multi-line comments, collapse whitespace
    let result = input.value
    result = result.replace(/--[^\n]*/g, '')
    result = result.replace(/\/\*[\s\S]*?\*\//g, '')
    result = result.replace(/\s+/g, ' ')
    result = result.trim()
    output.value = result
  } catch (e) {
    error.value = t('tools.sqlFormatter.errorMinify') + ': ' + e.message
    output.value = ''
  }
}

function clearAll() {
  input.value = ''
  output.value = ''
  error.value = ''
  copied.value = false
}

function loadSample() {
  input.value = `select u.id, u.name, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at >= '2024-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 0 order by total_spent desc limit 50;`
  formatSQL()
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
          <Database class="inline-block w-6 h-6 mr-2" />{{ t('tools.sqlFormatter.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('tools.sqlFormatter.subtitle') }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <!-- Dialect -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.sqlFormatter.dialect') }}</label>
          <select v-model="dialect" class="input-field !w-auto text-sm py-1.5">
            <option v-for="d in dialects" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>

        <!-- Indent -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.sqlFormatter.indent') }}</label>
          <select v-model.number="indentSize" class="input-field !w-auto text-sm py-1.5">
            <option :value="2">2</option>
            <option :value="4">4</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button @click="formatSQL" class="btn-primary flex items-center gap-1.5">
            <Wand2 class="w-4 h-4" /> {{ t('tools.sqlFormatter.formatBtn') }}
          </button>
          <button @click="minifySQL" class="btn-secondary flex items-center gap-1.5">
            <Minimize2 class="w-4 h-4" /> {{ t('tools.sqlFormatter.minifyBtn') }}
          </button>
          <button @click="loadSample" class="btn-secondary flex items-center gap-1.5">
            <FileText class="w-4 h-4" /> {{ t('tools.sqlFormatter.sampleBtn') }}
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

      <!-- Main grid -->
      <div class="grid gap-6 lg:grid-cols-2">

        <!-- Input -->
        <div class="p-6 card">
          <h2 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">
            {{ t('tools.sqlFormatter.inputLabel') }}
          </h2>
          <LineNumberedTextarea
            v-model="input"
            minHeight="20rem"
            :placeholder="t('tools.sqlFormatter.inputPlaceholder')"
          />
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ input.length }} {{ t('common.characters') }}
          </div>
        </div>

        <!-- Output -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('tools.sqlFormatter.outputLabel') }}
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
          <LineNumberedTextarea
            :modelValue="output"
            readonly
            minHeight="20rem"
            :placeholder="t('tools.sqlFormatter.outputPlaceholder')"
          />
          <div v-if="outputStats" class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex gap-4">
            <span>{{ outputStats.lines }} {{ t('tools.sqlFormatter.lines') }}</span>
            <span>{{ outputStats.chars }} {{ t('common.characters') }}</span>
          </div>
        </div>

      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.sqlFormatter.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.sqlFormatter.infoDialectsLabel') }}</div>
            <p class="text-xs">{{ t('tools.sqlFormatter.infoDialects') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.sqlFormatter.infoFormatLabel') }}</div>
            <p class="text-xs">{{ t('tools.sqlFormatter.infoFormat') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.sqlFormatter.infoMinifyLabel') }}</div>
            <p class="text-xs">{{ t('tools.sqlFormatter.infoMinify') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.sqlFormatter.infoPrivacyLabel') }}</div>
            <p class="text-xs">{{ t('tools.sqlFormatter.infoPrivacy') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
