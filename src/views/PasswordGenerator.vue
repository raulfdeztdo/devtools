<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { KeyRound, Shuffle, ClipboardCopy, Trash2, Lightbulb } from 'lucide-vue-next'

const { t } = useI18n()

// Reactive state
const passwordLength = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const excludeSimilar = ref(false)
const generatedPassword = ref('')
const batchCount = ref(5)
const batchPasswords = ref([])

// Computed properties
const hasValidOptions = computed(() => {
    return includeUppercase.value || includeLowercase.value ||
        includeNumbers.value || includeSymbols.value
})

const characterSet = computed(() => {
    let chars = ''
    if (includeUppercase.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeLowercase.value) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (includeNumbers.value) chars += '0123456789'
    if (includeSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (excludeSimilar.value) {
        chars = chars.replace(/[0O1lI]/g, '')
    }

    return chars
})

const passwordStrength = computed(() => {
    if (!generatedPassword.value) return 0

    let score = 0
    const password = generatedPassword.value

    // Length scoring
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (password.length >= 20) score += 1

    // Character variety
    let varietyScore = 0
    if (/[a-z]/.test(password)) varietyScore += 1
    if (/[A-Z]/.test(password)) varietyScore += 1
    if (/[0-9]/.test(password)) varietyScore += 1
    if (/[^a-zA-Z0-9]/.test(password)) varietyScore += 1

    if (varietyScore === 1) {
        score += 0.5
    } else if (varietyScore === 2) {
        score += 1.5
    } else if (varietyScore === 3) {
        score += 2.5
    } else if (varietyScore === 4) {
        score += 3
    }

    // Bonus for real complexity
    const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2
    const hasMultipleSymbols = (password.match(/[^a-zA-Z0-9]/g) || []).length >= 2
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password)

    if (hasMultipleNumbers && hasMultipleSymbols && hasUpperAndLower) {
        score += 1
    }

    // Penalize repetitive patterns
    if (/(.)\1{2,}/.test(password)) {
        score -= 1
    }

    // Penalize common sequences
    if (/123|abc|qwe|asd|zxc/i.test(password)) {
        score -= 0.5
    }

    return Math.max(0, Math.min(score, 7))
})

const strengthText = computed(() => {
    const strength = passwordStrength.value
    if (strength <= 1.5) return t('tools.password.veryWeak')
    if (strength <= 3) return t('tools.password.weak')
    if (strength <= 4.5) return t('tools.password.medium')
    if (strength <= 6) return t('tools.password.strong')
    return t('tools.password.veryStrong')
})

const strengthClass = computed(() => {
    const strength = passwordStrength.value
    if (strength <= 1.5) return 'text-red-600 dark:text-red-400'
    if (strength <= 3) return 'text-orange-600 dark:text-orange-400'
    if (strength <= 4.5) return 'text-yellow-600 dark:text-yellow-400'
    if (strength <= 6) return 'text-blue-600 dark:text-blue-400'
    return 'text-green-600 dark:text-green-400'
})

const strengthBarClass = computed(() => {
    const strength = passwordStrength.value
    if (strength <= 1.5) return 'bg-red-500'
    if (strength <= 3) return 'bg-orange-500'
    if (strength <= 4.5) return 'bg-yellow-500'
    if (strength <= 6) return 'bg-blue-500'
    return 'bg-green-500'
})

const strengthPercentage = computed(() => {
    return (passwordStrength.value / 7) * 100
})

