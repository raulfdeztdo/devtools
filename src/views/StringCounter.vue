<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { AlignLeft, Trash2, FileText, BarChart2, Info } from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.stringCounter.title",
  descriptionKey: "tools.stringCounter.description",
});

const input = ref("");

// Common English stop words to exclude from frequency count
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "about",
  "into",
  "through",
  "is",
  "it",
  "its",
  "be",
  "as",
  "was",
  "are",
  "were",
  "been",
  "has",
  "have",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "that",
  "this",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "not",
  "no",
  "so",
  "if",
]);

const stats = computed(() => {
  const text = input.value;
  if (!text) return null;

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;

  // Words: split by whitespace, filter empty
  const wordTokens = text.trim()
    ? text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0)
    : [];
  const words = wordTokens.length;

  // Sentences: split by .!? followed by space/end
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  // Lines
  const lines = text.split("\n").length;

  // Paragraphs: separated by double newline
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  // Bytes (UTF-8)
  let bytes = 0;
  try {
    bytes = new TextEncoder().encode(text).length;
  } catch {
    bytes = new Blob([text]).size;
  }

  // Unique words (case-insensitive, stripped of punctuation)
  const cleanWords = wordTokens.map((w) =>
    w.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  const uniqueWords = new Set(cleanWords.filter((w) => w.length > 0)).size;

  // Average word length
  const avgWordLength =
    words > 0
      ? (
          cleanWords
            .filter((w) => w.length > 0)
            .reduce((sum, w) => sum + w.length, 0) / words
        ).toFixed(1)
      : 0;

  // Reading time (200 wpm)
  const readingTimeSec = Math.ceil((words / 200) * 60);
  let readingTime;
  if (readingTimeSec < 60) {
    readingTime = `< 1 min`;
  } else {
    const mins = Math.ceil(readingTimeSec / 60);
    readingTime = `${mins} min`;
  }

  // Top 10 word frequency (exclude stop words)
  const freq = {};
  for (const w of cleanWords) {
    if (w.length > 1 && !STOP_WORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    chars,
    charsNoSpaces,
    words,
    sentences,
    lines,
    paragraphs,
    bytes,
    uniqueWords,
    avgWordLength,
    readingTime,
    topWords,
  };
});

function clearInput() {
  input.value = "";
}

function loadSample() {
  input.value = `The quick brown fox jumps over the lazy dog. This classic sentence is often used for testing purposes. It contains every letter of the alphabet.

Developers frequently need to count words, characters, and sentences in their text. This tool helps with all of those tasks in real time.

Whether you are writing documentation, blog posts, or code comments, knowing the length and complexity of your text can be very useful.`;
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          <BarChart2 class="inline-block w-6 h-6 mr-2 text-brand-orange" />
          {{ t("tools.stringCounter.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.stringCounter.subtitle") }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Input -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              <AlignLeft class="inline-block w-4 h-4 mr-1" />
              {{ t("tools.stringCounter.inputLabel") }}
            </h2>
            <div class="flex gap-2">
              <button
                @click="loadSample"
                class="btn-secondary flex items-center gap-1.5"
              >
                <FileText class="inline-block w-3.5 h-3.5 mr-1" />{{
                  t("tools.stringCounter.loadSample")
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
            rows="20"
            :placeholder="t('tools.stringCounter.inputPlaceholder')"
          ></textarea>
        </div>

        <!-- Stats panel -->
        <div class="space-y-4">
          <!-- Main stats -->
          <div class="p-6 card">
            <h2
              class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
            >
              <BarChart2 class="inline-block w-4 h-4 mr-1" />
              {{ t("tools.stringCounter.statsTitle") }}
            </h2>
            <div v-if="stats" class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.chars.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.charsWithSpaces") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.charsNoSpaces.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.charsNoSpaces") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.words.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.words") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.sentences.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.sentences") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.lines.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.lines") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.paragraphs.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.paragraphs") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.bytes.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.bytes") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.uniqueWords.toLocaleString() }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.uniqueWords") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div
                  class="text-2xl font-bold text-brand-blue dark:text-brand-blue-lighter"
                >
                  {{ stats.avgWordLength }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.avgWordLength") }}
                </div>
              </div>
              <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <div class="text-2xl font-bold text-brand-orange">
                  {{ stats.readingTime }}
                </div>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ t("tools.stringCounter.readingTime") }}
                </div>
              </div>
            </div>
            <div
              v-else
              class="py-8 text-sm text-center text-gray-400 dark:text-gray-500"
            >
              {{ t("tools.stringCounter.emptyState") }}
            </div>
          </div>

          <!-- Word frequency -->
          <div v-if="stats && stats.topWords.length > 0" class="p-6 card">
            <h2
              class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
            >
              {{ t("tools.stringCounter.topWords") }}
            </h2>
            <div class="space-y-2">
              <div
                v-for="([word, count], idx) in stats.topWords"
                :key="word"
                class="flex items-center gap-3"
              >
                <span
                  class="w-5 text-xs font-bold text-center text-gray-400 dark:text-gray-500"
                  >{{ idx + 1 }}</span
                >
                <div
                  class="flex-1 h-6 overflow-hidden rounded-full bg-gray-100 dark:bg-night-card-inner"
                >
                  <div
                    class="h-full rounded-full bg-brand-blue/30 dark:bg-brand-blue/50 transition-all"
                    :style="{
                      width: `${(count / stats.topWords[0][1]) * 100}%`,
                    }"
                  ></div>
                </div>
                <span
                  class="w-24 text-sm font-mono text-gray-800 truncate dark:text-gray-200"
                  >{{ word }}</span
                >
                <span
                  class="w-8 text-xs font-bold text-right text-brand-blue dark:text-brand-blue-lighter"
                  >{{ count }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.stringCounter.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.stringCounter.infoReadingLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.stringCounter.infoReading") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.stringCounter.infoBytesLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.stringCounter.infoBytes") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.stringCounter.infoUniqueLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.stringCounter.infoUnique") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.stringCounter.infoSentenceLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.stringCounter.infoSentence") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
