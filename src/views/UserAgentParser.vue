<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Monitor, Smartphone, Tablet, Cpu, RefreshCw, Clipboard, ClipboardCheck, Info } from 'lucide-vue-next'

const { t } = useI18n()

const uaInput = ref('')
const parsed = ref(null)
const copied = ref(false)

// ─── UA Parsing Logic ──────────────────────────────────────────────────────

function parseBrowser(ua) {
  // Order matters: check Edge/OPR before Chrome, Chrome before Safari
  if (/Edg\/(\S+)/.test(ua)) return { name: 'Microsoft Edge', version: ua.match(/Edg\/([^\s;]+)/)[1] }
  if (/OPR\/(\S+)/.test(ua) || /Opera\/(\S+)/.test(ua)) {
    const m = ua.match(/OPR\/([^\s;]+)/) || ua.match(/Opera\/([^\s;]+)/)
    return { name: 'Opera', version: m ? m[1] : '' }
  }
  if (/SamsungBrowser\/(\S+)/.test(ua)) return { name: 'Samsung Browser', version: ua.match(/SamsungBrowser\/([^\s;]+)/)[1] }
  if (/YaBrowser\/(\S+)/.test(ua)) return { name: 'Yandex Browser', version: ua.match(/YaBrowser\/([^\s;]+)/)[1] }
  if (/UCBrowser\/(\S+)/.test(ua)) return { name: 'UC Browser', version: ua.match(/UCBrowser\/([^\s;]+)/)[1] }
  if (/CriOS\/(\S+)/.test(ua)) return { name: 'Chrome (iOS)', version: ua.match(/CriOS\/([^\s;]+)/)[1] }
  if (/FxiOS\/(\S+)/.test(ua)) return { name: 'Firefox (iOS)', version: ua.match(/FxiOS\/([^\s;]+)/)[1] }
  if (/Firefox\/(\S+)/.test(ua)) return { name: 'Firefox', version: ua.match(/Firefox\/([^\s;]+)/)[1] }
  if (/MSIE\s(\S+)/.test(ua)) return { name: 'Internet Explorer', version: ua.match(/MSIE\s([^\s;]+)/)[1] }
  if (/Trident.*rv:(\S+)/.test(ua)) return { name: 'Internet Explorer', version: ua.match(/Trident.*rv:([^\s;)]+)/)[1] }
  if (/Chrome\/(\S+)/.test(ua) && !/Chromium/.test(ua)) return { name: 'Chrome', version: ua.match(/Chrome\/([^\s;]+)/)[1] }
  if (/Chromium\/(\S+)/.test(ua)) return { name: 'Chromium', version: ua.match(/Chromium\/([^\s;]+)/)[1] }
  if (/Version\/(\S+).*Safari/.test(ua)) return { name: 'Safari', version: ua.match(/Version\/([^\s;]+)/)[1] }
  if (/Safari\/(\S+)/.test(ua)) return { name: 'Safari', version: ua.match(/Safari\/([^\s;]+)/)[1] }
  return { name: t('tools.userAgentParser.unknown'), version: '' }
}

function parseEngine(ua) {
  if (/Gecko\/(\S+)/.test(ua) && /rv:(\S+)/.test(ua)) {
    const m = ua.match(/rv:([^\s;)]+)/)
    return { name: 'Gecko', version: m ? m[1] : '' }
  }
  if (/AppleWebKit\/(\S+)/.test(ua)) return { name: 'WebKit', version: ua.match(/AppleWebKit\/([^\s;]+)/)[1] }
  if (/Blink/.test(ua)) return { name: 'Blink', version: '' }
  if (/Presto\/(\S+)/.test(ua)) return { name: 'Presto', version: ua.match(/Presto\/([^\s;]+)/)[1] }
  if (/Trident\/(\S+)/.test(ua)) return { name: 'Trident', version: ua.match(/Trident\/([^\s;]+)/)[1] }
  return { name: t('tools.userAgentParser.unknown'), version: '' }
}