// Methods
function generatePassword() {
    if (!hasValidOptions.value) return

    const chars = characterSet.value
    let password = ''

    for (let i = 0; i < passwordLength.value; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    generatedPassword.value = password
}

function generateBatch() {
    if (!hasValidOptions.value) return

    const passwords = []
    for (let i = 0; i < batchCount.value; i++) {
        const chars = characterSet.value
        let password = ''

        for (let j = 0; j < passwordLength.value; j++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        passwords.push(password)
    }

    batchPasswords.value = passwords
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

function copyAllPasswords() {
    const allPasswords = batchPasswords.value.join('\n')
    copyToClipboard(allPasswords)
}

function clearBatch() {
    batchPasswords.value = []
}

// Lifecycle
onMounted(() => {
    generatePassword()
})
</script>

<template>
    <div class="py-8">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="mb-8 text-center">
                <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <KeyRound class="inline-block w-5 h-5" /> {{ t('tools.password.title') }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                    {{ t('tools.password.subtitle') }}
                </p>
            </div>

            <div class="grid gap-6 lg:grid-cols-3">
                <!-- Configuration Panel -->
                <div class="lg:col-span-1">
                    <div class="p-6 card">
                        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                            {{ t('tools.password.configuration') }}
                        </h3>

                        <div class="space-y-4">
                            <!-- Password Length -->
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ t('tools.password.length', { length: passwordLength }) }}
                                </label>
                                <input v-model="passwordLength" type="range" min="4" max="128"
                                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-night-card-inner slider">
                                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>4</span>
                                    <span>128</span>
                                </div>
                            </div>

                            <!-- Character Options -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.password.include') }}</h4>

                                <label class="flex items-center gap-2">
                                    <input v-model="includeUppercase" type="checkbox" class="checkbox">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.password.uppercase') }}</span>
                                </label>

                                <label class="flex items-center gap-2">
                                    <input v-model="includeLowercase" type="checkbox" class="checkbox">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.password.lowercase') }}</span>
                                </label>

                                <label class="flex items-center gap-2">
                                    <input v-model="includeNumbers" type="checkbox" class="checkbox">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.password.numbers') }}</span>
                                </label>

                                <label class="flex items-center gap-2">
                                    <input v-model="includeSymbols" type="checkbox" class="checkbox">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.password.symbols') }}</span>
                                </label>

                                <label class="flex items-center gap-2">
                                    <input v-model="excludeSimilar" type="checkbox" class="checkbox">
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.password.excludeSimilar') }}</span>
                                </label>
                            </div>

                            <!-- Generate Button -->
                            <button @click="generatePassword" :disabled="!hasValidOptions" class="w-full btn-primary">
                                <Shuffle class="inline-block w-4 h-4" /> {{ t('tools.password.generatePassword') }}
                            </button>

                            <!-- Batch Generation -->
                            <div class="pt-4 border-t border-gray-200 dark:border-night-border">
                                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ t('tools.password.generateMultiple') }}
                                </label>
                                <div class="flex gap-2">
                                    <input v-model="batchCount" type="number" min="1" max="50"
                                        class="flex-1 input-field" :placeholder="t('tools.password.quantity')">
                                    <button @click="generateBatch" :disabled="!hasValidOptions"
                                        class="px-4 py-2 text-sm btn-secondary">
                                        {{ t('common.generate') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generated Passwords -->
                <div class="lg:col-span-2">
                    <!-- Single Password -->
                    <div v-if="generatedPassword" class="p-6 mb-6 card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                {{ t('tools.password.generatedPassword') }}
                            </h3>
                            <div class="flex gap-2">
                                <button @click="copyToClipboard(generatedPassword)" class="p-2 text-sm btn-secondary"
                                    :title="t('common.copy')">
                                    <ClipboardCopy class="inline-block w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            class="p-4 font-mono text-lg text-gray-900 break-all rounded-lg bg-gray-50 dark:bg-night-card-inner dark:text-white">
                            {{ generatedPassword }}
                        </div>

                        <!-- Password Strength -->
                        <div class="mt-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('tools.password.security') }}</span>
                                <span :class="strengthClass" class="text-sm font-medium">
                                    {{ strengthText }}
                                </span>
                            </div>
                            <div class="w-full h-2 bg-gray-200 rounded-full dark:bg-night-card-inner">
                                <div :class="strengthBarClass" :style="`width: ${strengthPercentage}%`"
                                    class="h-2 transition-all duration-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Batch Passwords -->
                    <div v-if="batchPasswords.length > 0" class="p-6 card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                                {{ t('tools.password.generatedPasswords', { count: batchPasswords.length }) }}
                            </h3>
                            <div class="flex gap-2">
                                <button @click="copyAllPasswords" class="p-2 text-sm btn-secondary"
                                    :title="t('tools.password.copyAllPasswords')">
                                    <ClipboardCopy class="inline-block w-4 h-4" />
                                </button>
                                <button @click="clearBatch" class="p-2 text-sm btn-secondary" :title="t('common.clear')">
                                    <Trash2 class="inline-block w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div class="space-y-2 overflow-y-auto max-h-64">
                            <div v-for="(password, index) in batchPasswords" :key="index"
                                class="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                                <span class="flex-1 font-mono text-sm text-gray-900 break-all dark:text-white">{{
                                    password }}</span>
                                <button @click="copyToClipboard(password)" class="p-1 text-xs btn-secondary"
                                    :title="t('common.copy')">
                                    <ClipboardCopy class="inline-block w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="!generatedPassword && batchPasswords.length === 0" class="p-12 text-center card">
                        <div class="mb-4">
                            <KeyRound class="inline-block w-8 h-8" />
                        </div>
                        <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {{ t('tools.password.emptyStateTitle') }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            {{ t('tools.password.emptyStateDesc') }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Password Tips -->
            <div class="p-6 mt-8 card">
                <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                    <Lightbulb class="inline-block w-5 h-5" /> {{ t('tools.password.securityTips') }}
                </h3>
                <div class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.password.lengthLabel') }}</span>
                        {{ t('tools.password.tipLength') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.password.varietyLabel') }}</span>
                        {{ t('tools.password.tipVariety') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.password.uniqueLabel') }}</span>
                        {{ t('tools.password.tipUnique') }}
                    </div>
                    <div>
                        <span class="font-medium text-gray-900 dark:text-white">{{ t('tools.password.managerLabel') }}</span>
                        {{ t('tools.password.tipManager') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #2d4a6e;
    cursor: pointer;
}

.slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #2d4a6e;
    cursor: pointer;
    border: none;
}
</style>
