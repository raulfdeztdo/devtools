<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { diffLines, diffWords } from "diff";
import { FileText, Copy, Check, Trash2, Info } from "lucide-vue-next";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.textDiff.title",
  descriptionKey: "tools.textDiff.description",
});

const originalText = ref("");
const modifiedText = ref("");
const diffMode = ref("lines"); // 'lines' | 'words'
const copied = ref(false);

const diffResult = computed(() => {
  if (!originalText.value && !modifiedText.value) return [];
  if (diffMode.value === "lines") {
    return diffLines(originalText.value, modifiedText.value);
  }
  return diffWords(originalText.value, modifiedText.value);
});

const stats = computed(() => {
  let added = 0;
  let removed = 0;
  diffResult.value.forEach((part) => {
    const count =
      diffMode.value === "lines"
        ? (part.value.match(/\n/g) || []).length || (part.value.trim() ? 1 : 0)
        : part.value.trim()
          ? 1
          : 0;
    if (part.added) added += count;
    else if (part.removed) removed += count;
  });
  return { added, removed };
});

function buildUnifiedDiff() {
  const lines = [];
  lines.push("--- original");
  lines.push("+++ modified");
  diffLines(originalText.value, modifiedText.value).forEach((part) => {
    const prefix = part.added ? "+" : part.removed ? "-" : " ";
    part.value.split("\n").forEach((line) => {
      if (
        line === "" &&
        part.value.endsWith("\n") &&
        line === part.value.split("\n").at(-1)
      )
        return;
      lines.push(prefix + line);
    });
  });
  return lines.join("\n");
}

async function copyDiff() {
  try {
    await navigator.clipboard.writeText(buildUnifiedDiff());
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    /* ignore */
  }
}

function clearAll() {
  originalText.value = "";
  modifiedText.value = "";
}

// For word diff: render tokens as inline spans
function wordDiffSegments(parts) {
  return parts.map((part) => ({
    text: part.value,
    added: part.added || false,
    removed: part.removed || false,
  }));
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1
          class="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
        >
          <FileText
            class="w-6 h-6 text-brand-blue dark:text-brand-blue-lighter"
          />
          {{ t("tools.textDiff.title") }}
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ t("tools.textDiff.subtitle") }}
        </p>
      </div>

      <!-- Controls -->
      <div class="p-4 mb-6 card flex flex-wrap items-center gap-3">
        <!-- Mode -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400 font-medium"
            >{{ t("tools.textDiff.mode") }}:</span
          >
          <button
            @click="diffMode = 'lines'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="
              diffMode === 'lines'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            "
          >
            {{ t("tools.textDiff.lines") }}
          </button>
          <button
            @click="diffMode = 'words'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="
              diffMode === 'words'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            "
          >
            {{ t("tools.textDiff.words") }}
          </button>
        </div>

        <div class="ml-auto flex gap-2">
          <button
            v-if="diffResult.length"
            @click="copyDiff"
            class="btn-secondary flex items-center gap-1.5"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-green-500" />
            <Copy v-else class="w-3.5 h-3.5" />
            {{ copied ? t("common.copied") : t("tools.textDiff.copyDiff") }}
          </button>
          <button
            @click="clearAll"
            class="btn-secondary flex items-center gap-1.5"
          >
            <Trash2 class="w-3.5 h-3.5" />
            {{ t("common.clearAll") }}
          </button>
        </div>
      </div>

      <!-- Inputs -->
      <div class="grid gap-6 lg:grid-cols-2 mb-6">
        <div class="p-6 card">
          <h2
            class="mb-3 text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.textDiff.original") }}
          </h2>
          <LineNumberedTextarea
            v-model="originalText"
            minHeight="12rem"
            :placeholder="t('tools.textDiff.originalPlaceholder')"
            :spellcheck="false"
          />
        </div>
        <div class="p-6 card">
          <h2
            class="mb-3 text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.textDiff.modified") }}
          </h2>
          <LineNumberedTextarea
            v-model="modifiedText"
            minHeight="12rem"
            :placeholder="t('tools.textDiff.modifiedPlaceholder')"
            :spellcheck="false"
          />
        </div>
      </div>

      <!-- Stats Bar -->
      <div v-if="diffResult.length" class="flex flex-wrap gap-4 mb-4">
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20"
        >
          <span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
          <span class="text-sm font-medium text-green-700 dark:text-green-300">
            +{{ stats.added }}
            {{
              diffMode === "lines"
                ? t("tools.textDiff.linesAdded")
                : t("tools.textDiff.wordsAdded")
            }}
          </span>
        </div>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20"
        >
          <span class="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
          <span class="text-sm font-medium text-red-700 dark:text-red-300">
            -{{ stats.removed }}
            {{
              diffMode === "lines"
                ? t("tools.textDiff.linesRemoved")
                : t("tools.textDiff.wordsRemoved")
            }}
          </span>
        </div>
      </div>

      <!-- Diff Output -->
      <div v-if="diffResult.length" class="card overflow-hidden">
        <div
          class="p-3 bg-gray-100 dark:bg-night-card-inner border-b border-gray-200 dark:border-night-border flex items-center gap-2"
        >
          <span
            class="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >{{ t("tools.textDiff.diffOutput") }}</span
          >
        </div>

        <!-- Lines mode -->
        <div
          v-if="diffMode === 'lines'"
          class="font-mono text-sm divide-y divide-gray-100 dark:divide-gray-800"
        >
          <template v-for="(part, i) in diffResult" :key="i">
            <div
              v-for="(line, j) in part.value
                .split('\n')
                .filter((l, idx, arr) => !(idx === arr.length - 1 && l === ''))"
              :key="i + '-' + j"
              class="flex"
              :class="{
                'bg-green-50 dark:bg-green-900/20': part.added,
                'bg-red-50 dark:bg-red-900/20': part.removed,
              }"
            >
              <span
                class="w-8 flex-shrink-0 flex items-center justify-center text-xs font-bold border-r border-gray-200 dark:border-gray-700"
                :class="{
                  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400':
                    part.added,
                  'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400':
                    part.removed,
                  'text-gray-300 dark:text-gray-600':
                    !part.added && !part.removed,
                }"
              >
                <span v-if="part.added">+</span>
                <span v-else-if="part.removed">-</span>
              </span>
              <span
                class="px-3 py-1 whitespace-pre flex-1 overflow-x-auto"
                :class="{
                  'text-green-800 dark:text-green-200': part.added,
                  'text-red-800 dark:text-red-200': part.removed,
                  'text-gray-700 dark:text-gray-300':
                    !part.added && !part.removed,
                }"
                >{{ line }}</span
              >
            </div>
          </template>
        </div>

        <!-- Words mode -->
        <div
          v-else
          class="p-4 font-mono text-sm leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words"
        >
          <template v-for="(seg, i) in wordDiffSegments(diffResult)" :key="i">
            <span
              :class="{
                'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded px-0.5':
                  seg.added,
                'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded px-0.5 line-through':
                  seg.removed,
              }"
              >{{ seg.text }}</span
            >
          </template>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!originalText && !modifiedText" class="p-12 text-center card">
        <FileText
          class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
        />
        <p class="text-gray-500 dark:text-gray-400">
          {{ t("tools.textDiff.emptyState") }}
        </p>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.textDiff.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.textDiff.infoLinesLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.textDiff.infoLines") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.textDiff.infoWordsLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.textDiff.infoWords") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.textDiff.infoDiffLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.textDiff.infoDiff") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.textDiff.infoUsageLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.textDiff.infoUsage") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
