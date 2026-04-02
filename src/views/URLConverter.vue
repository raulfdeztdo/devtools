<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    Globe, Link, Trash2, FileText, ClipboardCopy,
    Unlock, XCircle, CheckCircle, Search, Wrench, Info
} from 'lucide-vue-next'

const { t } = useI18n()

const urlInput = ref('')
const encodedInput = ref('')
const encodedURL = ref('')
const decodedURL = ref('')
const decodeError = ref(false)
const encodeType = ref('component')
const baseURL = ref('')
const urlPath = ref('')
const builderParams = ref('')
const builtURL = ref('')

const isValidURL = computed(() => {
    try {
        new URL(decodedURL.value)
        return true
    } catch {
        return false
    }
})

const parsedParams = computed(() => {
    const params = []
    const url = decodedURL.value || urlInput.value

    try {
        const urlObj = new URL(url)
        for (const [key, value] of urlObj.searchParams) {
            params.push({ key, value })
        }
    } catch {
        // Try to parse query string manually
        const queryStart = url.indexOf('?')
        if (queryStart > -1) {
            const queryString = url.substring(queryStart + 1)
            const pairs = queryString.split('&')

            for (const pair of pairs) {
                const [key, ...valueParts] = pair.split('=')
                const value = valueParts.join('=') || ''
                if (key) {
                    try {
                        params.push({
                            key: decodeURIComponent(key),
                            value: decodeURIComponent(value)
                        })
                    } catch {
                        params.push({ key, value })
                    }
                }
            }
        }
    }

    return params
})

function encodeURL() {
    try {
        if (!urlInput.value) {
            encodedURL.value = ''
            return
        }

        if (encodeType.value === 'component') {
            encodedURL.value = encodeURIComponent(urlInput.value)
        } else {
            encodedURL.value = encodeURI(urlInput.value)
        }
    } catch {
        encodedURL.value = ''
    }
}

function decodeURL() {
    try {
        decodeError.value = false
        if (!encodedInput.value) {
            decodedURL.value = ''
            return
        }

        decodedURL.value = decodeURIComponent(encodedInput.value)
    } catch {
        decodeError.value = true
        decodedURL.value = ''
    }
}

function buildURL() {
    try {
        if (!baseURL.value) {
            builtURL.value = ''
            return
        }

        let url = baseURL.value

        // Add path
        if (urlPath.value) {
            const encodedPath = urlPath.value.split('/').map(segment =>
                segment ? encodeURIComponent(segment) : ''
            ).join('/')

            if (!url.endsWith('/') && !encodedPath.startsWith('/')) {
                url += '/'
            }
            url += encodedPath
        }

        // Add parameters
        if (builderParams.value) {
            const params = new URLSearchParams()
            const lines = builderParams.value.split('\n')

            for (const line of lines) {
                const trimmedLine = line.trim()
                if (trimmedLine && trimmedLine.includes('=')) {
                    const [key, ...valueParts] = trimmedLine.split('=')
                    const value = valueParts.join('=')
                    params.append(key.trim(), value.trim())
                }
            }

            const queryString = params.toString()
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString
            }
        }

        builtURL.value = url
    } catch {
        builtURL.value = ''
    }
}

function clearEncoder() {
    urlInput.value = ''
    encodedURL.value = ''
}

function clearDecoder() {
    encodedInput.value = ''
    decodedURL.value = ''
    decodeError.value = false
}

function loadSampleURL() {
    urlInput.value = 'https://example.com/búsqueda de productos?q=teléfono móvil&precio>100&categoría=electrónicos&disponible=sí'
    encodeURL()
}

function loadSampleEncodedURL() {
    encodedInput.value = 'https://example.com/b%C3%BAsqueda%20de%20productos?q=tel%C3%A9fono%20m%C3%B3vil&precio%3E100&categor%C3%ADa=electr%C3%B3nicos&disponible=s%C3%AD'
    decodeURL()
}

function copyAllParams() {
    const paramStrings = parsedParams.value.map(p => `${p.key}=${p.value}`)
    copyToClipboard(paramStrings.join('\n'))
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
    })
}

