<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  FileSearch,
  CheckCircle,
  Paintbrush,
  Minimize2,
  Trash2,
  XCircle,
  ClipboardCopy,
} from "lucide-vue-next";
import LineNumberedTextarea from "@/components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.jsonlint.title",
  descriptionKey: "tools.jsonlint.description",
});

const jsonInput = ref("");
const formattedOutput = ref("");
const autoValidate = ref(true);
const selectedExample = ref("");
const validationResult = ref({
  isValid: false,
  error: null,
  line: null,
  column: null,
});
const jsonStats = ref(null);

const examples = {
  simple: `{
  "name": "Juan Pérez",
  "age": 30,
  "email": "juan@example.com",
  "active": true
}`,
  array: `[
  {
    "id": 1,
    "name": "Producto A",
    "price": 29.99
  },
  {
    "id": 2,
    "name": "Producto B",
    "price": 39.99
  }
]`,
  nested: `{
  "user": {
    "personal": {
      "name": "María García",
      "age": 28
    },
    "contact": {
      "email": "maria@example.com",
      "phones": ["+34 123 456 789", "+34 987 654 321"]
    }
  },
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}`,
  invalid: `{
  "name": "Test",
  "value": 123,
  "invalid": true,
}`,
};

const validateJSON = () => {
  if (!jsonInput.value.trim()) {
    validationResult.value = {
      isValid: false,
      error: t("tools.jsonlint.emptyField"),
      line: null,
      column: null,
    };
    formattedOutput.value = "";
    jsonStats.value = null;
    return;
  }

  try {
    const parsed = JSON.parse(jsonInput.value);
    validationResult.value = {
      isValid: true,
      error: null,
      line: null,
      column: null,
    };
    formattedOutput.value = JSON.stringify(parsed, null, 2);
    calculateStats(parsed);
  } catch (error) {
    const match = error.message.match(/position (\d+)/);
    let line = null,
      column = null;

    if (match) {
      const position = parseInt(match[1]);
      const lines = jsonInput.value.substring(0, position).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    validationResult.value = {
      isValid: false,
      error: error.message,
      line,
      column,
    };
    formattedOutput.value = "";
    jsonStats.value = null;
  }
};

const formatJSON = () => {
  validateJSON();
};

const compressJSON = () => {
  if (!jsonInput.value.trim()) return;

  try {
    const parsed = JSON.parse(jsonInput.value);
    formattedOutput.value = JSON.stringify(parsed);
    validationResult.value = {
      isValid: true,
      error: null,
      line: null,
      column: null,
    };
  } catch (error) {
    validateJSON();
  }
};

const clearEditor = () => {
  jsonInput.value = "";
  formattedOutput.value = "";
  validationResult.value = {
    isValid: false,
    error: null,
    line: null,
    column: null,
  };
  jsonStats.value = null;
  selectedExample.value = "";
};

const loadExample = () => {
  if (selectedExample.value && examples[selectedExample.value]) {
    jsonInput.value = examples[selectedExample.value];
    if (autoValidate.value) {
      validateJSON();
    }
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedOutput.value);
  } catch (err) {
    console.error("Error al copiar:", err);
  }
};

const calculateStats = (obj) => {
  let objects = 0;
  let arrays = 0;
  let properties = 0;
  let maxDepth = 0;

  const traverse = (item, depth = 0) => {
    maxDepth = Math.max(maxDepth, depth);

    if (Array.isArray(item)) {
      arrays++;
      item.forEach((element) => traverse(element, depth + 1));
    } else if (typeof item === "object" && item !== null) {
      objects++;
      Object.keys(item).forEach((key) => {
        properties++;
        traverse(item[key], depth + 1);
      });
    }
  };

  traverse(obj);

  jsonStats.value = {
    objects,
    arrays,
    properties,
    depth: maxDepth,
  };
};

watch(jsonInput, () => {
  if (autoValidate.value) {
    validateJSON();
  }
});

