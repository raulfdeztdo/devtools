<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  Code2,
  ClipboardCopy,
  CheckCircle,
  ArrowLeftRight,
  Trash2,
  Info,
} from "lucide-vue-next";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.htmlEntityEncoder.title",
  descriptionKey: "tools.htmlEntityEncoder.description",
});

const mode = ref("encode"); // 'encode' | 'decode'
const inputText = ref("");
const copied = ref(false);

// ── Encode: text → HTML entities ─────────────────────────────────────────
function encodeEntities(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Decode: HTML entities → text  (uses a textarea trick) ─────────────────
function decodeEntities(str) {
  const ta = document.createElement("textarea");
  ta.innerHTML = str;
  return ta.value;
}

const outputText = computed(() => {
  if (!inputText.value) return "";
  return mode.value === "encode"
    ? encodeEntities(inputText.value)
    : decodeEntities(inputText.value);
});

function swap() {
  const prev = outputText.value;
  mode.value = mode.value === "encode" ? "decode" : "encode";
  inputText.value = prev;
}

function clearAll() {
  inputText.value = "";
  copied.value = false;
}

async function copyOutput() {
  if (!outputText.value) return;
  await navigator.clipboard.writeText(outputText.value).catch(() => {});
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

const referenceItems = [
  { char: "&", entity: "&amp;" },
  { char: "<", entity: "&lt;" },
  { char: ">", entity: "&gt;" },
  { char: '"', entity: "&quot;" },
  { char: "'", entity: "&#039;" },
];
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Code2 class="inline-block w-5 h-5" />
          {{ t("tools.htmlEntityEncoder.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.htmlEntityEncoder.subtitle") }}
        </p>
      </div>

      <!-- Mode selector -->
      <div class="flex gap-2 mb-6">
        <button
          class="px-5 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
          :class="
            mode === 'encode'
              ? 'bg-brand-blue text-white'
              : 'bg-white dark:bg-night-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-night-border hover:border-brand-blue'
          "
          @click="mode = 'encode'"
        >
          {{ t("tools.htmlEntityEncoder.encodeMode") }}
        </button>
        <button
          class="px-5 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
          :class="
            mode === 'decode'
              ? 'bg-brand-blue text-white'
              : 'bg-white dark:bg-night-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-night-border hover:border-brand-blue'
          "
          @click="mode = 'decode'"
        >
          {{ t("tools.htmlEntityEncoder.decodeMode") }}
        </button>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Input -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{
                mode === "encode"
                  ? t("tools.htmlEntityEncoder.inputLabelEncode")
                  : t("tools.htmlEntityEncoder.inputLabelDecode")
              }}
            </label>
            <div class="flex gap-2">
              <button
                class="p-1 btn-secondary"
                :title="t('common.clear')"
                @click="clearAll"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <LineNumberedTextarea
            v-model="inputText"
            minHeight="16rem"
            :placeholder="
              mode === 'encode'
                ? t('tools.htmlEntityEncoder.placeholderEncode')
                : t('tools.htmlEntityEncoder.placeholderDecode')
            "
          />
          <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {{ inputText.length }} {{ t("common.characters") }}
          </div>
        </div>

        <!-- Output -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{
                mode === "encode"
                  ? t("tools.htmlEntityEncoder.outputLabelEncode")
                  : t("tools.htmlEntityEncoder.outputLabelDecode")
              }}
            </label>
            <div class="flex gap-2">
              <button
                class="p-1 btn-secondary"
                :title="t('common.copy')"
                :disabled="!outputText"
                @click="copyOutput"
              >
                <CheckCircle v-if="copied" class="w-4 h-4 text-green-400" />
                <ClipboardCopy v-else class="w-4 h-4" />
              </button>
              <button
                class="p-1 btn-secondary"
                :title="t('common.swap')"
                :disabled="!outputText"
                @click="swap"
              >
                <ArrowLeftRight class="w-4 h-4" />
              </button>
            </div>
          </div>
          <LineNumberedTextarea
            :modelValue="outputText"
            readonly
            minHeight="16rem"
            :placeholder="t('tools.htmlEntityEncoder.outputPlaceholder')"
          />
          <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {{ outputText.length }} {{ t("common.characters") }}
          </div>
        </div>
      </div>

      <!-- Reference table -->
      <div class="p-6 mt-6 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {{ t("tools.htmlEntityEncoder.referenceTitle") }}
        </h3>
        <div class="grid gap-2 sm:grid-cols-3 md:grid-cols-5">
          <div
            v-for="item in referenceItems"
            :key="item.entity"
            class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-night-card-inner text-sm"
          >
            <span class="font-mono font-bold text-brand-orange">{{
              item.char
            }}</span>
            <span class="text-gray-400 dark:text-gray-500 mx-2">→</span>
            <span class="font-mono text-gray-700 dark:text-gray-300">{{
              item.entity
            }}</span>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.htmlEntityEncoder.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.htmlEntityEncoder.infoWhyLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.htmlEntityEncoder.infoWhy") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.htmlEntityEncoder.infoWhenLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.htmlEntityEncoder.infoWhen") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.htmlEntityEncoder.infoCommonLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.htmlEntityEncoder.infoCommon") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.htmlEntityEncoder.infoNamedLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.htmlEntityEncoder.infoNamed") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
