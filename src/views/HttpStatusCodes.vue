<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe, Search, ChevronDown, ChevronUp, X } from 'lucide-vue-next'

const { t } = useI18n()

const searchQuery = ref('')
const activeCategory = ref('all')
const expandedCode = ref(null)

const categories = [
  { id: 'all', label: computed(() => t('tools.httpStatusCodes.all')) },
  { id: '1xx', label: computed(() => t('tools.httpStatusCodes.informational')) },
  { id: '2xx', label: computed(() => t('tools.httpStatusCodes.success')) },
  { id: '3xx', label: computed(() => t('tools.httpStatusCodes.redirection')) },
  { id: '4xx', label: computed(() => t('tools.httpStatusCodes.clientError')) },
  { id: '5xx', label: computed(() => t('tools.httpStatusCodes.serverError')) },
]

const statusCodes = [
  // 1xx Informational
  { code: 100, name: 'Continue', category: '1xx' },
  { code: 101, name: 'Switching Protocols', category: '1xx' },
  { code: 102, name: 'Processing', category: '1xx' },
  { code: 103, name: 'Early Hints', category: '1xx' },
  // 2xx Success
  { code: 200, name: 'OK', category: '2xx' },
  { code: 201, name: 'Created', category: '2xx' },
  { code: 202, name: 'Accepted', category: '2xx' },
  { code: 203, name: 'Non-Authoritative Information', category: '2xx' },
  { code: 204, name: 'No Content', category: '2xx' },
  { code: 205, name: 'Reset Content', category: '2xx' },
  { code: 206, name: 'Partial Content', category: '2xx' },
  { code: 207, name: 'Multi-Status', category: '2xx' },
  { code: 208, name: 'Already Reported', category: '2xx' },
  { code: 226, name: 'IM Used', category: '2xx' },
  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', category: '3xx' },
  { code: 301, name: 'Moved Permanently', category: '3xx' },
  { code: 302, name: 'Found', category: '3xx' },
  { code: 303, name: 'See Other', category: '3xx' },
  { code: 304, name: 'Not Modified', category: '3xx' },
  { code: 307, name: 'Temporary Redirect', category: '3xx' },
  { code: 308, name: 'Permanent Redirect', category: '3xx' },
  // 4xx Client Error
  { code: 400, name: 'Bad Request', category: '4xx' },
  { code: 401, name: 'Unauthorized', category: '4xx' },
  { code: 402, name: 'Payment Required', category: '4xx' },
  { code: 403, name: 'Forbidden', category: '4xx' },
  { code: 404, name: 'Not Found', category: '4xx' },
  { code: 405, name: 'Method Not Allowed', category: '4xx' },
  { code: 406, name: 'Not Acceptable', category: '4xx' },
  { code: 407, name: 'Proxy Authentication Required', category: '4xx' },
  { code: 408, name: 'Request Timeout', category: '4xx' },
  { code: 409, name: 'Conflict', category: '4xx' },
  { code: 410, name: 'Gone', category: '4xx' },
  { code: 411, name: 'Length Required', category: '4xx' },
  { code: 412, name: 'Precondition Failed', category: '4xx' },
  { code: 413, name: 'Content Too Large', category: '4xx' },
  { code: 414, name: 'URI Too Long', category: '4xx' },
  { code: 415, name: 'Unsupported Media Type', category: '4xx' },
  { code: 416, name: 'Range Not Satisfiable', category: '4xx' },
  { code: 417, name: 'Expectation Failed', category: '4xx' },
  { code: 418, name: "I'm a teapot", category: '4xx' },
  { code: 422, name: 'Unprocessable Entity', category: '4xx' },
  { code: 423, name: 'Locked', category: '4xx' },
  { code: 424, name: 'Failed Dependency', category: '4xx' },
  { code: 425, name: 'Too Early', category: '4xx' },
  { code: 426, name: 'Upgrade Required', category: '4xx' },
  { code: 428, name: 'Precondition Required', category: '4xx' },
  { code: 429, name: 'Too Many Requests', category: '4xx' },
  { code: 431, name: 'Request Header Fields Too Large', category: '4xx' },
  { code: 451, name: 'Unavailable For Legal Reasons', category: '4xx' },
  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', category: '5xx' },
  { code: 501, name: 'Not Implemented', category: '5xx' },
  { code: 502, name: 'Bad Gateway', category: '5xx' },
  { code: 503, name: 'Service Unavailable', category: '5xx' },
  { code: 504, name: 'Gateway Timeout', category: '5xx' },
  { code: 505, name: 'HTTP Version Not Supported', category: '5xx' },
  { code: 506, name: 'Variant Also Negotiates', category: '5xx' },
  { code: 507, name: 'Insufficient Storage', category: '5xx' },
  { code: 508, name: 'Loop Detected', category: '5xx' },
  { code: 510, name: 'Not Extended', category: '5xx' },
  { code: 511, name: 'Network Authentication Required', category: '5xx' },
]

