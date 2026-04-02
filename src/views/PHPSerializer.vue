<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Braces, ArrowDownToLine, ArrowUpFromLine, ClipboardCopy, Zap, Info, AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()

const jsonInput = ref('')
const phpInput = ref('')
const phpResult = ref('')
const jsonResult = ref('')
const jsonError = ref('')
const phpError = ref('')

function convertJsonToPhp() {
    jsonError.value = ''
    phpResult.value = ''

    if (!jsonInput.value.trim()) return

    try {
        const parsed = JSON.parse(jsonInput.value)
        phpResult.value = jsonToPhpSerialize(parsed)
    } catch (error) {
        jsonError.value = `Error JSON: ${error.message}`
    }
}

function convertPhpToJson() {
    phpError.value = ''
    jsonResult.value = ''

    if (!phpInput.value.trim()) return

    try {
        const parsed = phpUnserialize(phpInput.value)
        jsonResult.value = JSON.stringify(parsed, null, 2)
    } catch (error) {
        phpError.value = `Error PHP: ${error.message}`
    }
}

function jsonToPhpSerialize(value) {
    if (value === null) return 'N;'
    if (typeof value === 'boolean') return value ? 'b:1;' : 'b:0;'
    if (typeof value === 'number') {
        return Number.isInteger(value) ? `i:${value};` : `d:${value};`
    }
    if (typeof value === 'string') {
        const encoded = utf8Encode(value)
        return `s:${encoded.length}:"${encoded}";`
    }
    if (Array.isArray(value)) {
        let result = `a:${value.length}:{`
        value.forEach((item, index) => {
            result += `i:${index};${jsonToPhpSerialize(item)}`
        })
        result += '}'
        return result
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value)
        let result = `a:${keys.length}:{`
        keys.forEach(key => {
            const keyStr = utf8Encode(key)
            result += `s:${keyStr.length}:"${keyStr}";${jsonToPhpSerialize(value[key])}`
        })
        result += '}'
        return result
    }
    throw new Error(t('tools.phpSerializer.unsupportedType', { type: typeof value }))
}

function phpUnserialize(str) {
    let index = 0

    const parseValue = () => {
        const type = str[index++]
        if (index >= str.length) throw new Error('Incomplete string')

        // Null is a special case without ':'
        if (type === 'N') {
            if (str[index] !== ';') throw new Error('Expected ";"')
            index++
            return null
        }

        if (str[index] !== ':') throw new Error('Expected ":"')
        index++

        switch (type) {
            case 'b': {
                const boolVal = str[index]
                index += 2 // skip value and ';'
                return boolVal === '1'
            }

            case 'i': {
                const intEnd = str.indexOf(';', index)
                const intVal = parseInt(str.substring(index, intEnd))
                index = intEnd + 1
                return intVal
            }

            case 'd': {
                const floatEnd = str.indexOf(';', index)
                const floatVal = parseFloat(str.substring(index, floatEnd))
                index = floatEnd + 1
                return floatVal
            }

            case 's': {
                const lenEnd = str.indexOf(':', index)
                const len = parseInt(str.substring(index, lenEnd))
                index = lenEnd + 2 // skip ':' and '"'
                const strVal = str.substring(index, index + len)
                index += len + 2 // skip string and '";'
                return utf8Decode(strVal)
            }

            case 'a': {
                const arrLenEnd = str.indexOf(':', index)
                const arrLen = parseInt(str.substring(index, arrLenEnd))
                index = arrLenEnd + 2 // skip ':' and '{'

                const result = {}
                let isArray = true
                let expectedIndex = 0

                for (let i = 0; i < arrLen; i++) {
                    const key = parseValue()
                    const value = parseValue()

                    if (key !== expectedIndex) isArray = false
                    result[key] = value
                    expectedIndex++
                }

                if (str[index] !== '}') throw new Error('Expected "}"')
                index++

                return isArray ? Object.values(result) : result
            }

            default:
                throw new Error(`Unsupported type: ${type}`)
        }
    }

    return parseValue()
}

function utf8Encode(str) {
    return unescape(encodeURIComponent(str))
}

function utf8Decode(str) {
    return decodeURIComponent(escape(str))
}

function loadExample(type) {
    const examples = {
        simple: {
            json: '{\n  "nombre": "Juan P\u00e9rez",\n  "edad": 30,\n  "activo": true,\n  "salario": 2500.50\n}'
        },
        array: {
            json: '[\n  "manzana",\n  "banana",\n  "naranja",\n  "kiwi"\n]'
        },
        nested: {
            json: '{\n  "usuario": {\n    "nombre": "Ana Garc\u00eda",\n    "perfil": {\n      "edad": 25,\n      "ciudad": "Madrid"\n    },\n    "hobbies": ["lectura", "m\u00fasica", "viajes"]\n  },\n  "configuracion": {\n    "tema": "oscuro",\n    "notificaciones": true\n  }\n}'
        }
    }

    jsonInput.value = examples[type].json
    convertJsonToPhp()
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
    } catch (err) {
        console.error('Error copying:', err)
    }
}
</script>