watch(autoValidate, (newValue) => {
  if (newValue && jsonInput.value) {
    validateJSON();
  }
});
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <FileSearch class="inline-block w-5 h-5" />
          {{ t("tools.jsonlint.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ t("tools.jsonlint.subtitle") }}
        </p>
      </div>

      <!-- Controls -->
      <div class="p-6 mb-6 card">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button @click="validateJSON" class="btn-primary">
              <CheckCircle class="inline-block w-4 h-4" />
              {{ t("tools.jsonlint.validateJson") }}
            </button>
            <button @click="formatJSON" class="btn-secondary">
              <Paintbrush class="inline-block w-4 h-4" />
              {{ t("tools.jsonlint.formatBtn") }}
            </button>
            <button @click="compressJSON" class="btn-secondary">
              <Minimize2 class="inline-block w-4 h-4" />
              {{ t("tools.jsonlint.compress") }}
            </button>
            <button @click="clearEditor" class="btn-secondary">
              <Trash2 class="inline-block w-4 h-4" />
              {{ t("tools.jsonlint.clearBtn") }}
            </button>
          </div>
          <div class="flex items-center space-x-4">
            <label
              class="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
              <input
                type="checkbox"
                v-model="autoValidate"
                class="border-gray-300 rounded text-brand-blue focus:ring-brand-blue"
              />
              <span class="text-sm text-nowrap">{{
                t("tools.jsonlint.autoValidation")
              }}</span>
            </label>
            <select
              v-model="selectedExample"
              @change="loadExample"
              class="text-sm input-field"
            >
              <option value="">{{ t("common.loadExample") }}</option>
              <option value="simple">
                {{ t("tools.jsonlint.simpleObject") }}
              </option>
              <option value="array">
                {{ t("tools.jsonlint.objectArray") }}
              </option>
              <option value="nested">
                {{ t("tools.jsonlint.nestedObject") }}
              </option>
              <option value="invalid">
                {{ t("tools.jsonlint.invalidJson") }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Editor and Result -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- JSON Input -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("tools.jsonlint.jsonInput") }}
            </h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ jsonInput.length }} {{ t("common.characters") }}
            </span>
          </div>
          <LineNumberedTextarea
            v-model="jsonInput"
            class="textarea-field"
            :minHeight="'20rem'"
            :placeholder="t('tools.jsonlint.placeholder')"
            :spellcheck="false"
          />
        </div>

        <!-- Result -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("tools.jsonlint.result") }}
            </h3>
            <div class="flex items-center space-x-2">
              <span
                v-if="validationResult.isValid"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200"
              >
                <CheckCircle class="inline-block w-4 h-4 mr-1" />
                {{ t("common.valid") }}
              </span>
              <span
                v-else-if="validationResult.error"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200"
              >
                <XCircle class="inline-block w-4 h-4 mr-1" />
                {{ t("common.invalid") }}
              </span>
            </div>
          </div>

          <!-- Error Display -->
          <div
            v-if="validationResult.error"
            class="p-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
          >
            <h4 class="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
              {{ t("tools.jsonlint.syntaxError") }}
            </h4>
            <p class="font-mono text-sm text-red-700 dark:text-red-300">
              {{ validationResult.error }}
            </p>
            <p
              v-if="validationResult.line"
              class="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              {{ t("tools.jsonlint.line") }} {{ validationResult.line }},
              {{ t("tools.jsonlint.column") }} {{ validationResult.column }}
            </p>
          </div>

          <!-- Formatted JSON Output -->
          <div class="relative">
            <LineNumberedTextarea
              v-model="formattedOutput"
              class="textarea-field"
              :minHeight="'20rem'"
              readonly
              :placeholder="t('tools.jsonlint.formattedPlaceholder')"
            />
            <button
              v-if="formattedOutput"
              @click="copyToClipboard"
              class="absolute p-2 transition-colors bg-gray-100 rounded top-2 right-2 dark:bg-night-card-inner hover:bg-gray-200 dark:hover:bg-gray-600"
              :title="t('tools.jsonlint.copyToClipboard')"
            >
              <ClipboardCopy class="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="validationResult.isValid && jsonStats" class="p-6 mt-6 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {{ t("tools.jsonlint.stats") }}
        </h3>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="text-center">
            <div class="text-xl font-bold text-brand-blue">
              {{ jsonStats.objects }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.jsonlint.objects") }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-brand-blue">
              {{ jsonStats.arrays }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.jsonlint.arrays") }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-brand-blue">
              {{ jsonStats.properties }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.jsonlint.properties") }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-brand-blue">
              {{ jsonStats.depth }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.jsonlint.depth") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