function parseOS(ua) {
  if (/Windows NT (\S+)/.test(ua)) {
    const ver = ua.match(/Windows NT ([^\s;)]+)/)[1]
    const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.2': 'XP x64', '5.1': 'XP' }
    return { name: 'Windows', version: winMap[ver] || ver }
  }
  if (/iPhone OS (\S+)/.test(ua)) return { name: 'iOS', version: ua.match(/iPhone OS ([^\s;)]+)/)[1].replace(/_/g, '.') }
  if (/iPad.*OS (\S+)/.test(ua)) return { name: 'iPadOS', version: ua.match(/OS ([^\s;)]+)/)[1].replace(/_/g, '.') }
  if (/Android (\S+)/.test(ua)) return { name: 'Android', version: ua.match(/Android ([^\s;)]+)/)[1] }
  if (/Mac OS X (\S+)/.test(ua)) return { name: 'macOS', version: ua.match(/Mac OS X ([^\s;)]+)/)[1].replace(/_/g, '.') }
  if (/CrOS/.test(ua)) {
    const m = ua.match(/CrOS\s\S+\s([^\s;)]+)/)
    return { name: 'Chrome OS', version: m ? m[1] : '' }
  }
  if (/Linux/.test(ua)) {
    if (/Ubuntu/.test(ua)) return { name: 'Linux (Ubuntu)', version: '' }
    if (/Fedora/.test(ua)) return { name: 'Linux (Fedora)', version: '' }
    if (/Debian/.test(ua)) return { name: 'Linux (Debian)', version: '' }
    return { name: 'Linux', version: '' }
  }
  if (/FreeBSD/.test(ua)) return { name: 'FreeBSD', version: '' }
  return { name: t('tools.userAgentParser.unknown'), version: '' }
}

function parseDeviceType(ua) {
  if (/iPad/.test(ua)) return 'tablet'
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return 'tablet'
  if (/Tablet|tablet/.test(ua)) return 'tablet'
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/.test(ua)) return 'mobile'
  return 'desktop'
}

function parseArchitecture(ua) {
  if (/x86_64|Win64|x64|amd64|WOW64/i.test(ua)) return 'x64'
  if (/arm64|aarch64/i.test(ua)) return 'ARM64'
  if (/armv7|armv8|arm/i.test(ua)) return 'ARM'
  if (/i686|i386|x86/i.test(ua)) return 'x86'
  return t('tools.userAgentParser.unknown')
}

function parseUA(ua) {
  if (!ua.trim()) { parsed.value = null; return }
  parsed.value = {
    browser: parseBrowser(ua),
    engine: parseEngine(ua),
    os: parseOS(ua),
    deviceType: parseDeviceType(ua),
    architecture: parseArchitecture(ua),
    raw: ua,
  }
}

onMounted(() => {
  uaInput.value = navigator.userAgent
  parseUA(uaInput.value)
})

function onInput() {
  parseUA(uaInput.value)
}

function loadCurrentUA() {
  uaInput.value = navigator.userAgent
  parseUA(uaInput.value)
}

