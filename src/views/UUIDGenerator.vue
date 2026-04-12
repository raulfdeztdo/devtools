<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  Fingerprint,
  Shuffle,
  ClipboardCopy,
  Trash2,
  Download,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.uuid.title",
  descriptionKey: "tools.uuid.description",
});

// Estado
const selectedVersion = ref("v7");
const outputFormat = ref("standard");
const batchCount = ref(10);
const generatedUUIDs = ref([]);
const namespace = ref("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
const name = ref("example.com");
const analyzeUUID = ref("");
const uuidAnalysis = ref(null);

// Namespaces predefinidos RFC 4122
const predefinedNamespaces = {
  dns: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  url: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  oid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

// Función para generar UUID v4 (random)
const generateUUIDv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Función para generar UUID v1 (timestamp + MAC)
const generateUUIDv1 = () => {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, "0");
  const clockSeq = (Math.random() * 0x3fff) | 0;
  const node = Array.from({ length: 6 }, () => (Math.random() * 256) | 0)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

  const timeLow = timeHex.substring(4, 12);
  const timeMid = timeHex.substring(0, 4);
  const timeHi = "1" + timeHex.substring(0, 3);
  const clockSeqHi = ((clockSeq >> 8) | 0x80).toString(16).padStart(2, "0");
  const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, "0");

  return `${timeLow}-${timeMid}-${timeHi}-${clockSeqHi}${clockSeqLow}-${node}`;
};

// Función para convertir string a bytes
const stringToBytes = (str) => {
  return new TextEncoder().encode(str);
};

// Función MD5 simplificada (para UUID v3)
const simpleMD5 = async (data) => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Función para generar UUID v7 (timestamp Unix ms + random)
const generateUUIDv7 = () => {
  const now = BigInt(Date.now());
  // 48 bits de timestamp en milisegundos
  const tsHex = now.toString(16).padStart(12, "0");
  // 4 bits de versión (7) + 12 bits random
  const rand12 = ((Math.random() * 0x1000) | 0).toString(16).padStart(3, "0");
  // 2 bits variant (10) + 62 bits random
  const randA = ((Math.random() * 0x3fff) | 0 | 0x8000)
    .toString(16)
    .padStart(4, "0");
  const randB = Array.from({ length: 3 }, () =>
    ((Math.random() * 0x10000) | 0).toString(16).padStart(4, "0"),
  ).join("");

  return `${tsHex.substring(0, 8)}-${tsHex.substring(8, 12)}-7${rand12}-${randA}-${randB}`;
};

// Función SHA-1 (para UUID v5)
const sha1 = async (data) => {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Función para generar UUID v3 (namespace + name con MD5)
const generateUUIDv3 = async () => {
  const data = namespace.value + name.value;
  try {
    const hash = await simpleMD5(data);

    const uuid = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      "3" + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
        hash.substring(18, 20),
      hash.substring(20, 32),
    ].join("-");

    return uuid;
  } catch (error) {
    return generateUUIDv4()
      .replace(/^(.{14})4/, "$13")
      .replace(/^(.{19})[89ab]/, "$18");
  }
};

// Función para generar UUID v5 (namespace + name con SHA-1)
const generateUUIDv5 = async () => {
  const data = namespace.value + name.value;
  try {
    const hash = await sha1(data);

    const uuid = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      "5" + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) +
        hash.substring(18, 20),
      hash.substring(20, 32),
    ].join("-");

    return uuid;
  } catch (error) {
    return generateUUIDv4()
      .replace(/^(.{14})4/, "$15")
      .replace(/^(.{19})[89ab]/, "$18");
  }
};

// Formatear UUID según el formato seleccionado
const formatUUID = (uuid) => {
  switch (outputFormat.value) {
    case "simple":
      return uuid.replace(/-/g, "");
    case "brackets":
      return `{${uuid}}`;
    case "urn":
      return `urn:uuid:${uuid}`;
    case "uppercase":
      return uuid.toUpperCase();
    default:
      return uuid;
  }
};

