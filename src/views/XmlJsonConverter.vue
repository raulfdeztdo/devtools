<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeftRight, ClipboardCopy, AlertCircle, FileText, Info } from 'lucide-vue-next'
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue'

const { t } = useI18n()

const direction = ref('xml-to-json')
const input = ref('')
const output = ref('')
const error = ref('')
const copied = ref(false)

const EXAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>John Doe</name>
  <age>30</age>
  <active>true</active>
  <address>
    <city>Madrid</city>
    <country>Spain</country>
  </address>
</person>`

const EXAMPLE_JSON = JSON.stringify(
    { person: { name: 'John Doe', age: '30', active: 'true', address: { city: 'Madrid', country: 'Spain' } } },
    null,
    2
)

const inputLabel = computed(() =>
    direction.value === 'xml-to-json' ? t('tools.xmlJson.xmlLabel') : t('tools.xmlJson.jsonLabel')
)
const outputLabel = computed(() =>
    direction.value === 'xml-to-json' ? t('tools.xmlJson.jsonLabel') : t('tools.xmlJson.xmlLabel')
)
const inputPlaceholder = computed(() =>
    direction.value === 'xml-to-json' ? t('tools.xmlJson.xmlPlaceholder') : t('tools.xmlJson.jsonPlaceholder')
)
const outputPlaceholder = computed(() =>
    direction.value === 'xml-to-json' ? t('tools.xmlJson.jsonOutputPlaceholder') : t('tools.xmlJson.xmlOutputPlaceholder')
)
const directionLabel = computed(() =>
    direction.value === 'xml-to-json' ? 'XML → JSON' : 'JSON → XML'
)

// ---------- XML → JSON ----------
function xmlToJson(node) {
    if (node.nodeType === 3) {
        const val = node.nodeValue.trim()
        return val || undefined
    }
    const obj = {}
    if (node.attributes) {
        for (const attr of node.attributes) {
            obj['@' + attr.name] = attr.value
        }
    }
    for (const child of node.childNodes) {
        const val = xmlToJson(child)
        if (val === undefined) continue
        const name = child.nodeName
        if (Object.prototype.hasOwnProperty.call(obj, name)) {
            if (!Array.isArray(obj[name])) obj[name] = [obj[name]]
            obj[name].push(val)
        } else {
            obj[name] = val
        }
    }
    // If the only key collected is '#text' and there are no attributes,
    // return the text value directly (avoids { "#text": "value" } wrapping)
    const keys = Object.keys(obj)
    if (keys.length === 1 && keys[0] === '#text') {
        return obj['#text']
    }
    return obj
}

function parseXmlToJson(xmlStr) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlStr, 'application/xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
        throw new Error(parserError.textContent.split('\n')[0] || 'Invalid XML')
    }
    const result = {}
    result[doc.documentElement.nodeName] = xmlToJson(doc.documentElement)
    return result
}

// ---------- JSON → XML ----------
function jsonToXml(obj, nodeName, indent) {
    const pad = '  '.repeat(indent)
    if (obj === null || obj === undefined) {
        return `${pad}<${nodeName}/>`
    }
    if (typeof obj !== 'object') {
        return `${pad}<${nodeName}>${escapeXml(String(obj))}</${nodeName}>`
    }
    if (Array.isArray(obj)) {
        return obj.map(item => jsonToXml(item, nodeName, indent)).join('\n')
    }
    const attrs = []
    const children = []
    for (const [key, val] of Object.entries(obj)) {
        if (key.startsWith('@')) {
            attrs.push(` ${key.slice(1)}="${escapeXml(String(val))}"`)
        } else {
            children.push(jsonToXml(val, key, indent + 1))
        }
    }
    const attrStr = attrs.join('')
    if (children.length === 0) {
        return `${pad}<${nodeName}${attrStr}/>`
    }
    return `${pad}<${nodeName}${attrStr}>\n${children.join('\n')}\n${pad}</${nodeName}>`
}

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function parseJsonToXml(jsonStr) {
    const obj = JSON.parse(jsonStr)
    if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
        throw new Error(t('tools.xmlJson.rootMustBeObject'))
    }
    const keys = Object.keys(obj)
    if (keys.length !== 1) {
        throw new Error(t('tools.xmlJson.rootMustHaveSingleKey'))
    }
    const rootKey = keys[0]
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.push(jsonToXml(obj[rootKey], rootKey, 0))
    return lines.join('\n')
}

// ---------- Core ----------
function convert() {
    error.value = ''
    output.value = ''

    if (!input.value.trim()) return

    try {
        if (direction.value === 'xml-to-json') {
            const parsed = parseXmlToJson(input.value)
            output.value = JSON.stringify(parsed, null, 2)
        } else {
            output.value = parseJsonToXml(input.value)
        }
    } catch (err) {
        error.value = err.message
    }
}

function swapDirection() {
    if (output.value) {
        input.value = output.value
        output.value = ''
    } else {
        input.value = ''
    }
    error.value = ''
    direction.value = direction.value === 'xml-to-json' ? 'json-to-xml' : 'xml-to-json'
    if (input.value) convert()
}

function loadExample() {
    error.value = ''
    if (direction.value === 'xml-to-json') {
        input.value = EXAMPLE_XML
    } else {
        input.value = EXAMPLE_JSON
    }
    convert()
}

async function copyOutput() {
    if (!output.value) return
    try {
        await navigator.clipboard.writeText(output.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch (err) {
        console.error('Copy failed:', err)
    }
}

function onInput() {
    convert()
}
</script>

<template>
    <div class="py-8">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8 text-center">
                <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <ArrowLeftRight class="inline-block w-5 h-5 mr-2" />{{ t('tools.xmlJson.title') }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ t('tools.xmlJson.subtitle') }}
                </p>
            </div>

            <!-- Converter Card -->
            <div class="p-6 mb-6 card">
                <!-- Direction bar -->
                <div class="flex items-center justify-between mb-6">
                    <span class="px-3 py-1 text-sm font-semibold text-white rounded-lg bg-brand-blue">
                        {{ directionLabel }}
                    </span>
                    <div class="flex items-center gap-2">
                        <button @click="loadExample" class="btn-secondary flex items-center gap-1.5">
                            <FileText class="inline-block w-3 h-3 mr-1" />{{ t('common.loadExample') }}
                        </button>
                        <button @click="swapDirection" class="btn-secondary flex items-center gap-1.5">
                            <ArrowLeftRight class="inline-block w-3 h-3 mr-1" />{{ t('common.swap') }}
                        </button>
                    </div>
                </div>

                <!-- Side-by-side panels -->
                <div class="grid gap-6 lg:grid-cols-2">
                    <!-- Input panel -->
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ inputLabel }}
                        </label>
                        <LineNumberedTextarea
                            v-model="input"
                            minHeight="28rem"
                            :placeholder="inputPlaceholder"
                            @input="onInput"
                        />
                        <div v-if="error" class="flex items-start gap-2 mt-2 text-red-600 dark:text-red-400">
                            <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span class="text-sm font-mono break-all">{{ error }}</span>
                        </div>
                    </div>

                    <!-- Output panel -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ outputLabel }}
                            </label>
                            <button
                                v-if="output"
                                @click="copyOutput"
                                class="btn-secondary flex items-center gap-1.5"
                            >
                                <ClipboardCopy class="inline-block w-3 h-3 mr-1" />
                                {{ copied ? t('common.copied') : t('common.copy') }}
                            </button>
                        </div>
                        <LineNumberedTextarea
                            :modelValue="output"
                            readonly
                            minHeight="28rem"
                            :placeholder="outputPlaceholder"
                        />
                        <div v-if="output" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {{ t('common.size') }}: {{ output.length }} {{ t('common.characters') }}
                        </div>
                    </div>
            </div>
        </div>

        <!-- Info -->
        <div class="p-6 mt-8 card">
            <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info class="w-4 h-4" /> {{ t('tools.xmlJson.infoTitle') }}
            </h2>
            <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
                <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                    <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.xmlJson.infoMappingLabel') }}</div>
                    <p class="text-xs">{{ t('tools.xmlJson.infoMapping') }}</p>
                </div>
                <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                    <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.xmlJson.infoAttrsLabel') }}</div>
                    <p class="text-xs">{{ t('tools.xmlJson.infoAttrs') }}</p>
                </div>
                <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                    <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.xmlJson.infoTextLabel') }}</div>
                    <p class="text-xs">{{ t('tools.xmlJson.infoText') }}</p>
                </div>
                <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                    <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.xmlJson.infoLimitsLabel') }}</div>
                    <p class="text-xs">{{ t('tools.xmlJson.infoLimits') }}</p>
                </div>
            </div>
        </div>

    </div>
    </div>
</template>
