<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  FileCode,
  PenLine,
  Trash2,
  FileText,
  ClipboardCopy,
  Unlock,
  XCircle,
  CheckCircle,
  FolderOpen,
  Download,
  Info,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.base64.title",
  descriptionKey: "tools.base64.description",
});

const textInput = ref("");
const base64Input = ref("");
const encodedResult = ref("");
const decodedResult = ref("");
const decodeError = ref(false);
const fileResult = ref(null);
const fileName = ref("decoded-file.txt");
const fileInput = ref(null);

const isValidText = computed(() => {
  if (!decodedResult.value) return false;
  return /^[\x20-\x7E\s]*$/.test(decodedResult.value);
});

function encodeToBase64() {
  try {
    if (!textInput.value) {
      encodedResult.value = "";
      return;
    }
    encodedResult.value = btoa(unescape(encodeURIComponent(textInput.value)));
  } catch (error) {
    encodedResult.value = "";
  }
}

function decodeFromBase64() {
  try {
    decodeError.value = false;
    if (!base64Input.value) {
      decodedResult.value = "";
      return;
    }

    const cleanInput = base64Input.value.replace(/\s/g, "");

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanInput)) {
      throw new Error("Invalid Base64 format");
    }

    decodedResult.value = decodeURIComponent(escape(atob(cleanInput)));
  } catch (error) {
    decodeError.value = true;
    decodedResult.value = "";
  }
}

function encodeFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = btoa(
      new Uint8Array(e.target.result).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );

    fileResult.value = {
      name: file.name,
      size: file.size,
      type: file.type,
      base64: base64,
    };
  };
  reader.readAsArrayBuffer(file);
}

function downloadBase64AsFile() {
  if (!fileResult.value) return;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(fileResult.value.base64)}`,
  );
  element.setAttribute("download", `${fileResult.value.name}.base64`);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function downloadDecodedAsFile() {
  if (!decodedResult.value || decodeError.value) return;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(decodedResult.value)}`,
  );
  element.setAttribute("download", fileName.value);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function clearEncoder() {
  textInput.value = "";
  encodedResult.value = "";
}

function clearDecoder() {
  base64Input.value = "";
  decodedResult.value = "";
  decodeError.value = false;
}

function loadSampleText() {
  textInput.value =
    "Hola mundo! \u{1F44B}\nEste es un texto de ejemplo para codificar en Base64.\n\u00A1Incluye emojis y caracteres especiales: \u00E1\u00E9\u00ED\u00F3\u00FA \u00F1!";
  encodeToBase64();
}

