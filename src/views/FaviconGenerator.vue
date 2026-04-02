<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image, Type, Download, RefreshCw, Info } from 'lucide-vue-next'

const { t } = useI18n()

const mode = ref('text') // 'text' | 'image'
const textInput = ref('\u{1F600}')
const bgColor = ref('#3b82f6')
const textColor = ref('#ffffff')
const font = ref('system')
const imageFile = ref(null)
const imageDataUrl = ref(null)
const fileInputEl = ref(null)

const sizes = [16, 32, 48, 64, 128, 256]
const previewCanvas = ref(null)
const sizeCanvases = ref({})

const fontFamilyMap = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
}

function drawTextFavicon(canvas, size) {
  const ctx = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = textColor.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fontSize = Math.round(size * 0.65)
  ctx.font = `${fontSize}px ${fontFamilyMap[font.value]}`
  ctx.fillText(textInput.value.slice(0, 2), size / 2, size / 2)
}

function drawImageFavicon(canvas, size, img) {
  const ctx = canvas.getContext('2d')
  canvas.width = size
  canvas.height = size
  ctx.drawImage(img, 0, 0, size, size)
}

async function renderAll() {
  await nextTick()
  if (mode.value === 'text') {
    sizes.forEach(size => {
      const c = sizeCanvases.value[size]
      if (c) drawTextFavicon(c, size)
    })
    if (previewCanvas.value) drawTextFavicon(previewCanvas.value, 128)
  } else if (imageDataUrl.value) {
    const img = new window.Image()
    img.onload = () => {
      sizes.forEach(size => {
        const c = sizeCanvases.value[size]
        if (c) drawImageFavicon(c, size, img)
      })
      if (previewCanvas.value) drawImageFavicon(previewCanvas.value, 128, img)
    }
    img.src = imageDataUrl.value
  }
}

watch([textInput, bgColor, textColor, font, mode, imageDataUrl], renderAll)

onMounted(renderAll)

function registerCanvas(size, el) {
  if (el) sizeCanvases.value[size] = el
}

function downloadSize(size) {
  const c = sizeCanvases.value[size]
  if (!c) return
  const link = document.createElement('a')
  link.download = `favicon-${size}x${size}.png`
  link.href = c.toDataURL('image/png')
  link.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    imageDataUrl.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function resetImage() {
  imageDataUrl.value = null
  imageFile.value = null
  if (fileInputEl.value) fileInputEl.value.value = ''
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Image class="w-6 h-6 text-brand-blue dark:text-brand-blue-lighter" />
          {{ t('tools.faviconGenerator.title') }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ t('tools.faviconGenerator.subtitle') }}</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">

        <!-- Left: Config -->
        <div class="space-y-6">

          <!-- Mode Selector -->
          <div class="p-6 card">
            <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.faviconGenerator.source') }}</h2>
            <div class="flex gap-2">
              <button
                @click="mode = 'text'"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="mode === 'text'
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
              >
                <Type class="w-4 h-4" />
                {{ t('tools.faviconGenerator.textMode') }}
              </button>
              <button
                @click="mode = 'image'"
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="mode === 'image'
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
              >
                <Image class="w-4 h-4" />
                {{ t('tools.faviconGenerator.imageMode') }}
              </button>
            </div>
          </div>

          <!-- Text/Emoji Options -->
          <div v-if="mode === 'text'" class="p-6 card space-y-4">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.faviconGenerator.textOptions') }}</h2>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('tools.faviconGenerator.textLabel') }}
              </label>
              <input
                v-model="textInput"
                type="text"
                maxlength="2"
                class="input-field w-full"
                :placeholder="t('tools.faviconGenerator.textPlaceholder')"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ t('tools.faviconGenerator.textHint') }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('tools.faviconGenerator.bgColor') }}
                </label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="bgColor" class="w-10 h-9 rounded cursor-pointer border border-gray-300 dark:border-gray-600 bg-transparent" />
                  <input type="text" v-model="bgColor" class="input-field flex-1 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('tools.faviconGenerator.textColor') }}
                </label>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="textColor" class="w-10 h-9 rounded cursor-pointer border border-gray-300 dark:border-gray-600 bg-transparent" />
                  <input type="text" v-model="textColor" class="input-field flex-1 font-mono text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('tools.faviconGenerator.fontLabel') }}
              </label>
              <select v-model="font" class="input-field w-full">
                <option value="system">{{ t('tools.faviconGenerator.fontSystem') }}</option>
                <option value="serif">{{ t('tools.faviconGenerator.fontSerif') }}</option>
                <option value="mono">{{ t('tools.faviconGenerator.fontMono') }}</option>
              </select>
            </div>
          </div>

          <!-- Image Upload Options -->
          <div v-if="mode === 'image'" class="p-6 card space-y-4">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.faviconGenerator.imageOptions') }}</h2>
            <div
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-brand-blue dark:hover:border-brand-blue-lighter transition-colors"
              @click="fileInputEl.click()"
            >
              <Image class="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('tools.faviconGenerator.uploadHint') }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, SVG</p>
            </div>
            <input ref="fileInputEl" type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" @change="onFileChange" />
            <div v-if="imageDataUrl" class="flex items-center gap-3">
              <img :src="imageDataUrl" class="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-700" />
              <button @click="resetImage" class="btn-secondary flex items-center gap-1.5">
                <RefreshCw class="w-3.5 h-3.5" />
                {{ t('tools.faviconGenerator.changeImage') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Preview & Sizes -->
        <div class="space-y-6">

          <!-- Preview -->
          <div class="p-6 card">
            <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.faviconGenerator.preview') }}</h2>
            <div class="flex items-center gap-6">
              <canvas
                ref="previewCanvas"
                width="128"
                height="128"
                class="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                style="image-rendering: pixelated; width: 128px; height: 128px;"
              />
              <div class="text-sm text-gray-500 dark:text-gray-400">
                <p>128 × 128 px</p>
                <p class="mt-1">{{ t('tools.faviconGenerator.previewNote') }}</p>
              </div>
            </div>
          </div>

          <!-- All Sizes -->
          <div class="p-6 card">
            <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.faviconGenerator.downloadSizes') }}</h2>
            <div class="space-y-3">
              <div
                v-for="size in sizes"
                :key="size"
                class="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner"
              >
                <canvas
                  :ref="el => registerCanvas(size, el)"
                  :width="size"
                  :height="size"
                  class="rounded border border-gray-200 dark:border-gray-700 flex-shrink-0"
                  :style="`image-rendering: pixelated; width: ${Math.min(size, 48)}px; height: ${Math.min(size, 48)}px;`"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ size }} × {{ size }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">favicon-{{ size }}x{{ size }}.png</p>
                </div>
                <button
                  @click="downloadSize(size)"
                  class="btn-secondary flex items-center gap-1.5"
                >
                  <Download class="w-3.5 h-3.5" />
                  {{ t('common.download') }}
                </button>
              </div>
            </div>
          </div>

      </div>
    </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.faviconGenerator.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.faviconGenerator.infoSizesLabel') }}</div>
            <p class="text-xs">{{ t('tools.faviconGenerator.infoSizes') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.faviconGenerator.infoBrowserLabel') }}</div>
            <p class="text-xs">{{ t('tools.faviconGenerator.infoBrowser') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.faviconGenerator.infoFormatsLabel') }}</div>
            <p class="text-xs">{{ t('tools.faviconGenerator.infoFormats') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.faviconGenerator.infoTipLabel') }}</div>
            <p class="text-xs">{{ t('tools.faviconGenerator.infoTip') }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
