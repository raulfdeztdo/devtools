<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Regex,
  AlertTriangle,
  ClipboardCopy,
  CheckCircle,
  Info,
} from "lucide-vue-next";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.regexTester.title",
  descriptionKey: "tools.regexTester.description",
});

const pattern = ref("");
const testString = ref("");
const flagG = ref(true);
const flagI = ref(false);
const flagM = ref(false);
const flagS = ref(false);
const copied = ref(false);

// ── Flags string ──────────────────────────────────────────────────────────
const flags = computed(() => {
  let f = "";
  if (flagG.value) f += "g";
  if (flagI.value) f += "i";
  if (flagM.value) f += "m";
  if (flagS.value) f += "s";
  return f;
});

// ── Compile regex (with error handling) ───────────────────────────────────
const regexResult = computed(() => {
  if (!pattern.value) return { regex: null, error: null };
  try {
    return { regex: new RegExp(pattern.value, flags.value), error: null };
  } catch (e) {
    return { regex: null, error: e.message };
  }
});

// ── All matches with groups ────────────────────────────────────────────────
const matches = computed(() => {
  const { regex } = regexResult.value;
  if (!regex || !testString.value) return [];
  const result = [];
  if (flags.value.includes("g")) {
    let m;
    const re = new RegExp(pattern.value, flags.value);
    while ((m = re.exec(testString.value)) !== null) {
      result.push({ match: m[0], index: m.index, groups: [...m].slice(1) });
      if (!flags.value.includes("g")) break;
    }
  } else {
    const m = regex.exec(testString.value);
    if (m)
      result.push({ match: m[0], index: m.index, groups: [...m].slice(1) });
  }
  return result;
});

// ── Highlighted HTML ──────────────────────────────────────────────────────
const highlightedHtml = computed(() => {
  const { regex, error } = regexResult.value;
  if (error || !regex || !testString.value) {
    return escapeHtml(testString.value);
  }
  try {
    const re = new RegExp(
      pattern.value,
      flags.value.includes("g") ? flags.value : flags.value + "g",
    );
    let result = "";
    let lastIndex = 0;
    let m;
    while ((m = re.exec(testString.value)) !== null) {
      result += escapeHtml(testString.value.slice(lastIndex, m.index));
      result += `<mark class="bg-brand-orange/30 dark:bg-brand-orange/40 rounded px-0.5">${escapeHtml(m[0])}</mark>`;
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) {
        re.lastIndex++;
        lastIndex++;
      }
    }
    result += escapeHtml(testString.value.slice(lastIndex));
    return result;
  } catch {
    return escapeHtml(testString.value);
  }
});

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
    .replace(/ /g, "&nbsp;");
}