function loadSampleBase64() {
  base64Input.value =
    "SG9sYSBtdW5kbyEg8J+RiyAKRXN0ZSBlcyB1biB0ZXh0byBkZSBlamVtcGxvIHBhcmEgY29kaWZpY2FyIGVuIEJhc2U2NC4KwqFJbmNsdXllIGVtb2ppcyB5IGNhcmFjdGVyZXMgZXNwZWNpYWxlczogw6HDqcOtw7PDuiDDsSE=";
  decodeFromBase64();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  });
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <FileCode class="inline-block w-5 h-5" />
          {{ t("tools.base64.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.base64.subtitle") }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Encoder -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            <PenLine class="inline-block w-5 h-5" />
            {{ t("tools.base64.textToBase64") }}
          </h3>

          <div class="space-y-4">
            <div>
              <label
                for="text-input"
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.base64.originalText") }}
              </label>
              <textarea
                id="text-input"
                v-model="textInput"
                class="w-full textarea-field"
                rows="8"
                :placeholder="t('tools.base64.textPlaceholder')"
                @input="encodeToBase64"
              ></textarea>
            </div>

            <div class="flex gap-2">
              <button
                @click="clearEncoder"
                class="px-4 py-2 text-sm btn-secondary"
              >
                <Trash2 class="inline-block w-4 h-4" />
                {{ t("tools.base64.clearEncoder") }}
              </button>
              <button
                @click="loadSampleText"
                class="px-4 py-2 text-sm btn-secondary"
              >
                <FileText class="inline-block w-4 h-4" />
                {{ t("tools.base64.sampleText") }}
              </button>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.base64.base64Result") }}
                </label>
                <button
                  v-if="encodedResult"
                  @click="copyToClipboard(encodedResult)"
                  class="p-1 text-sm btn-secondary"
                  :title="t('common.copy')"
                >
                  <ClipboardCopy class="inline-block w-4 h-4" />
                </button>
              </div>
              <textarea
                v-model="encodedResult"
                class="w-full textarea-field font-mono"
                rows="8"
                readonly
                :placeholder="t('tools.base64.resultPlaceholder')"
              ></textarea>
            </div>

            <div
              v-if="encodedResult"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              <div>
                {{ t("tools.base64.originalChars") }}: {{ textInput.length }}
              </div>
              <div>
                {{ t("tools.base64.encodedChars") }}: {{ encodedResult.length }}
              </div>
              <div>
                {{ t("tools.base64.increase") }}:
                {{
                  Math.round(
                    ((encodedResult.length - textInput.length) /
                      textInput.length) *
                      100,
                  )
                }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Decoder -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            <Unlock class="inline-block w-5 h-5" />
            {{ t("tools.base64.base64ToText") }}
          </h3>

          <div class="space-y-4">
            <div>
              <label
                for="base64-input"
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.base64.base64Code") }}
              </label>
              <textarea
                id="base64-input"
                v-model="base64Input"
                class="w-full textarea-field font-mono"
                rows="8"
                :placeholder="t('tools.base64.base64Placeholder')"
                @input="decodeFromBase64"
              ></textarea>
            </div>

            <div class="flex gap-2">
              <button
                @click="clearDecoder"
                class="px-4 py-2 text-sm btn-secondary"
              >
                <Trash2 class="inline-block w-4 h-4" />
                {{ t("tools.base64.clearDecoder") }}
              </button>
              <button
                @click="loadSampleBase64"
                class="px-4 py-2 text-sm btn-secondary"
              >
                <FileText class="inline-block w-4 h-4" />
                {{ t("tools.base64.sampleBase64") }}
              </button>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.base64.decodedText") }}
                </label>
                <button
                  v-if="decodedResult && !decodeError"
                  @click="copyToClipboard(decodedResult)"
                  class="p-1 text-sm btn-secondary"
                  :title="t('common.copy')"
                >
                  <ClipboardCopy class="inline-block w-4 h-4" />
                </button>
              </div>
              <textarea
                v-model="decodedResult"
                class="w-full textarea-field"
                :class="{ 'border-red-300 dark:border-red-700': decodeError }"
                rows="8"
                readonly
                :placeholder="t('tools.base64.resultPlaceholder')"
              ></textarea>
            </div>

            <div
              v-if="decodeError"
              class="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
            >
              <div
                class="flex items-center gap-2 text-red-800 dark:text-red-200"
              >
                <XCircle class="inline-block w-4 h-4" />
                <span class="font-medium">{{
                  t("tools.base64.decodeError")
                }}</span>
              </div>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                {{ t("tools.base64.invalidBase64") }}
              </p>
            </div>

            <div
              v-if="decodedResult && !decodeError"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              <div>
                {{ t("tools.base64.decodedChars") }}: {{ decodedResult.length }}
              </div>
              <div>
                {{ t("tools.base64.isValidText") }}:
                <template v-if="isValidText"
                  ><CheckCircle class="inline-block w-4 h-4 text-green-500" />
                  {{ t("tools.base64.validTextYes") }}</template
                >
                <template v-else
                  ><XCircle class="inline-block w-4 h-4 text-red-500" />
                  {{ t("tools.base64.validTextNo") }}</template
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- File Operations -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <FolderOpen class="inline-block w-5 h-5" />
          {{ t("tools.base64.fileOperations") }}
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label
              for="file-input"
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t("tools.base64.encodeFile") }}
            </label>
            <input
              id="file-input"
              ref="fileInput"
              type="file"
              class="w-full input-field"
              @change="encodeFile"
            />
            <div
              v-if="fileResult"
              class="p-3 mt-2 rounded-lg bg-gray-50 dark:bg-night-card-inner"
            >
              <div
                class="mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {{ fileResult.name }}
              </div>
              <div class="mb-2 text-xs text-gray-500 dark:text-gray-400">
                {{ t("tools.base64.fileSize") }}:
                {{ formatFileSize(fileResult.size) }} |
                {{ t("tools.base64.fileType") }}:
                {{ fileResult.type || t("tools.base64.unknown") }}
              </div>
              <div class="flex gap-2">
                <button
                  @click="copyToClipboard(fileResult.base64)"
                  class="px-3 py-1 text-xs btn-secondary"
                >
                  <ClipboardCopy class="inline-block w-4 h-4" />
                  {{ t("tools.base64.copyBase64") }}
                </button>
                <button
                  @click="downloadBase64AsFile"
                  class="px-3 py-1 text-xs btn-secondary"
                >
                  <Download class="inline-block w-4 h-4" />
                  {{ t("tools.base64.downloadBtn") }}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t("tools.base64.decodeAsFile") }}
            </label>
            <div class="space-y-2">
              <input
                v-model="fileName"
                type="text"
                class="w-full input-field"
                placeholder="nombre-archivo.txt"
              />
              <button
                @click="downloadDecodedAsFile"
                :disabled="!decodedResult || decodeError"
                class="w-full btn-secondary"
              >
                <Download class="inline-block w-4 h-4" />
                {{ t("tools.base64.downloadAsFile") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Information -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <Info class="inline-block w-5 h-5" />
          {{ t("tools.base64.infoTitle") }}
        </h3>
        <div
          class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400"
        >
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.base64.whatLabel")
            }}</span>
            {{ t("tools.base64.infoWhat") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.base64.usageLabel")
            }}</span>
            {{ t("tools.base64.infoUsage") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.base64.charsLabel")
            }}</span>
            {{ t("tools.base64.infoChars") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.base64.sizeLabel")
            }}</span>
            {{ t("tools.base64.infoSize") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