// Generar un UUID
const generateUUID = async () => {
  let uuid;

  switch (selectedVersion.value) {
    case "v1":
      uuid = generateUUIDv1();
      break;
    case "v3":
      if (!namespace.value || !name.value) {
        alert(t("tools.uuid.namespaceRequired", { version: "v3" }));
        return;
      }
      uuid = await generateUUIDv3();
      break;
    case "v5":
      if (!namespace.value || !name.value) {
        alert(t("tools.uuid.namespaceRequired", { version: "v5" }));
        return;
      }
      uuid = await generateUUIDv5();
      break;
    case "v7":
      uuid = generateUUIDv7();
      break;
    default: // v4
      uuid = generateUUIDv4();
      break;
  }

  generatedUUIDs.value.unshift({
    value: uuid,
    version: selectedVersion.value.toUpperCase(),
    timestamp: new Date().toLocaleString(),
  });
};

// Generar lote de UUIDs
const generateBatch = async () => {
  const count = Math.min(Math.max(1, parseInt(batchCount.value) || 10), 1000);
  for (let i = 0; i < count; i++) {
    await generateUUID();
  }
};

// Limpiar todos los UUIDs
const clearAll = () => {
  generatedUUIDs.value = [];
  analyzeUUID.value = "";
  uuidAnalysis.value = null;
};

// Eliminar UUID específico
const removeUUID = (index) => {
  generatedUUIDs.value.splice(index, 1);
};

// Copiar al portapapeles
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Error al copiar:", err);
  }
};

// Copiar todos los UUIDs
const copyAllToClipboard = async () => {
  const allUUIDs = generatedUUIDs.value
    .map((uuid) => formatUUID(uuid.value))
    .join("\n");
  await copyToClipboard(allUUIDs);
};

