<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ClipboardCopy,
  Info
} from 'lucide-vue-next'

const { t } = useI18n()

// ── State ─────────────────────────────────────────────────────────────────────
const expression = ref('* * * * *')
const error = ref('')
const description = ref('')
const nextDates = ref([])

// Visual builder fields: minute, hour, dom, month, dow
const fields = ref({
  minute: '*',
  hour: '*',
  dom: '*',
  month: '*',
  dow: '*'
})

// Sync expression → fields
watch(expression, (val) => {
  const parts = val.trim().split(/\s+/)
  if (parts.length === 5) {
    fields.value.minute = parts[0]
    fields.value.hour   = parts[1]
    fields.value.dom    = parts[2]
    fields.value.month  = parts[3]
    fields.value.dow    = parts[4]
  }
  parseExpression()
})

// Sync fields → expression
watch(fields, (val) => {
  expression.value = `${val.minute} ${val.hour} ${val.dom} ${val.month} ${val.dow}`
}, { deep: true })

// ── Quick presets ──────────────────────────────────────────────────────────────
const presets = computed(() => [
  { label: t('tools.cronParser.presetEveryMinute'),   value: '* * * * *'     },
  { label: t('tools.cronParser.presetEveryHour'),     value: '0 * * * *'     },
  { label: t('tools.cronParser.presetDailyMidnight'), value: '0 0 * * *'     },
  { label: t('tools.cronParser.presetWeeklySunday'),  value: '0 0 * * 0'     },
  { label: t('tools.cronParser.presetMonthly'),       value: '0 0 1 * *'     },
  { label: t('tools.cronParser.presetWeekdays'),      value: '0 9 * * 1-5'   }
])

function applyPreset(val) {
  expression.value = val
}

// ── Cron parser helpers ────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = {
  jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12
}
const DOW_NAMES = { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6 }

function replaceNames(value, map) {
  return value.toLowerCase().replace(/[a-z]+/g, (m) => map[m] !== undefined ? String(map[m]) : m)
}

/**
 * Parse a cron field into a sorted array of valid integers.
 * Supports: *, n, n-m, n/step, step-based ranges, lists
 */
function parseField(field, min, max, nameMap) {
  if (nameMap) field = replaceNames(field, nameMap)
  if (field === '*' || field === '?') {
    return range(min, max)
  }
  const values = new Set()
  for (const part of field.split(',')) {
    if (part.includes('/')) {
      const [rangeStr, step] = part.split('/')
      const stepNum = parseInt(step)
      if (isNaN(stepNum) || stepNum < 1) return null
      let start = min
      let end = max
      if (rangeStr !== '*') {
        if (rangeStr.includes('-')) {
          const [a, b] = rangeStr.split('-').map(Number)
          start = a; end = b
        } else {
          start = parseInt(rangeStr)
        }
      }
      for (let i = start; i <= end; i += stepNum) values.add(i)
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      if (isNaN(a) || isNaN(b)) return null
      for (let i = a; i <= b; i++) values.add(i)
    } else {
      const n = parseInt(part)
      if (isNaN(n)) return null
      values.add(n)
    }
  }
  const arr = [...values].sort((a, b) => a - b).filter(n => n >= min && n <= max)
  return arr.length ? arr : null
}

function range(a, b) {
  const r = []
  for (let i = a; i <= b; i++) r.push(i)
  return r
}

function validateExpression(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return { valid: false, error: t('tools.cronParser.error5Fields') }
  const [min, hr, dom, mon, dow] = parts
  if (!parseField(min, 0, 59)) return { valid: false, error: t('tools.cronParser.errorMinute') }
  if (!parseField(hr, 0, 23)) return { valid: false, error: t('tools.cronParser.errorHour') }
  if (!parseField(dom, 1, 31)) return { valid: false, error: t('tools.cronParser.errorDom') }
  if (!parseField(mon, 1, 12, MONTH_NAMES)) return { valid: false, error: t('tools.cronParser.errorMonth') }
  if (!parseField(dow, 0, 7, DOW_NAMES)) return { valid: false, error: t('tools.cronParser.errorDow') }
  return { valid: true }
}

// ── Human-readable description ─────────────────────────────────────────────────
function describeField(field, unit, min, max, names, nameMap) {
  if (nameMap) field = replaceNames(field, nameMap)
  if (field === '*') return t('tools.cronParser.descEvery') + ' ' + unit

  if (field.includes('/')) {
    const [rangeStr, step] = field.split('/')
    if (rangeStr === '*') {
      return t('tools.cronParser.descEveryN', { n: step, unit })
    }
  }

  const vals = parseField(field, min, max, nameMap)
  if (!vals) return field

  if (names) {
    return vals.map(v => names[v] || v).join(', ')
  }
  return vals.join(', ')
}

