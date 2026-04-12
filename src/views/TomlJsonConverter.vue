<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowLeftRight,
  ClipboardCopy,
  AlertCircle,
  FileText,
  Info,
} from "lucide-vue-next";
import { parse as parseTOML, stringify as stringifyTOML } from "smol-toml";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.tomlJson.title",
  descriptionKey: "tools.tomlJson.description",
});

const direction = ref("toml-to-json");
const input = ref("");
const output = ref("");
const error = ref("");
const copied = ref(false);

const EXAMPLE_TOML = `name = "John Doe"
age = 30
active = true

[address]
city = "Madrid"
country = "Spain"

[[hobbies]]
name = "coding"

[[hobbies]]
name = "reading"`;

const EXAMPLE_JSON = JSON.stringify(
  {
    name: "John Doe",
    age: 30,
    active: true,
    address: { city: "Madrid", country: "Spain" },
    hobbies: [{ name: "coding" }, { name: "reading" }],
  },
  null,
  2,
);

const inputLabel = computed(() =>
  direction.value === "toml-to-json"
    ? t("tools.tomlJson.tomlLabel")
    : t("tools.tomlJson.jsonLabel"),
);
const outputLabel = computed(() =>
  direction.value === "toml-to-json"
    ? t("tools.tomlJson.jsonLabel")
    : t("tools.tomlJson.tomlLabel"),
);
const inputPlaceholder = computed(() =>
  direction.value === "toml-to-json"
    ? t("tools.tomlJson.tomlPlaceholder")
    : t("tools.tomlJson.jsonPlaceholder"),
);
const outputPlaceholder = computed(() =>
  direction.value === "toml-to-json"
    ? t("tools.tomlJson.jsonOutputPlaceholder")
    : t("tools.tomlJson.tomlOutputPlaceholder"),
);
const directionLabel = computed(() =>
  direction.value === "toml-to-json" ? "TOML → JSON" : "JSON → TOML",
);

function convert() {
  error.value = "";
  output.value = "";

  if (!input.value.trim()) return;

  try {
    if (direction.value === "toml-to-json") {
      const parsed = parseTOML(input.value);
      output.value = JSON.stringify(parsed, null, 2);
    } else {
      const parsed = JSON.parse(input.value);
      output.value = stringifyTOML(parsed);
    }
  } catch (err) {
    error.value = err.message;
  }
}

function swapDirection() {
  if (output.value) {
    input.value = output.value;
    output.value = "";
  } else {
    input.value = "";
  }
  error.value = "";
  direction.value =
    direction.value === "toml-to-json" ? "json-to-toml" : "toml-to-json";
  if (input.value) convert();
}

function loadExample() {
  error.value = "";
  if (direction.value === "toml-to-json") {
    input.value = EXAMPLE_TOML;
  } else {
    input.value = EXAMPLE_JSON;
  }
  convert();
}

async function copyOutput() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

function onInput() {
  convert();
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <ArrowLeftRight class="inline-block w-5 h-5 mr-2" />{{
            t("tools.tomlJson.title")
          }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.tomlJson.subtitle") }}
        </p>
      </div>

      <!-- Converter Card -->
      <div class="p-6 mb-6 card">
        <!-- Direction bar -->
        <div class="flex items-center justify-between mb-6">
          <span
            class="px-3 py-1 text-sm font-semibold text-white rounded-lg bg-brand-blue"
          >
            {{ directionLabel }}
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="loadExample"
              class="btn-secondary flex items-center gap-1.5"
            >
              <FileText class="inline-block w-3 h-3 mr-1" />{{
                t("common.loadExample")
              }}
            </button>
            <button
              @click="swapDirection"
              class="btn-secondary flex items-center gap-1.5"
            >
              <ArrowLeftRight class="inline-block w-3 h-3 mr-1" />{{
                t("common.swap")
              }}
            </button>
          </div>
        </div>

        <!-- Side-by-side panels -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Input panel -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ inputLabel }}
            </label>
            <LineNumberedTextarea
              v-model="input"
              minHeight="28rem"
              :placeholder="inputPlaceholder"
              @input="onInput"
            />
            <div
              v-if="error"
              class="flex items-start gap-2 mt-2 text-red-600 dark:text-red-400"
            >
              <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span class="text-sm font-mono break-all">{{ error }}</span>
            </div>
          </div>

          <!-- Output panel -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ outputLabel }}
              </label>
              <button
                v-if="output"
                @click="copyOutput"
                class="btn-secondary flex items-center gap-1.5"
              >
                <ClipboardCopy class="inline-block w-3 h-3 mr-1" />
                {{ copied ? t("common.copied") : t("common.copy") }}
              </button>
            </div>
            <LineNumberedTextarea
              :modelValue="output"
              readonly
              minHeight="28rem"
              :placeholder="outputPlaceholder"
            />
            <div
              v-if="output"
              class="mt-2 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ t("common.size") }}: {{ output.length }}
              {{ t("common.characters") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.tomlJson.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.tomlJson.infoWhatLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.tomlJson.infoWhat") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.tomlJson.infoSyntaxLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.tomlJson.infoSyntax") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.tomlJson.infoTypesLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.tomlJson.infoTypes") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.tomlJson.infoUsageLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.tomlJson.infoUsage") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