watch(encodeType, () => {
    if (urlInput.value) {
        encodeURL()
    }
})
</script>

<template>
    <div class="py-8">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="mb-8 text-center">
                <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <Globe class="inline-block w-5 h-5" /> {{ t('tools.url.title') }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ t('tools.url.subtitle') }}
                </p>
            </div>

            <div class="grid gap-6 lg:grid-cols-2">
                <!-- URL Encoder -->
                <div class="p-6 card">
                    <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                        <Link class="inline-block w-5 h-5" /> {{ t('tools.url.encodeUrl') }}
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label for="url-input"
                                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ t('tools.url.originalUrl') }}
                            </label>
                            <textarea id="url-input" v-model="urlInput" class="w-full font-mono input-field" rows="4"
                                :placeholder="t('tools.url.urlPlaceholder')"
                                @input="encodeURL"></textarea>
                        </div>

                        <div class="flex gap-2">
                            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input v-model="encodeType" type="radio" value="component" class="radio">
                                {{ t('tools.url.component') }}
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input v-model="encodeType" type="radio" value="full" class="radio">
                                {{ t('tools.url.fullUrl') }}
                            </label>
                        </div>

                        <div class="flex gap-2">
                            <button @click="clearEncoder" class="px-4 py-2 text-sm btn-secondary">
                                <Trash2 class="inline-block w-4 h-4" /> {{ t('tools.url.clearEncoder') }}
                            </button>
                            <button @click="loadSampleURL" class="px-4 py-2 text-sm btn-secondary">
                                <FileText class="inline-block w-4 h-4" /> {{ t('tools.url.sampleUrl') }}
                            </button>
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ t('tools.url.encodedUrl') }}
                                </label>
                                <button v-if="encodedURL" @click="copyToClipboard(encodedURL)"
                                    class="p-1 text-sm btn-secondary" :title="t('common.copy')">
                                    <ClipboardCopy class="inline-block w-4 h-4" />
                                </button>
                            </div>
                            <textarea v-model="encodedURL" class="w-full font-mono input-field" rows="4" readonly
                                :placeholder="t('tools.url.resultPlaceholder')"></textarea>
                        </div>

                        <div v-if="encodedURL && urlInput" class="text-xs text-gray-500 dark:text-gray-400">
                            <div>{{ t('tools.url.originalChars') }}: {{ urlInput.length }}</div>
                            <div>{{ t('tools.url.encodedChars') }}: {{ encodedURL.length }}</div>
                        </div>
                    </div>
                </div>

                <!-- URL Decoder -->
                <div class="p-6 card">
                    <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                        <Unlock class="inline-block w-5 h-5" /> {{ t('tools.url.decodeUrl') }}
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label for="encoded-url-input"
                                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ t('tools.url.encodedUrlInput') }}
                            </label>
                            <textarea id="encoded-url-input" v-model="encodedInput" class="w-full font-mono input-field"
                                rows="4"
                                :placeholder="t('tools.url.encodedPlaceholder')"
                                @input="decodeURL"></textarea>
                        </div>

                        <div class="flex gap-2">
                            <button @click="clearDecoder" class="px-4 py-2 text-sm btn-secondary">
                                <Trash2 class="inline-block w-4 h-4" /> {{ t('tools.url.clearDecoder') }}
                            </button>
                            <button @click="loadSampleEncodedURL" class="px-4 py-2 text-sm btn-secondary">
                                <FileText class="inline-block w-4 h-4" /> {{ t('tools.url.sampleEncodedUrl') }}
                            </button>
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ t('tools.url.decodedUrl') }}
                                </label>
                                <button v-if="decodedURL && !decodeError" @click="copyToClipboard(decodedURL)"
                                    class="p-1 text-sm btn-secondary" :title="t('common.copy')">
                                    <ClipboardCopy class="inline-block w-4 h-4" />
                                </button>
                            </div>
                            <textarea v-model="decodedURL" class="w-full font-mono input-field"
                                :class="{ 'border-red-300 dark:border-red-700': decodeError }" rows="4" readonly
                                :placeholder="t('tools.url.resultPlaceholder')"></textarea>
                        </div>

                        <div v-if="decodeError"
                            class="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                            <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
                                <XCircle class="inline-block w-4 h-4" />
                                <span class="font-medium">{{ t('tools.url.decodeError') }}</span>
                            </div>
                            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                                {{ t('tools.url.invalidEncoding') }}
                            </p>
                        </div>

                        <div v-if="decodedURL && !decodeError" class="text-xs text-gray-500 dark:text-gray-400">
                            <div>{{ t('tools.url.decodedChars') }}: {{ decodedURL.length }}</div>
                            <div v-if="isValidURL"><CheckCircle class="inline-block w-4 h-4 text-green-500" /> {{ t('tools.url.validUrl') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Query Parameters Parser -->
            <div v-if="parsedParams.length > 0" class="p-6 mt-8 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white"><Search class="inline-block w-5 h-5" /> {{ t('tools.url.queryParams') }}</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-gray-700 dark:text-gray-300">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-night-border">
                                <th class="p-2 font-medium text-left text-gray-700 dark:text-gray-300">{{ t('tools.url.parameter') }}</th>
                                <th class="p-2 font-medium text-left text-gray-700 dark:text-gray-300">{{ t('tools.url.value') }}</th>
                                <th class="p-2 font-medium text-left text-gray-700 dark:text-gray-300">{{ t('tools.url.action') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(param, index) in parsedParams" :key="index"
                                class="border-b border-gray-100 dark:border-gray-800">
                                <td class="p-2 font-mono text-gray-900 dark:text-white">{{ param.key }}</td>
                                <td class="p-2 font-mono text-gray-900 break-all dark:text-white">{{ param.value }}</td>
                                <td class="p-2">
                                    <button @click="copyToClipboard(`${param.key}=${param.value}`)"
                                        class="px-2 py-1 text-xs btn-secondary">
                                        <ClipboardCopy class="inline-block w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button @click="copyAllParams" class="mt-4 btn-secondary">
                    <ClipboardCopy class="inline-block w-4 h-4" /> {{ t('tools.url.copyAllParams') }}
                </button>
            </div>

            <!-- URL Builder -->
            <div class="p-6 mt-8 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white"><Wrench class="inline-block w-5 h-5" /> {{ t('tools.url.urlBuilder') }}</h3>
                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <label for="base-url" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ t('tools.url.baseUrl') }}
                        </label>
                        <input id="base-url" v-model="baseURL" type="text" class="w-full input-field"
                            placeholder="https://example.com/api" @input="buildURL">
                    </div>
                    <div>
                        <label for="path" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ t('tools.url.path') }}
                        </label>
                        <input id="path" v-model="urlPath" type="text" class="w-full input-field"
                            placeholder="/usuarios/búsqueda" @input="buildURL">
                    </div>
                </div>

                <div class="mt-4">
                    <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('tools.url.paramsPerLine') }}
                    </label>
                    <textarea v-model="builderParams" class="w-full font-mono input-field" rows="4"
                        placeholder="nombre=Juan Pérez&#10;edad=30&#10;ciudad=Madrid" @input="buildURL"></textarea>
                </div>

                <div v-if="builtURL" class="mt-4">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ t('tools.url.builtUrl') }}
                        </label>
                        <button @click="copyToClipboard(builtURL)" class="p-1 text-sm btn-secondary" :title="t('common.copy')">
                            <ClipboardCopy class="inline-block w-4 h-4" />
                        </button>
                    </div>
                    <div
                        class="p-3 font-mono text-sm text-gray-900 break-all rounded-lg bg-gray-50 dark:bg-night-card-inner dark:text-white">
                        {{ builtURL }}
                    </div>
                </div>
            </div>

            <!-- Information -->
            <div class="p-6 mt-8 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white"><Info class="inline-block w-5 h-5" /> {{ t('tools.url.infoTitle') }}</h3>
                <div class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.url.whyLabel') }}</span>
                        {{ t('tools.url.infoWhy') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.url.specialLabel') }}</span>
                        {{ t('tools.url.infoSpecial') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.url.componentLabel') }}</span>
                        {{ t('tools.url.infoComponent') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.url.usageLabel') }}</span>
                        {{ t('tools.url.infoUsage') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