<template>
    <div class="py-8">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="mb-8 text-center">
                <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <Braces class="inline-block w-5 h-5" /> {{ t('tools.phpSerializer.title') }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ t('tools.phpSerializer.subtitle') }}
                </p>
            </div>

            <!-- JSON to PHP -->
            <div class="p-6 mb-6 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    <ArrowDownToLine class="inline-block w-5 h-5" /> {{ t('tools.phpSerializer.jsonToPhp') }}
                </h3>
                <div class="grid gap-6 lg:grid-cols-2">
                    <div>
                        <label for="json-input" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ t('tools.phpSerializer.jsonInput') }}
                        </label>
                        <textarea id="json-input" v-model="jsonInput" class="textarea-field" rows="10"
                            :placeholder="t('tools.phpSerializer.jsonPlaceholder')"
                            @input="convertJsonToPhp"></textarea>
                        <div v-if="jsonError" class="flex items-center gap-2 mt-2 text-red-800 dark:text-red-200">
                            <AlertCircle class="w-4 h-4" />
                            <span class="text-sm">{{ jsonError }}</span>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ t('tools.phpSerializer.phpSerialized') }}
                            </label>
                            <button v-if="phpResult" @click="copyToClipboard(phpResult)"
                                class="px-3 py-1 text-xs btn-secondary">
                                <ClipboardCopy class="inline-block w-4 h-4 mr-1" /> {{ t('common.copy') }}
                            </button>
                        </div>
                        <textarea v-model="phpResult" class="textarea-field" rows="10" readonly
                            :placeholder="t('tools.phpSerializer.phpResultPlaceholder')"></textarea>
                        <div v-if="jsonInput && phpResult" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {{ t('common.size') }}: {{ phpResult.length }} {{ t('common.characters') }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- PHP to JSON -->
            <div class="p-6 mb-6 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    <ArrowUpFromLine class="inline-block w-5 h-5" /> {{ t('tools.phpSerializer.phpToJson') }}
                </h3>
                <div class="grid gap-6 lg:grid-cols-2">
                    <div>
                        <label for="php-input" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ t('tools.phpSerializer.phpInput') }}
                        </label>
                        <textarea id="php-input" v-model="phpInput" class="textarea-field" rows="10"
                            :placeholder="t('tools.phpSerializer.phpPlaceholder')"
                            @input="convertPhpToJson"></textarea>
                        <div v-if="phpError" class="flex items-center gap-2 mt-2 text-red-800 dark:text-red-200">
                            <AlertCircle class="w-4 h-4" />
                            <span class="text-sm">{{ phpError }}</span>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {{ t('tools.phpSerializer.jsonResult') }}
                            </label>
                            <button v-if="jsonResult" @click="copyToClipboard(jsonResult)"
                                class="px-3 py-1 text-xs btn-secondary">
                                <ClipboardCopy class="inline-block w-4 h-4 mr-1" /> {{ t('common.copy') }}
                            </button>
                        </div>
                        <textarea v-model="jsonResult" class="textarea-field" rows="10" readonly
                            :placeholder="t('tools.phpSerializer.jsonResultPlaceholder')"></textarea>
                        <div v-if="phpInput && jsonResult" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {{ t('common.size') }}: {{ jsonResult.length }} {{ t('common.characters') }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Examples -->
            <div class="p-6 mb-6 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    <Zap class="inline-block w-5 h-5" /> {{ t('tools.phpSerializer.quickExamples') }}
                </h3>
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <button @click="loadExample('simple')"
                        class="p-3 text-left transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-night-card-inner dark:hover:bg-gray-600">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.phpSerializer.simpleObject') }}</div>
                        <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('tools.phpSerializer.simpleObjectDesc') }}</div>
                    </button>
                    <button @click="loadExample('array')"
                        class="p-3 text-left transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-night-card-inner dark:hover:bg-gray-600">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.phpSerializer.indexedArray') }}</div>
                        <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('tools.phpSerializer.indexedArrayDesc') }}</div>
                    </button>
                    <button @click="loadExample('nested')"
                        class="p-3 text-left transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-night-card-inner dark:hover:bg-gray-600">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.phpSerializer.nestedObject') }}</div>
                        <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('tools.phpSerializer.nestedObjectDesc') }}</div>
                    </button>
                </div>
            </div>

            <!-- Information -->
            <div class="p-6 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    <Info class="inline-block w-5 h-5" /> {{ t('tools.phpSerializer.infoTitle') }}
                </h3>
                <div class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.phpSerializer.whatLabel') }}</span>
                        {{ t('tools.phpSerializer.infoWhat') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.phpSerializer.formatLabel') }}</span>
                        {{ t('tools.phpSerializer.infoFormat') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.phpSerializer.usageLabel') }}</span>
                        {{ t('tools.phpSerializer.infoUsage') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.phpSerializer.cautionLabel') }}</span>
                        {{ t('tools.phpSerializer.infoCaution') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