// Descargar como archivo
const downloadAsFile = () => {
  const allUUIDs = generatedUUIDs.value
    .map(
      (uuid) =>
        `${formatUUID(uuid.value)} # ${uuid.version} - ${uuid.timestamp}`,
    )
    .join("\n");

  const blob = new Blob([allUUIDs], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `uuids-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Analizar UUID
const analyzeUUIDInfo = () => {
  const uuid = analyzeUUID.value.trim();
  if (!uuid) {
    uuidAnalysis.value = null;
    return;
  }

  const cleanUUID = uuid.replace(/[^0-9a-fA-F-]/g, "");

  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const simpleUuidRegex = /^[0-9a-fA-F]{32}$/;

  let isValid = false;
  let format = t("tools.uuid.unknown");
  let version = t("tools.uuid.unknown");
  let timestamp = null;

  if (uuidRegex.test(cleanUUID)) {
    isValid = true;
    format = t("tools.uuid.standardFormat");

    const versionChar = cleanUUID[14];
    switch (versionChar) {
      case "1":
        version = "v1 (Timestamp + MAC)";
        try {
          const timeLow = cleanUUID.substring(0, 8);
          const timeMid = cleanUUID.substring(9, 13);
          const timeHi = cleanUUID.substring(15, 18);
          const fullTime = timeHi + timeMid + timeLow;
          const timeInt = parseInt(fullTime, 16);
          const unixTime = (timeInt - 0x01b21dd213814000n) / 10000n;
          timestamp = new Date(Number(unixTime)).toLocaleString();
        } catch (e) {
          timestamp = t("tools.uuid.couldNotExtract");
        }
        break;
      case "3":
        version = "v3 (Namespace + Name MD5)";
        break;
      case "4":
        version = "v4 (Random)";
        break;
      case "5":
        version = "v5 (Namespace + Name SHA-1)";
        break;
      case "7":
        version = "v7 (Unix Timestamp ms + Random)";
        try {
          const tsHex = cleanUUID.substring(0, 8) + cleanUUID.substring(9, 13);
          const tsMs = parseInt(tsHex, 16);
          timestamp = new Date(tsMs).toLocaleString();
        } catch (e) {
          timestamp = t("tools.uuid.couldNotExtract");
        }
        break;
      default:
        version = t("tools.uuid.nonStandard", { version: versionChar });
    }
  } else if (simpleUuidRegex.test(cleanUUID)) {
    isValid = true;
    format = t("tools.uuid.simpleFormat");
    const versionChar = cleanUUID[12];
    version = `v${versionChar}`;
  }

  uuidAnalysis.value = {
    valid: isValid,
    format,
    version,
    timestamp,
  };
};
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Fingerprint class="inline-block w-6 h-6 mr-2 align-text-bottom" />
          {{ t("tools.uuid.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ t("tools.uuid.subtitle") }}
        </p>
      </div>

      <!-- Controls -->
      <div class="p-6 mb-6 card">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button @click="generateUUID" class="btn-primary">
              <Shuffle class="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {{ t("tools.uuid.generateUuid") }}
            </button>
            <button @click="generateBatch" class="btn-secondary">
              <ClipboardCopy
                class="inline-block w-4 h-4 mr-1 align-text-bottom"
              />
              {{ t("tools.uuid.generateBatch", { count: batchCount }) }}
            </button>
            <button @click="clearAll" class="btn-secondary">
              <Trash2 class="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {{ t("tools.uuid.clearAll") }}
            </button>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="selectedVersion" class="w-36 text-sm input-field">
              <option value="v1">UUID v1</option>
              <option value="v3">UUID v3</option>
              <option value="v4">UUID v4</option>
              <option value="v5">UUID v5</option>
              <option value="v7">UUID v7 ✦</option>
            </select>
            <select v-model="outputFormat" class="w-40 text-sm input-field">
              <option value="standard">{{ t("tools.uuid.standard") }}</option>
              <option value="simple">{{ t("tools.uuid.simple") }}</option>
              <option value="brackets">{{ t("tools.uuid.brackets") }}</option>
              <option value="urn">{{ t("tools.uuid.urn") }}</option>
              <option value="uppercase">{{ t("tools.uuid.uppercase") }}</option>
            </select>
            <input
              v-model="batchCount"
              type="number"
              min="1"
              max="1000"
              class="w-20 text-sm input-field"
              placeholder="10"
            />
          </div>
        </div>
      </div>

      <!-- Namespace and Name for v3/v5 -->
      <div
        v-if="selectedVersion === 'v3' || selectedVersion === 'v5'"
        class="p-6 mb-6 card"
      >
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {{
            t("tools.uuid.configFor", {
              version: selectedVersion.toUpperCase(),
            })
          }}
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label
              for="namespace-input"
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t("tools.uuid.namespaceUuid") }}
            </label>
            <input
              id="namespace-input"
              v-model="namespace"
              type="text"
              class="input-field"
              placeholder="6ba7b810-9dad-11d1-80b4-00c04fd430c8"
            />
            <div class="flex gap-2 mt-2">
              <button
                @click="namespace = predefinedNamespaces.dns"
                class="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-night-card-inner hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                DNS
              </button>
              <button
                @click="namespace = predefinedNamespaces.url"
                class="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-night-card-inner hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                URL
              </button>
              <button
                @click="namespace = predefinedNamespaces.oid"
                class="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-night-card-inner hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                OID
              </button>
              <button
                @click="namespace = predefinedNamespaces.x500"
                class="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-night-card-inner hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                X500
              </button>
            </div>
          </div>
          <div>
            <label
              for="name-input"
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ t("tools.uuid.nameValue") }}
            </label>
            <input
              id="name-input"
              v-model="name"
              type="text"
              class="input-field"
              placeholder="ejemplo.com"
            />
          </div>
        </div>
      </div>

      <!-- Generated UUIDs Display -->
      <div class="p-6 mb-6 card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{
              t("tools.uuid.generatedUuids", { count: generatedUUIDs.length })
            }}
          </h3>
          <div class="flex gap-2">
            <button
              v-if="generatedUUIDs.length > 0"
              @click="copyAllToClipboard"
              class="px-3 py-1 text-sm text-white transition-colors rounded bg-brand-blue hover:bg-brand-blue-dark"
            >
              <ClipboardCopy
                class="inline-block w-4 h-4 mr-1 align-text-bottom"
              />
              {{ t("tools.uuid.copyAll") }}
            </button>
            <button
              v-if="generatedUUIDs.length > 0"
              @click="downloadAsFile"
              class="px-3 py-1 text-sm text-white transition-colors rounded bg-brand-muted hover:bg-brand-muted-light"
            >
              <Download class="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {{ t("tools.uuid.downloadBtn") }}
            </button>
          </div>
        </div>

        <!-- No UUIDs yet -->
        <div
          v-if="generatedUUIDs.length === 0"
          class="py-12 text-center text-gray-500 dark:text-gray-400"
        >
          <Fingerprint class="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p>{{ t("tools.uuid.clickToGenerate") }}</p>
        </div>

        <!-- UUIDs List -->
        <div v-else class="space-y-3 overflow-y-auto max-h-96">
          <div
            v-for="(uuid, index) in generatedUUIDs"
            :key="index"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-night-card-inner dark:border-night-border"
          >
            <div class="flex-1">
              <code class="font-mono text-sm text-gray-900 dark:text-gray-100">
                {{ formatUUID(uuid.value) }}
              </code>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ uuid.version }} • {{ uuid.timestamp }}
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button
                @click="copyToClipboard(formatUUID(uuid.value))"
                class="p-2 text-gray-600 transition-colors rounded dark:text-gray-400 hover:text-brand-blue hover:bg-gray-100 dark:hover:bg-gray-600"
                :title="t('tools.uuid.copyUuid')"
              >
                <ClipboardCopy class="w-4 h-4" />
              </button>
              <button
                @click="removeUUID(index)"
                class="p-2 text-gray-600 transition-colors rounded dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                :title="t('tools.uuid.deleteUuid')"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- UUID Info -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- UUID Analyzer -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.uuid.analyzer") }}
          </h3>
          <div class="space-y-4">
            <div>
              <label
                for="analyze-input"
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t("tools.uuid.analyzeInput") }}
              </label>
              <input
                id="analyze-input"
                v-model="analyzeUUID"
                type="text"
                class="input-field"
                :placeholder="t('tools.uuid.analyzePlaceholder')"
                @input="analyzeUUIDInfo"
              />
            </div>
            <div v-if="uuidAnalysis" class="space-y-2">
              <div class="text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >{{ t("tools.uuid.version") }}:</span
                >
                <span
                  class="px-2 py-1 ml-2 rounded bg-brand-blue-lightest text-brand-blue"
                  >{{ uuidAnalysis.version }}</span
                >
              </div>
              <div class="text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >{{ t("tools.uuid.formatLabel") }}:</span
                >
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  uuidAnalysis.format
                }}</span>
              </div>
              <div v-if="uuidAnalysis.timestamp" class="text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >{{ t("tools.uuid.timestamp") }}:</span
                >
                <span class="ml-2 text-gray-600 dark:text-gray-400">{{
                  uuidAnalysis.timestamp
                }}</span>
              </div>
              <div class="text-sm">
                <span class="font-medium text-gray-700 dark:text-gray-300"
                  >{{ t("tools.uuid.validLabel") }}:</span
                >
                <span
                  class="ml-2"
                  :class="
                    uuidAnalysis.valid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ uuidAnalysis.valid ? t("common.yes") : t("common.no") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- UUID Information -->
        <div class="p-6 card">
          <h3
            class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
          >
            {{ t("tools.uuid.uuidInfo") }}
          </h3>
          <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span class="font-medium text-gray-900 dark:text-white"
                >UUID v1:</span
              >
              {{ t("tools.uuid.v1desc") }}
            </div>
            <div>
              <span class="font-medium text-gray-900 dark:text-white"
                >UUID v3:</span
              >
              {{ t("tools.uuid.v3desc") }}
            </div>
            <div>
              <span class="font-medium text-gray-900 dark:text-white"
                >UUID v4:</span
              >
              {{ t("tools.uuid.v4desc") }}
            </div>
            <div>
              <span class="font-medium text-gray-900 dark:text-white"
                >UUID v5:</span
              >
              {{ t("tools.uuid.v5desc") }}
            </div>
            <div>
              <span class="font-medium text-gray-900 dark:text-white"
                >UUID v7:</span
              >
              {{ t("tools.uuid.v7desc") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
