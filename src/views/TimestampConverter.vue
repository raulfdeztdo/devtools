<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  Clock,
  Calendar,
  ClipboardCopy,
  Zap,
  History,
  Info,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.timestamp.title",
  descriptionKey: "tools.timestamp.description",
});

const timestampInput = ref("");
const dateInput = ref("");
const timestampResult = ref({
  local: "",
  utc: "",
  iso: "",
  relative: "",
});
const dateResult = ref({
  seconds: "",
  milliseconds: "",
  iso: "",
});

function convertTimestampToDate() {
  try {
    let timestamp = parseInt(timestampInput.value);
    if (isNaN(timestamp)) {
      timestampResult.value = { local: "", utc: "", iso: "", relative: "" };
      return;
    }

    // Auto-detect if timestamp is in milliseconds (13+ digits) or seconds
    if (timestamp.toString().length > 10) {
      timestamp = Math.floor(timestamp / 1000);
    }

    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
      timestampResult.value = { local: "", utc: "", iso: "", relative: "" };
      return;
    }

    timestampResult.value = {
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative: getRelativeTime(date),
    };
  } catch (error) {
    timestampResult.value = { local: "", utc: "", iso: "", relative: "" };
  }
}

function convertDateToTimestamp() {
  try {
    if (!dateInput.value) {
      dateResult.value = { seconds: "", milliseconds: "", iso: "" };
      return;
    }

    const date = new Date(dateInput.value);

    if (isNaN(date.getTime())) {
      dateResult.value = { seconds: "", milliseconds: "", iso: "" };
      return;
    }

    dateResult.value = {
      seconds: Math.floor(date.getTime() / 1000).toString(),
      milliseconds: date.getTime().toString(),
      iso: date.toISOString(),
    };
  } catch (error) {
    dateResult.value = { seconds: "", milliseconds: "", iso: "" };
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) {
    return diffInSeconds === 0
      ? t("tools.timestamp.relativeNow")
      : t(
          diffInSeconds !== 1
            ? "tools.timestamp.relativeSeconds"
            : "tools.timestamp.relativeSecond",
          { count: diffInSeconds },
        );
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return t(
      minutes !== 1
        ? "tools.timestamp.relativeMinutes"
        : "tools.timestamp.relativeMinute",
      { count: minutes },
    );
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return t(
      hours !== 1
        ? "tools.timestamp.relativeHours"
        : "tools.timestamp.relativeHour",
      { count: hours },
    );
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return t(
      days !== 1
        ? "tools.timestamp.relativeDays"
        : "tools.timestamp.relativeDay",
      { count: days },
    );
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return t(
      months !== 1
        ? "tools.timestamp.relativeMonths"
        : "tools.timestamp.relativeMonth",
      { count: months },
    );
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return t(
      years !== 1
        ? "tools.timestamp.relativeYears"
        : "tools.timestamp.relativeYear",
      { count: years },
    );
  }
}

function useCurrentTimestamp() {
  const now = new Date();
  timestampInput.value = Math.floor(now.getTime() / 1000).toString();
  dateInput.value = formatDateForInput(now);
  convertTimestampToDate();
  convertDateToTimestamp();
}

function setDateBoth(date) {
  timestampInput.value = Math.floor(date.getTime() / 1000).toString();
  dateInput.value = formatDateForInput(date);
  convertTimestampToDate();
  convertDateToTimestamp();
}

function setToday() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  setDateBoth(today);
}

function setYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);
  setDateBoth(yesterday);
}

function setNextWeek() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(12, 0, 0, 0);
  setDateBoth(nextWeek);
}

function setEpoch() {
  const epoch = new Date(0);
  setDateBoth(epoch);
}

function formatDateForInput(date) {
  return date.toISOString().slice(0, 16);
}

function copyTimestampResult() {
  const result = `${t("tools.timestamp.localDate")}: ${timestampResult.value.local}\nUTC: ${timestampResult.value.utc}\nISO 8601: ${timestampResult.value.iso}\n${t("tools.timestamp.relative")}: ${timestampResult.value.relative}`;
  copyToClipboard(result);
}

function copyDateResult() {
  copyToClipboard(dateResult.value.seconds);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  });
}

