<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  KeySquare,
  ClipboardCopy,
  ShieldAlert,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-vue-next";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.jwtDecoder.title",
  descriptionKey: "tools.jwtDecoder.description",
});

const tokenInput = ref("");
const decodeError = ref("");
const decoded = ref(null);
const copied = ref(null);

// ── base64url decode ──────────────────────────────────────────────────────
function base64urlDecode(str) {
  // Pad and convert base64url to base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return atob(padded);
}

function parseJwt(token) {
  const parts = token.trim().split(".");
  if (parts.length !== 3)
    throw new Error("Invalid JWT structure (expected 3 parts)");
  const headerJson = base64urlDecode(parts[0]);
  const payloadJson = base64urlDecode(parts[1]);
  return {
    header: JSON.parse(headerJson),
    payload: JSON.parse(payloadJson),
    signature: parts[2],
  };
}

function decodeToken() {
  decodeError.value = "";
  decoded.value = null;
  if (!tokenInput.value.trim()) return;
  try {
    decoded.value = parseJwt(tokenInput.value);
  } catch (e) {
    decodeError.value = e.message;
  }
}

watch(tokenInput, decodeToken);

// ── Expiration helpers ────────────────────────────────────────────────────
const expStatus = computed(() => {
  if (!decoded.value?.payload?.exp) return null;
  const now = Math.floor(Date.now() / 1000);
  const exp = decoded.value.payload.exp;
  if (exp < now) return { expired: true, label: t("tools.jwtDecoder.expired") };
  const diff = exp - now;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return {
    expired: false,
    label: `${t("tools.jwtDecoder.expiresIn")} ${parts.join(" ")}`,
  };
});

const issuedAt = computed(() => {
  if (!decoded.value?.payload?.iat) return null;
  return new Date(decoded.value.payload.iat * 1000).toLocaleString();
});

async function copy(text, key) {
  await navigator.clipboard.writeText(text).catch(() => {});
  copied.value = key;
  setTimeout(() => {
    copied.value = null;
  }, 2000);
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <KeySquare class="inline-block w-5 h-5" />
          {{ t("tools.jwtDecoder.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.jwtDecoder.subtitle") }}
        </p>
      </div>

      <!-- Token input -->
      <div class="p-6 mb-6 card">
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ t("tools.jwtDecoder.tokenLabel") }}
        </label>
        <LineNumberedTextarea
          v-model="tokenInput"
          minHeight="6rem"
          :placeholder="t('tools.jwtDecoder.placeholder')"
        />

        <!-- Error -->
        <div
          v-if="decodeError"
          class="flex items-center gap-2 p-3 mt-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
        >
          <AlertTriangle
            class="w-4 h-4 text-red-500 dark:text-red-400 shrink-0"
          />
          <span class="text-sm text-red-700 dark:text-red-300">{{
            decodeError
          }}</span>
        </div>
      </div>

      <!-- Decoded sections -->
      <div v-if="decoded" class="grid gap-6 lg:grid-cols-3">
        <!-- Header -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h3
              class="text-sm font-semibold text-brand-blue dark:text-brand-blue-lighter uppercase tracking-wider"
            >
              {{ t("tools.jwtDecoder.header") }}
            </h3>
            <button
              class="p-1 btn-secondary"
              :title="t('common.copy')"
              @click="copy(prettyJson(decoded.header), 'header')"
            >
              <CheckCircle
                v-if="copied === 'header'"
                class="w-4 h-4 text-green-400"
              />
              <ClipboardCopy v-else class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48"
            >{{ prettyJson(decoded.header) }}</pre
          >
        </div>

        <!-- Payload -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h3
              class="text-sm font-semibold text-brand-blue dark:text-brand-blue-lighter uppercase tracking-wider"
            >
              {{ t("tools.jwtDecoder.payload") }}
            </h3>
            <button
              class="p-1 btn-secondary"
              :title="t('common.copy')"
              @click="copy(prettyJson(decoded.payload), 'payload')"
            >
              <CheckCircle
                v-if="copied === 'payload'"
                class="w-4 h-4 text-green-400"
              />
              <ClipboardCopy v-else class="w-4 h-4" />
            </button>
          </div>
          <pre
            class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-48"
            >{{ prettyJson(decoded.payload) }}</pre
          >

          <!-- Claims info -->
          <div class="mt-3 space-y-1.5">
            <div v-if="expStatus" class="flex items-center gap-2 text-xs">
              <Clock
                class="w-3.5 h-3.5 shrink-0"
                :class="expStatus.expired ? 'text-red-500' : 'text-green-500'"
              />
              <span
                :class="
                  expStatus.expired
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                "
              >
                {{ expStatus.label }}
              </span>
            </div>
            <div
              v-if="issuedAt"
              class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <Clock class="w-3.5 h-3.5 shrink-0" />
              <span>{{ t("tools.jwtDecoder.issuedAt") }}: {{ issuedAt }}</span>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-3">
            <h3
              class="text-sm font-semibold text-brand-blue dark:text-brand-blue-lighter uppercase tracking-wider"
            >
              {{ t("tools.jwtDecoder.signature") }}
            </h3>
            <button
              class="p-1 btn-secondary"
              :title="t('common.copy')"
              @click="copy(decoded.signature, 'sig')"
            >
              <CheckCircle
                v-if="copied === 'sig'"
                class="w-4 h-4 text-green-400"
              />
              <ClipboardCopy v-else class="w-4 h-4" />
            </button>
          </div>
          <div
            class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner text-xs font-mono text-gray-800 dark:text-gray-200 break-all max-h-48 overflow-auto"
          >
            {{ decoded.signature }}
          </div>
        </div>
      </div>

      <!-- Security notice -->
      <div
        class="flex items-start gap-3 p-4 mt-6 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
      >
        <ShieldAlert
          class="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0"
        />
        <p class="text-sm text-amber-800 dark:text-amber-300">
          {{ t("tools.jwtDecoder.securityNotice") }}
        </p>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2
          class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Info class="w-4 h-4" /> {{ t("tools.jwtDecoder.infoTitle") }}
        </h2>
        <div
          class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4"
        >
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.jwtDecoder.infoStructureLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.jwtDecoder.infoStructure") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.jwtDecoder.infoClaimsLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.jwtDecoder.infoClaims") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.jwtDecoder.infoSecurityLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.jwtDecoder.infoSecurity") }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">
              {{ t("tools.jwtDecoder.infoUsageLabel") }}
            </div>
            <p class="text-xs">{{ t("tools.jwtDecoder.infoUsage") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