function buildDescription(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return ''
  const [min, hr, dom, mon, dow] = parts

  const minuteDesc = describeField(min, t('tools.cronParser.unitMinute'), 0, 59, null, null)
  const hourDesc   = describeField(hr,  t('tools.cronParser.unitHour'),   0, 23, null, null)
  const domDesc    = describeField(dom, t('tools.cronParser.unitDom'),     1, 31, null, null)
  const monDesc    = describeField(mon, t('tools.cronParser.unitMonth'),   1, 12, MONTHS, MONTH_NAMES)
  const dowDesc    = describeField(dow, t('tools.cronParser.unitDow'),     0, 6, DAYS, DOW_NAMES)

  // Build sentence
  let desc = ''

  if (min === '*' && hr === '*') {
    desc += t('tools.cronParser.descEveryMinute')
  } else if (min === '0' && hr === '*') {
    desc += t('tools.cronParser.descTopOfHour')
  } else if (min.includes('/')) {
    const step = min.split('/')[1]
    desc += t('tools.cronParser.descEveryNMinutes', { n: step })
  } else {
    desc += t('tools.cronParser.descAtTime', { minute: minuteDesc, hour: hourDesc })
  }

  if (dom !== '*' && dow === '*') {
    desc += ' ' + t('tools.cronParser.descOnDay', { day: domDesc })
  } else if (dow !== '*' && dom === '*') {
    desc += ' ' + t('tools.cronParser.descOnDow', { dow: dowDesc })
  } else if (dow !== '*' && dom !== '*') {
    desc += ' ' + t('tools.cronParser.descOnDayOrDow', { day: domDesc, dow: dowDesc })
  }

  if (mon !== '*') {
    desc += ' ' + t('tools.cronParser.descInMonth', { month: monDesc })
  }

  return desc
}

// ── Next execution dates ───────────────────────────────────────────────────────
function getNextDates(expr, count = 10) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return []
  const [minF, hrF, domF, monF, dowF] = parts

  const minutes = parseField(minF, 0, 59)
  const hours   = parseField(hrF,  0, 23)
  const doms    = parseField(domF, 1, 31)
  const months  = parseField(monF, 1, 12, MONTH_NAMES)
  const dows    = parseField(dowF, 0, 6, DOW_NAMES)

  if (!minutes || !hours || !doms || !months || !dows) return []

  // Normalise 7 → 0 (both mean Sunday)
  const dowSet = new Set(dows.map(d => d === 7 ? 0 : d))
  const domWildcard = domF === '*' || domF === '?'
  const dowWildcard = dowF === '*' || dowF === '?'

  const dates = []
  const now = new Date()
  // Start from the next minute
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0)

  let iterations = 0
  const maxIter = 527040 // 1 year in minutes

  while (dates.length < count && iterations < maxIter) {
    iterations++

    const m = cursor.getMonth() + 1  // 1-12
    const d = cursor.getDate()       // 1-31
    const h = cursor.getHours()
    const min = cursor.getMinutes()
    const wd = cursor.getDay()       // 0-6

    if (!months.includes(m)) {
      // Jump to first day of next matching month
      const nextMonth = months.find(mm => mm > m) || months[0]
      const yearAdd = nextMonth <= m ? 1 : 0
      cursor.setFullYear(cursor.getFullYear() + yearAdd, nextMonth - 1, 1)
      cursor.setHours(0, 0, 0, 0)
      continue
    }

    const domMatch = domWildcard ? true : doms.includes(d)
    const dowMatch = dowWildcard ? true : dowSet.has(wd)
    const dayMatch = (!domWildcard && !dowWildcard) ? (domMatch || dowMatch) : (domMatch && dowMatch)

    if (!dayMatch) {
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(0, 0, 0, 0)
      continue
    }

    if (!hours.includes(h)) {
      const nextHour = hours.find(hh => hh > h)
      if (nextHour !== undefined) {
        cursor.setHours(nextHour, minutes[0], 0, 0)
      } else {
        cursor.setDate(cursor.getDate() + 1)
        cursor.setHours(hours[0], minutes[0], 0, 0)
      }
      continue
    }

    if (!minutes.includes(min)) {
      const nextMin = minutes.find(mm => mm > min)
      if (nextMin !== undefined) {
        cursor.setMinutes(nextMin, 0, 0)
      } else {
        const nextHour = hours.find(hh => hh > h)
        if (nextHour !== undefined) {
          cursor.setHours(nextHour, minutes[0], 0, 0)
        } else {
          cursor.setDate(cursor.getDate() + 1)
          cursor.setHours(hours[0], minutes[0], 0, 0)
        }
      }
      continue
    }

    dates.push(new Date(cursor))
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0)
  }

  return dates
}

function formatDate(d) {
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short'
  })
}

