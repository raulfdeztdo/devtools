<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  ShieldCheck,
  AlertCircle,
  Info,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.qrGenerator.title",
  descriptionKey: "tools.qrGenerator.description",
});

const text = ref("https://example.com");
const errorLevel = ref("M");
const size = ref(256);
const fgColor = ref("#000000");
const bgColor = ref("#ffffff");
const canvasRef = ref(null);
const error = ref("");
let debounceTimer = null;

const ERROR_LEVELS = ["L", "M", "Q", "H"];
const SIZES = [128, 256, 512, 1024];

async function generateQR() {
  if (!canvasRef.value) return;
  error.value = "";

  if (!text.value.trim()) {
    const ctx = canvasRef.value.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    return;
  }

  try {
    await QRCode.toCanvas(canvasRef.value, text.value, {
      errorCorrectionLevel: errorLevel.value,
      width: size.value,
      margin: 2,
      color: {
        dark: fgColor.value,
        light: bgColor.value,
      },
    });
  } catch (e) {
    error.value = e.message || t("tools.qrGenerator.generateError");
  }
}

function scheduleGenerate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(generateQR, 300);
}

watch([text, errorLevel, size, fgColor, bgColor], scheduleGenerate);

// Initial generation after mount
import { onMounted } from "vue";
onMounted(() => {
  // nextTick not needed here; canvas is in DOM
  generateQR();
});

function downloadPNG() {
  if (!canvasRef.value) return;
  canvasRef.value.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          <QrCode class="inline-block w-6 h-6 mr-2 text-brand-orange" />
          {{ t("tools.qrGenerator.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.qrGenerator.subtitle") }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Config panel -->
        <div class="p-6 card">
          <h2
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.qrGenerator.configTitle") }}
          </h2>

          <div class="space-y-5">
            <!-- Text input -->
            <div>
              <label
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.qrGenerator.textLabel") }}
              </label>
              <textarea
                v-model="text"
                class="w-full textarea-field"
                rows="4"
                :placeholder="t('tools.qrGenerator.textPlaceholder')"
                @input="scheduleGenerate"
              ></textarea>
            </div>

            <!-- Error correction level -->
            <div>
              <label
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.qrGenerator.errorLevel") }}
              </label>
              <div class="flex gap-2">
                <button
                  v-for="lvl in ERROR_LEVELS"
                  :key="lvl"
                  @click="errorLevel = lvl"
                  class="flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors"
                  :class="
                    errorLevel === lvl
                      ? 'bg-brand-blue text-white border-brand-blue dark:bg-brand-blue dark:border-brand-blue'
                      : 'border-gray-300 dark:border-night-border text-gray-700 dark:text-gray-300 hover:border-brand-blue/60'
                  "
                >
                  {{ lvl }}
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span v-if="errorLevel === 'L'">{{
                  t("tools.qrGenerator.levelLDesc")
                }}</span>
                <span v-else-if="errorLevel === 'M'">{{
                  t("tools.qrGenerator.levelMDesc")
                }}</span>
                <span v-else-if="errorLevel === 'Q'">{{
                  t("tools.qrGenerator.levelQDesc")
                }}</span>
                <span v-else>{{ t("tools.qrGenerator.levelHDesc") }}</span>
              </p>
            </div>

            <!-- Size -->
            <div>
              <label
                class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.qrGenerator.sizeLabel") }}
              </label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="s in SIZES"
                  :key="s"
                  @click="size = s"
                  class="px-3 py-2 text-sm font-medium rounded-lg border transition-colors"
                  :class="
                    size === s
                      ? 'bg-brand-blue text-white border-brand-blue dark:bg-brand-blue dark:border-brand-blue'
                      : 'border-gray-300 dark:border-night-border text-gray-700 dark:text-gray-300 hover:border-brand-blue/60'
                  "
                >
                  {{ s }}px
                </button>
              </div>
            </div>

            <!-- Colors -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.qrGenerator.fgColor") }}
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="fgColor"
                    type="color"
                    class="w-10 h-10 p-0.5 rounded-lg border border-gray-300 dark:border-night-border cursor-pointer bg-white dark:bg-night-card-inner"
                  />
                  <input
                    v-model="fgColor"
                    type="text"
                    class="flex-1 input-field font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.qrGenerator.bgColor") }}
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="bgColor"
                    type="color"
                    class="w-10 h-10 p-0.5 rounded-lg border border-gray-300 dark:border-night-border cursor-pointer bg-white dark:bg-night-card-inner"
                  />
                  <input
                    v-model="bgColor"
                    type="text"
                    class="flex-1 input-field font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Security notice -->
          <div
            class="flex items-start gap-2 p-3 mt-5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <ShieldCheck
              class="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400"
            />
            <p class="text-xs text-green-700 dark:text-green-300">
              {{ t("tools.qrGenerator.securityNotice") }}
            </p>
          </div>
        </div>

        <!-- Preview panel -->
        <div class="p-6 card flex flex-col items-center">
          <h2
            class="mb-4 w-full text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.qrGenerator.previewTitle") }}
          </h2>

          <!-- Error -->
          <div
            v-if="error"
            class="w-full p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <div class="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle class="w-4 h-4 flex-shrink-0" />
              <span class="text-sm">{{ error }}</span>
            </div>
          </div>

          <!-- Canvas -->
          <div
            class="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-white border border-gray-200 dark:border-night-border w-full"
          >
            <canvas ref="canvasRef" class="max-w-full rounded"></canvas>
          </div>

          <!-- Download -->
          <button
            @click="downloadPNG"
            :disabled="!text.trim()"
            class="mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download class="inline-block w-4 h-4 mr-1.5" />
            {{ t("tools.qrGenerator.downloadPNG") }}
          </button>

          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ size }}×{{ size }}px ·
            {{ t("tools.qrGenerator.errorLevelLabel") }}: {{ errorLevel }}
          </p>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.qrGenerator.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.qrGenerator.infoErrorLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.qrGenerator.infoError") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.qrGenerator.infoUsageLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.qrGenerator.infoUsage") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.qrGenerator.infoSizeLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.qrGenerator.infoSize") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.qrGenerator.infoPrivacyLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.qrGenerator.infoPrivacy") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
