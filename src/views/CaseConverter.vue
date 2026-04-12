<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Type,
  ClipboardCopy,
  Trash2,
  FileText,
  CheckCircle,
  Info,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.caseConverter.title",
  descriptionKey: "tools.caseConverter.description",
});

const input = ref("");
const copiedKey = ref("");

// Smart tokenizer: handles camelCase, PascalCase, snake_case, kebab-case, spaces, dots, slashes
function tokenize(str) {
  if (!str) return [];
  // Insert space before uppercase letters that follow lowercase letters (camelCase/PascalCase)
  const spaced = str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  // Split on spaces, underscores, hyphens, dots, slashes
  return spaced
    .split(/[\s_\-./\\]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

const conversions = computed(() => {
  const tokens = tokenize(input.value);
  if (tokens.length === 0) return [];

  const lower = tokens.map((w) => w.toLowerCase());
  const upper = tokens.map((w) => w.toUpperCase());
  const titled = tokens.map(
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );

  return [
    {
      key: "camelCase",
      label: t("tools.caseConverter.camelCase"),
      value: lower[0] + titled.slice(1).join(""),
    },
    {
      key: "pascalCase",
      label: t("tools.caseConverter.pascalCase"),
      value: titled.join(""),
    },
    {
      key: "snakeCase",
      label: t("tools.caseConverter.snakeCase"),
      value: lower.join("_"),
    },
    {
      key: "kebabCase",
      label: t("tools.caseConverter.kebabCase"),
      value: lower.join("-"),
    },
    {
      key: "screamingSnake",
      label: t("tools.caseConverter.screamingSnake"),
      value: upper.join("_"),
    },
    {
      key: "titleCase",
      label: t("tools.caseConverter.titleCase"),
      value: titled.join(" "),
    },
    {
      key: "upperCase",
      label: t("tools.caseConverter.upperCase"),
      value: tokens.join(" ").toUpperCase(),
    },
    {
      key: "lowerCase",
      label: t("tools.caseConverter.lowerCase"),
      value: tokens.join(" ").toLowerCase(),
    },
    {
      key: "dotCase",
      label: t("tools.caseConverter.dotCase"),
      value: lower.join("."),
    },
    {
      key: "pathCase",
      label: t("tools.caseConverter.pathCase"),
      value: lower.join("/"),
    },
  ];
});

function copyToClipboard(text, key) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
  copiedKey.value = key;
  setTimeout(() => {
    copiedKey.value = "";
  }, 1500);
}

function clearInput() {
  input.value = "";
}

function loadSample() {
  input.value = "hello world example string";
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Type class="inline-block w-6 h-6 mr-2 text-brand-orange" />
          {{ t("tools.caseConverter.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.caseConverter.subtitle") }}
        </p>
      </div>

      <!-- Input -->
      <div class="p-6 mb-6 card">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ t("tools.caseConverter.inputLabel") }}
          </label>
          <div class="flex gap-2">
            <button
              @click="loadSample"
              class="btn-secondary flex items-center gap-1.5"
            >
              <FileText class="inline-block w-3.5 h-3.5 mr-1" />{{
                t("tools.caseConverter.loadSample")
              }}
            </button>
            <button
              @click="clearInput"
              class="btn-secondary flex items-center gap-1.5"
            >
              <Trash2 class="inline-block w-3.5 h-3.5 mr-1" />{{
                t("common.clear")
              }}
            </button>
          </div>
        </div>
        <textarea
          v-model="input"
          class="w-full textarea-field"
          rows="3"
          :placeholder="t('tools.caseConverter.inputPlaceholder')"
        ></textarea>
      </div>

      <!-- Results grid -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in conversions" :key="item.key" class="p-4 card">
          <div class="flex items-center justify-between mb-2">
            <span
              class="text-xs font-semibold tracking-wide uppercase text-brand-blue dark:text-brand-blue-lighter"
            >
              {{ item.label }}
            </span>
            <button
              @click="copyToClipboard(item.value, item.key)"
              class="p-1 transition-colors rounded btn-secondary"
              :title="t('common.copy')"
            >
              <CheckCircle
                v-if="copiedKey === item.key"
                class="w-4 h-4 text-green-500"
              />
              <ClipboardCopy v-else class="w-4 h-4" />
            </button>
          </div>
          <div
            class="px-3 py-2 font-mono text-sm text-gray-900 rounded-md dark:text-white bg-gray-50 dark:bg-night-card-inner break-all"
          >
            {{ item.value || "—" }}
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!input"
        class="mt-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        {{ t("tools.caseConverter.emptyState") }}
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.caseConverter.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.caseConverter.infoCamelLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.caseConverter.infoCamel") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.caseConverter.infoPascalLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.caseConverter.infoPascal") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.caseConverter.infoSnakeLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.caseConverter.infoSnake") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.caseConverter.infoKebabLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.caseConverter.infoKebab") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