const categoryColorMap = {
  '1xx': {
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    row: 'border-l-4 border-gray-400',
    expanded: 'bg-gray-50 dark:bg-gray-800/50',
    code: 'text-gray-600 dark:text-gray-400',
  },
  '2xx': {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    row: 'border-l-4 border-green-500',
    expanded: 'bg-green-50 dark:bg-green-900/10',
    code: 'text-green-600 dark:text-green-400',
  },
  '3xx': {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    row: 'border-l-4 border-blue-500',
    expanded: 'bg-blue-50 dark:bg-blue-900/10',
    code: 'text-blue-600 dark:text-blue-400',
  },
  '4xx': {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    row: 'border-l-4 border-brand-orange',
    expanded: 'bg-orange-50 dark:bg-orange-900/10',
    code: 'text-brand-orange dark:text-brand-orange-light',
  },
  '5xx': {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    row: 'border-l-4 border-red-500',
    expanded: 'bg-red-50 dark:bg-red-900/10',
    code: 'text-red-600 dark:text-red-400',
  },
}

const filteredCodes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return statusCodes.filter(item => {
    const matchesCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    if (!query) return matchesCategory
    const matchesSearch = String(item.code).includes(query) ||
      item.name.toLowerCase().includes(query) ||
      t(`tools.httpStatusCodes.codes.${item.code}.description`).toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
})

function toggleExpanded(code) {
  expandedCode.value = expandedCode.value === code ? null : code
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Globe class="w-6 h-6 text-brand-blue dark:text-brand-blue-lighter" />
          {{ t('tools.httpStatusCodes.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('tools.httpStatusCodes.subtitle') }}</p>
      </div>

      <!-- Search and Filters -->
      <div class="p-4 mb-6 card">
        <!-- Search -->
        <div class="relative mb-4">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('tools.httpStatusCodes.searchPlaceholder')"
            class="input-field pl-9 pr-9 w-full"
          />
          <button v-if="searchQuery" @click="clearSearch" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            :class="activeCategory === cat.id
              ? 'bg-brand-blue text-white dark:bg-brand-blue-light dark:text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
          >
            {{ cat.label.value }}
          </button>
        </div>
      </div>

      <!-- Results count -->
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        {{ t('tools.httpStatusCodes.showing', { count: filteredCodes.length }) }}
      </p>

      <!-- Status Codes List -->
      <div class="card overflow-hidden">
        <div v-if="filteredCodes.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
          <Search class="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{{ t('tools.httpStatusCodes.noResults') }}</p>
        </div>

        <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="item in filteredCodes"
            :key="item.code"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            :class="categoryColorMap[item.category].row"
            @click="toggleExpanded(item.code)"
          >
            <!-- Row -->
            <div class="flex items-center gap-4 px-4 py-3">
              <span
                class="font-mono text-lg font-bold w-14 flex-shrink-0"
                :class="categoryColorMap[item.category].code"
              >
                {{ item.code }}
              </span>
              <span
                class="px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0"
                :class="categoryColorMap[item.category].badge"
              >
                {{ item.category }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</p>
                <p v-if="expandedCode !== item.code" class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ t(`tools.httpStatusCodes.codes.${item.code}.description`) }}</p>
              </div>
              <ChevronDown
                v-if="expandedCode !== item.code"
                class="w-4 h-4 text-gray-400 flex-shrink-0"
              />
              <ChevronUp
                v-else
                class="w-4 h-4 text-gray-400 flex-shrink-0"
              />
            </div>

            <!-- Expanded Detail -->
            <div
              v-if="expandedCode === item.code"
              class="px-4 pb-4 pt-1"
              :class="categoryColorMap[item.category].expanded"
            >
              <div class="pl-18 ml-14 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ t('tools.httpStatusCodes.description') }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ t(`tools.httpStatusCodes.codes.${item.code}.description`) }}</p>
                <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ t('tools.httpStatusCodes.useCases') }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t(`tools.httpStatusCodes.codes.${item.code}.useCases`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