// ── Quick reference patterns ──────────────────────────────────────────────
const quickPatterns = [
  {
    label: "Email",
    pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
  },
  {
    label: "URL",
    pattern: "https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w.,@?^=%&:/~+#\\-]*",
  },
  { label: "Number", pattern: "-?\\d+(\\.\\d+)?" },
  { label: "IP", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Date", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { label: "HEX", pattern: "#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})" },
  {
    label: "UUID",
    pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
  },
  { label: "Phone", pattern: "\\+?[\\d\\s\\-().]{7,20}" },
];

function insertPattern(p) {
  pattern.value = p;
}

async function copyMatches() {
  const text = matches.value.map((m) => m.match).join("\n");
  await navigator.clipboard.writeText(text).catch(() => {});
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Regex class="inline-block w-5 h-5" />
          {{ t("tools.regexTester.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.regexTester.subtitle") }}
        </p>
      </div>

      <!-- Pattern + flags -->
      <div class="p-6 mb-6 card">
        <div class="mb-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t("tools.regexTester.patternLabel") }}
          </label>
          <div class="flex gap-2 items-center">
            <span class="text-xl text-gray-400 font-mono select-none">/</span>
            <input
              v-model="pattern"
              type="text"
              class="input-field flex-1 font-mono"
              :placeholder="t('tools.regexTester.patternPlaceholder')"
            />
            <span class="text-xl text-gray-400 font-mono select-none">/</span>
            <span
              class="font-mono text-brand-blue dark:text-brand-blue-lighter"
              >{{ flags }}</span
            >
          </div>
        </div>

        <!-- Flags -->
        <div class="flex flex-wrap gap-4">
          <label
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            <input v-model="flagG" type="checkbox" class="checkbox" />
            <span class="font-mono font-bold">g</span> —
            {{ t("tools.regexTester.flagGlobal") }}
          </label>
          <label
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            <input v-model="flagI" type="checkbox" class="checkbox" />
            <span class="font-mono font-bold">i</span> —
            {{ t("tools.regexTester.flagIgnoreCase") }}
          </label>
          <label
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            <input v-model="flagM" type="checkbox" class="checkbox" />
            <span class="font-mono font-bold">m</span> —
            {{ t("tools.regexTester.flagMultiline") }}
          </label>
          <label
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            <input v-model="flagS" type="checkbox" class="checkbox" />
            <span class="font-mono font-bold">s</span> —
            {{ t("tools.regexTester.flagDotAll") }}
          </label>
        </div>

        <!-- Error -->
        <div
          v-if="regexResult.error"
          class="flex items-center gap-2 p-3 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
        >
          <AlertTriangle class="w-4 h-4 text-red-500 shrink-0" />
          <span class="text-sm text-red-700 dark:text-red-300 font-mono">{{
            regexResult.error
          }}</span>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Test string with highlights -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.regexTester.testStringLabel") }}
            </label>
            <span
              v-if="pattern && !regexResult.error"
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="
                matches.length > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              "
            >
              {{ matches.length }} {{ t("tools.regexTester.matchCount") }}
            </span>
          </div>

          <!-- Editable textarea -->
          <LineNumberedTextarea
            v-model="testString"
            minHeight="12rem"
            :placeholder="t('tools.regexTester.testStringPlaceholder')"
          />

          <!-- Highlighted preview -->
          <div
            v-if="testString && pattern && !regexResult.error"
            class="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all"
            v-html="highlightedHtml"
          ></div>
        </div>

        <!-- Match results -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.regexTester.matchesTitle") }}
            </h3>
            <button
              v-if="matches.length"
              class="p-1 btn-secondary"
              :title="t('common.copy')"
              @click="copyMatches"
            >
              <CheckCircle v-if="copied" class="w-4 h-4 text-green-400" />
              <ClipboardCopy v-else class="w-4 h-4" />
            </button>
          </div>

          <div
            v-if="!pattern"
            class="text-sm text-gray-400 dark:text-gray-500 italic"
          >
            {{ t("tools.regexTester.emptyState") }}
          </div>
          <div
            v-else-if="matches.length === 0 && !regexResult.error && testString"
            class="text-sm text-gray-400 dark:text-gray-500 italic"
          >
            {{ t("tools.regexTester.noMatches") }}
          </div>
          <div v-else class="space-y-2 max-h-80 overflow-y-auto">
            <div
              v-for="(m, idx) in matches"
              :key="idx"
              class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner"
            >
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs font-semibold text-brand-blue dark:text-brand-blue-lighter"
                >
                  #{{ idx + 1 }}
                </span>
                <span
                  class="font-mono text-sm font-bold text-gray-900 dark:text-white"
                >
                  "{{ m.match }}"
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {{ t("tools.regexTester.indexLabel") }} {{ m.index }}
                </span>
              </div>
              <div v-if="m.groups.length" class="mt-1 space-y-0.5">
                <div
                  v-for="(g, gi) in m.groups"
                  :key="gi"
                  class="text-xs text-gray-500 dark:text-gray-400 font-mono"
                >
                  {{ t("tools.regexTester.groupLabel") }} {{ gi + 1 }}:
                  <span class="text-brand-orange"
                    >"{{ g ?? "undefined" }}"</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick reference -->
      <div class="p-6 mt-6 card">
        <h3 class="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          {{ t("tools.regexTester.quickRefTitle") }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in quickPatterns"
            :key="item.label"
            class="px-3 py-1.5 text-sm font-mono rounded-lg border border-gray-200 dark:border-night-border bg-gray-50 dark:bg-night-card-inner text-gray-700 dark:text-gray-300 hover:border-brand-blue hover:text-brand-blue dark:hover:text-brand-blue-lighter transition-colors duration-150"
            @click="insertPattern(item.pattern)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.regexTester.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.regexTester.infoFlagsLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.regexTester.infoFlags") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.regexTester.infoGroupsLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.regexTester.infoGroups") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.regexTester.infoAnchorsLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.regexTester.infoAnchors") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.regexTester.infoQuantLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.regexTester.infoQuant") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