// ── Parse & update ─────────────────────────────────────────────────────────────
function parseExpression() {
  const expr = expression.value.trim()
  if (!expr) {
    error.value = ''
    description.value = ''
    nextDates.value = []
    return
  }

  const validation = validateExpression(expr)
  if (!validation.valid) {
    error.value = validation.error
    description.value = ''
    nextDates.value = []
    return
  }

  error.value = ''
  description.value = buildDescription(expr)
  nextDates.value = getNextDates(expr, 10)
}

// Initial parse
parseExpression()

const copied = ref(false)
async function copyExpression() {
  try {
    await navigator.clipboard.writeText(expression.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = expression.value
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
          <Clock class="inline-block w-6 h-6 mr-2" />{{ t('tools.cronParser.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">{{ t('tools.cronParser.subtitle') }}</p>
      </div>

      <!-- Expression input -->
      <div class="p-6 card mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ t('tools.cronParser.expressionLabel') }}
          </h2>
          <button @click="copyExpression" class="btn-secondary flex items-center gap-1.5">
            <CheckCircle v-if="copied" class="w-4 h-4 text-green-400" />
            <ClipboardCopy v-else class="w-4 h-4" />
            {{ copied ? t('common.copied') : t('common.copy') }}
          </button>
        </div>

        <input
          v-model="expression"
          type="text"
          class="input-field font-mono text-lg tracking-widest mb-3"
          :placeholder="t('tools.cronParser.expressionPlaceholder')"
          spellcheck="false"
        />

        <!-- Field labels -->
        <div class="grid grid-cols-5 gap-2 text-xs text-center text-gray-500 dark:text-gray-400 mb-4 font-mono">
          <div>{{ t('tools.cronParser.fieldMinute') }}</div>
          <div>{{ t('tools.cronParser.fieldHour') }}</div>
          <div>{{ t('tools.cronParser.fieldDom') }}</div>
          <div>{{ t('tools.cronParser.fieldMonth') }}</div>
          <div>{{ t('tools.cronParser.fieldDow') }}</div>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300 text-sm">
          <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
          {{ error }}
        </div>

        <!-- Description -->
        <div v-if="description && !error" class="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-300 text-sm">
          <CheckCircle class="w-4 h-4 mt-0.5 shrink-0" />
          <span>{{ description }}</span>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Visual builder -->
        <div class="p-6 card">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap class="w-4 h-4" /> {{ t('tools.cronParser.builderTitle') }}
          </h2>
          <div class="space-y-3">
            <div v-for="(fieldKey, idx) in ['minute','hour','dom','month','dow']" :key="idx">
              <label class="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {{ t('tools.cronParser.field' + fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)) }}
              </label>
              <input
                v-model="fields[fieldKey]"
                type="text"
                class="input-field font-mono text-sm"
                spellcheck="false"
              />
            </div>
          </div>
        </div>

        <!-- Quick presets -->
        <div class="p-6 card">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <RefreshCw class="w-4 h-4" /> {{ t('tools.cronParser.presetsTitle') }}
          </h2>
          <div class="space-y-2">
            <button
              v-for="preset in presets"
              :key="preset.value"
              @click="applyPreset(preset.value)"
              class="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 dark:border-night-border bg-gray-50 dark:bg-night-card-inner hover:border-brand-blue dark:hover:border-brand-blue-lighter transition-colors"
            >
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ preset.label }}</div>
              <div class="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{{ preset.value }}</div>
            </button>
          </div>
        </div>

        <!-- Next execution dates -->
        <div class="p-6 card">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock class="w-4 h-4" /> {{ t('tools.cronParser.nextDatesTitle') }}
          </h2>

          <div v-if="error" class="text-sm text-gray-500 dark:text-gray-400 italic">
            {{ t('tools.cronParser.nextDatesInvalid') }}
          </div>

          <div v-else-if="nextDates.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
            {{ t('tools.cronParser.nextDatesEmpty') }}
          </div>

          <ol v-else class="space-y-2">
            <li
              v-for="(date, idx) in nextDates"
              :key="idx"
              class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-night-card-inner text-sm"
            >
              <span class="text-xs font-bold text-brand-blue dark:text-brand-blue-lighter w-5 text-right shrink-0">{{ idx + 1 }}</span>
              <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ formatDate(date) }}</span>
            </li>
          </ol>
        </div>

      </div>

      <!-- Info / syntax reference -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.cronParser.syntaxTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-mono font-bold text-gray-900 dark:text-white mb-1">*</div>
            <p class="text-xs">{{ t('tools.cronParser.syntaxAny') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-mono font-bold text-gray-900 dark:text-white mb-1">1-5</div>
            <p class="text-xs">{{ t('tools.cronParser.syntaxRange') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-mono font-bold text-gray-900 dark:text-white mb-1">*/5</div>
            <p class="text-xs">{{ t('tools.cronParser.syntaxStep') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-mono font-bold text-gray-900 dark:text-white mb-1">1,3,5</div>
            <p class="text-xs">{{ t('tools.cronParser.syntaxList') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
