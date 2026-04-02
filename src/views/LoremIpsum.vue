<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Type,
  RefreshCw,
  ClipboardCopy,
  Download,
  Trash2,
  Info,
  CheckCircle
} from 'lucide-vue-next'

const { t } = useI18n()

const generationType = ref('paragraphs')
const count = ref(3)
const startWithLorem = ref(true)
const output = ref('')
const copied = ref(false)

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
  'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
  'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
  'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
  'ipsam', 'quia', 'voluptas', 'aspernatur', 'odit', 'fugit', 'quo', 'minus',
  'maxime', 'placeat', 'facere', 'possimus', 'omnis', 'voluptatem', 'assumenda',
  'repellendus', 'temporibus', 'autem', 'quibusdam', 'officiis', 'debitis',
  'rerum', 'necessitatibus', 'saepe', 'eveniet', 'voluptates', 'repudiandae',
  'recusandae', 'itaque', 'earum', 'hic', 'tenetur', 'sapiente', 'delectus',
  'reiciendis', 'maiores', 'alias', 'perferendis', 'doloribus', 'asperiores',
  'repellat', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis', 'praesentium',
  'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'quas', 'molestias',
  'perspiciatis', 'unde', 'iste', 'natus', 'error', 'similique', 'facilis',
  'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis', 'eligendi',
  'optio', 'cumque', 'nihil', 'impedit', 'quo', 'porro', 'quisquam', 'dolorem',
  'magnam', 'consequuntur', 'ratione', 'sequi', 'nesciunt', 'neque', 'porro',
  'suscipit', 'laboriosam', 'nisi', 'aliquid', 'commodi', 'eius', 'modi',
  'tempora', 'incidunt', 'labore', 'dolorem', 'fuga', 'harum', 'quidem',
  'delectus', 'expedita', 'distinctio', 'illum', 'dolore', 'quisquam', 'corporis',
  'perspiciatis', 'voluptatibus', 'maiores', 'quibusdam', 'voluptatem', 'praesentium'
]

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
}

function generateSentence() {
  const wordCount = randomInt(5, 15)
  const words = []
  for (let i = 0; i < wordCount; i++) {
    words.push(randomWord())
  }
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function generateParagraph() {
  const sentenceCount = randomInt(3, 7)
  const sentences = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence())
  }
  return sentences.join(' ')
}

function generateWords(n) {
  const words = []
  for (let i = 0; i < n; i++) {
    words.push(randomWord())
  }
  return words.join(' ')
}

function generate() {
  const n = Math.max(1, Math.min(50, Number(count.value) || 1))
  const parts = []

  if (generationType.value === 'paragraphs') {
    for (let i = 0; i < n; i++) {
      if (i === 0 && startWithLorem.value) {
        parts.push(LOREM_START + ' ' + generateParagraph())
      } else {
        parts.push(generateParagraph())
      }
    }
    output.value = parts.join('\n\n')
  } else if (generationType.value === 'sentences') {
    for (let i = 0; i < n; i++) {
      if (i === 0 && startWithLorem.value) {
        parts.push(LOREM_START)
      } else {
        parts.push(generateSentence())
      }
    }
    output.value = parts.join(' ')
  } else {
    const words = startWithLorem.value
      ? 'Lorem ipsum ' + generateWords(Math.max(1, n - 2))
      : generateWords(n)
    output.value = words
  }
}

function clearOutput() {
  output.value = ''
  copied.value = false
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

function downloadTxt() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lorem-ipsum.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const wordCount = computed(() => {
  if (!output.value) return 0
  return output.value.trim().split(/\s+/).filter(Boolean).length
})

const charCount = computed(() => output.value.length)
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          <Type class="inline-block w-6 h-6 mr-2" />{{ t('tools.loremIpsum.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('tools.loremIpsum.subtitle') }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">

        <!-- Config Panel -->
        <div class="p-6 card">
          <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
            {{ t('tools.loremIpsum.configTitle') }}
          </h2>

          <div class="space-y-5">
            <!-- Generation type -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('tools.loremIpsum.typeLabel') }}
              </label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="generationType" value="paragraphs" class="radio" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.loremIpsum.typeParagraphs') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="generationType" value="sentences" class="radio" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.loremIpsum.typeSentences') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="generationType" value="words" class="radio" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.loremIpsum.typeWords') }}</span>
                </label>
              </div>
            </div>

            <!-- Count -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('tools.loremIpsum.countLabel') }}
              </label>
              <input
                v-model.number="count"
                type="number"
                min="1"
                max="50"
                class="input-field"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('tools.loremIpsum.countHint') }}</p>
            </div>

            <!-- Start with lorem -->
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" v-model="startWithLorem" class="checkbox mt-0.5" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ t('tools.loremIpsum.startWithLorem') }}</span>
            </label>

            <!-- Generate button -->
            <button @click="generate" class="w-full btn-primary flex items-center justify-center gap-2">
              <RefreshCw class="w-4 h-4" /> {{ t('common.generate') }}
            </button>
          </div>
        </div>

        <!-- Output Panel -->
        <div class="p-6 card lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t('tools.loremIpsum.outputLabel') }}
            </h2>
            <div v-if="output" class="flex gap-2">
              <button @click="copyToClipboard" class="btn-secondary flex items-center gap-1.5">
                <CheckCircle v-if="copied" class="w-4 h-4 text-green-400" />
                <ClipboardCopy v-else class="w-4 h-4" />
                {{ copied ? t('common.copied') : t('common.copy') }}
              </button>
              <button @click="downloadTxt" class="btn-secondary flex items-center gap-1.5">
                <Download class="w-4 h-4" /> {{ t('common.download') }}
              </button>
              <button @click="clearOutput" class="btn-secondary flex items-center gap-1.5">
                <Trash2 class="w-4 h-4" /> {{ t('common.clear') }}
              </button>
            </div>
          </div>

          <textarea
            :value="output"
            readonly
            class="textarea-field h-96 text-sm leading-relaxed"
            :placeholder="t('tools.loremIpsum.outputPlaceholder')"
          ></textarea>

          <div v-if="output" class="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ wordCount }} {{ t('tools.loremIpsum.words') }}</span>
            <span>{{ charCount }} {{ t('common.characters') }}</span>
          </div>
        </div>

      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.loremIpsum.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-3">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.loremIpsum.infoOriginLabel') }}</div>
            <p class="text-xs">{{ t('tools.loremIpsum.infoOrigin') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.loremIpsum.infoUseLabel') }}</div>
            <p class="text-xs">{{ t('tools.loremIpsum.infoUse') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.loremIpsum.infoVariationsLabel') }}</div>
            <p class="text-xs">{{ t('tools.loremIpsum.infoVariations') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