onMounted(() => {
  useCurrentTimestamp();

  // Set current time for date input
  const now = new Date();
  dateInput.value = formatDateForInput(now);
  convertDateToTimestamp();
});
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Clock class="inline-block w-5 h-5" />
          {{ t("tools.timestamp.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.timestamp.subtitle") }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Timestamp to Date -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            <Calendar class="inline-block w-5 h-5" />
            {{ t("tools.timestamp.timestampToDate") }}
          </h3>

          <div class="space-y-4">
            <div>
              <label
                for="timestamp-input"
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.timestamp.unixTimestamp") }}
              </label>
              <div class="flex gap-2">
                <input
                  id="timestamp-input"
                  v-model="timestampInput"
                  type="text"
                  class="flex-1 input-field"
                  placeholder="1609459200"
                  @input="convertTimestampToDate"
                />
                <button
                  @click="useCurrentTimestamp"
                  class="px-4 py-2 text-sm btn-secondary whitespace-nowrap"
                >
                  {{ t("tools.timestamp.now") }}
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.localDate") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ timestampResult.local || "-" }}
                </div>
              </div>

              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.utc") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ timestampResult.utc || "-" }}
                </div>
              </div>

              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.iso8601") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ timestampResult.iso || "-" }}
                </div>
              </div>

              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.relative") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ timestampResult.relative || "-" }}
                </div>
              </div>
            </div>

            <button
              v-if="timestampResult.local"
              @click="copyTimestampResult"
              class="w-full btn-secondary"
            >
              <ClipboardCopy class="inline-block w-4 h-4" />
              {{ t("tools.timestamp.copyResult") }}
            </button>
          </div>
        </div>

        <!-- Date to Timestamp -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            <Clock class="inline-block w-5 h-5" />
            {{ t("tools.timestamp.dateToTimestamp") }}
          </h3>

          <div class="space-y-4">
            <div>
              <label
                for="date-input"
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.timestamp.dateTime") }}
              </label>
              <input
                id="date-input"
                v-model="dateInput"
                type="datetime-local"
                class="w-full input-field"
                @input="convertDateToTimestamp"
              />
            </div>

            <div class="space-y-3">
              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.seconds") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ dateResult.seconds || "-" }}
                </div>
              </div>

              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.milliseconds") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ dateResult.milliseconds || "-" }}
                </div>
              </div>

              <div class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner">
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.timestamp.iso8601") }}
                </label>
                <div class="font-mono text-lg text-gray-900 dark:text-white">
                  {{ dateResult.iso || "-" }}
                </div>
              </div>
            </div>

            <button
              v-if="dateResult.seconds"
              @click="copyDateResult"
              class="w-full btn-secondary"
            >
              <ClipboardCopy class="inline-block w-4 h-4" />
              {{ t("tools.timestamp.copyTimestamp") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <Zap class="inline-block w-5 h-5" />
          {{ t("tools.timestamp.quickActions") }}
        </h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            @click="setToday"
            class="p-4 text-center transition-colors border border-gray-200 rounded-lg dark:border-night-border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="mb-2 text-brand-blue dark:text-brand-orange">
              <Calendar class="inline-block w-6 h-6" />
            </div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.timestamp.today") }}
            </div>
          </button>

          <button
            @click="setYesterday"
            class="p-4 text-center transition-colors border border-gray-200 rounded-lg dark:border-night-border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="mb-2 text-brand-blue dark:text-brand-orange">
              <Calendar class="inline-block w-6 h-6" />
            </div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.timestamp.yesterday") }}
            </div>
          </button>

          <button
            @click="setNextWeek"
            class="p-4 text-center transition-colors border border-gray-200 rounded-lg dark:border-night-border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="mb-2 text-brand-blue dark:text-brand-orange">
              <Calendar class="inline-block w-6 h-6" />
            </div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.timestamp.nextWeek") }}
            </div>
          </button>

          <button
            @click="setEpoch"
            class="p-4 text-center transition-colors border border-gray-200 rounded-lg dark:border-night-border hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="mb-2 text-brand-blue dark:text-brand-orange">
              <History class="inline-block w-6 h-6" />
            </div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("tools.timestamp.unixEpoch") }}
            </div>
          </button>
        </div>
      </div>

      <!-- Information -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <Info class="inline-block w-5 h-5" /> {{ t("tools.timestamp.info") }}
        </h3>
        <div
          class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400"
        >
          <div>
            <span class="font-medium text-gray-900 dark:text-white"
              >{{ t("tools.timestamp.timestampLabel") }}:</span
            >
            {{ t("tools.timestamp.infoTimestamp") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white"
              >{{ t("tools.timestamp.epochLabel") }}:</span
            >
            {{ t("tools.timestamp.infoEpoch") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white"
              >{{ t("tools.timestamp.precisionLabel") }}:</span
            >
            {{ t("tools.timestamp.infoPrecision") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white"
              >{{ t("tools.timestamp.timezoneLabel") }}:</span
            >
            {{ t("tools.timestamp.infoTimezone") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