async function copyRaw() {
  try {
    await navigator.clipboard.writeText(uaInput.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    /* ignore */
  }
}

function clearAll() {
  uaInput.value = ''
  parsed.value = null
}

const deviceIcon = computed(() => {
  if (!parsed.value) return Monitor
  const d = parsed.value.deviceType
  if (d === 'mobile') return Smartphone
  if (d === 'tablet') return Tablet
  return Monitor
})

const deviceLabel = computed(() => {
  if (!parsed.value) return ''
  const d = parsed.value.deviceType
  if (d === 'mobile') return t('tools.userAgentParser.mobile')
  if (d === 'tablet') return t('tools.userAgentParser.tablet')
  return t('tools.userAgentParser.desktop')
})
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Monitor class="w-6 h-6 text-brand-blue dark:text-brand-blue-lighter" />
          {{ t('tools.userAgentParser.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('tools.userAgentParser.subtitle') }}</p>
      </div>

      <!-- Input -->
      <div class="p-6 mb-6 card">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.userAgentParser.inputLabel') }}</h2>
          <div class="flex gap-2">
            <button @click="loadCurrentUA" class="btn-secondary flex items-center gap-1.5">
              <RefreshCw class="w-3.5 h-3.5" />
              {{ t('tools.userAgentParser.loadCurrent') }}
            </button>
            <button @click="clearAll" class="btn-secondary">{{ t('common.clear') }}</button>
          </div>
        </div>
        <textarea
          v-model="uaInput"
          @input="onInput"
          class="textarea-field w-full h-24 font-mono text-sm resize-none"
          :placeholder="t('tools.userAgentParser.inputPlaceholder')"
          spellcheck="false"
        />
      </div>

      <!-- Results -->
      <div v-if="parsed" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <!-- Browser -->
        <div class="p-5 card dark:bg-night-card">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.userAgentParser.browser') }}
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ parsed.browser.name }}</p>
          <p v-if="parsed.browser.version" class="text-sm text-brand-blue dark:text-brand-blue-lighter font-mono">
            v{{ parsed.browser.version }}
          </p>
        </div>

        <!-- Engine -->
        <div class="p-5 card dark:bg-night-card">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.userAgentParser.engine') }}
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ parsed.engine.name }}</p>
          <p v-if="parsed.engine.version" class="text-sm text-brand-blue dark:text-brand-blue-lighter font-mono">
            v{{ parsed.engine.version }}
          </p>
        </div>

        <!-- OS -->
        <div class="p-5 card dark:bg-night-card">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.userAgentParser.os') }}
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ parsed.os.name }}</p>
          <p v-if="parsed.os.version" class="text-sm text-brand-blue dark:text-brand-blue-lighter font-mono">
            {{ parsed.os.version }}
          </p>
        </div>

        <!-- Device Type -->
        <div class="p-5 card dark:bg-night-card">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.userAgentParser.deviceType') }}
          </p>
          <div class="flex items-center gap-2">
            <component :is="deviceIcon" class="w-6 h-6 text-brand-orange" />
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ deviceLabel }}</p>
          </div>
        </div>

        <!-- Architecture -->
        <div class="p-5 card dark:bg-night-card">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ t('tools.userAgentParser.architecture') }}
          </p>
          <div class="flex items-center gap-2">
            <Cpu class="w-5 h-5 text-brand-orange" />
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ parsed.architecture }}</p>
          </div>
        </div>

      </div>

      <!-- Raw UA Display -->
      <div v-if="parsed" class="mt-4 p-5 card dark:bg-night-card dark:border-night-border">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('tools.userAgentParser.rawString') }}</p>
          <button @click="copyRaw" class="btn-secondary flex items-center gap-1.5">
            <ClipboardCheck v-if="copied" class="w-3.5 h-3.5 text-green-500" />
            <Clipboard v-else class="w-3.5 h-3.5" />
            {{ copied ? t('common.copied') : t('common.copy') }}
          </button>
        </div>
        <p class="font-mono text-xs text-gray-600 dark:text-gray-400 break-all p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
          {{ parsed.raw }}
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="!parsed && !uaInput" class="p-12 text-center card">
        <Monitor class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="text-gray-500 dark:text-gray-400">{{ t('tools.userAgentParser.emptyState') }}</p>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.userAgentParser.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.userAgentParser.infoStructureLabel') }}</div>
            <p class="text-xs">{{ t('tools.userAgentParser.infoStructure') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.userAgentParser.infoLimitsLabel') }}</div>
            <p class="text-xs">{{ t('tools.userAgentParser.infoLimits') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.userAgentParser.infoFreezeLabel') }}</div>
            <p class="text-xs">{{ t('tools.userAgentParser.infoFreeze') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.userAgentParser.infoAlternLabel') }}</div>
            <p class="text-xs">{{ t('tools.userAgentParser.infoAltern') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
