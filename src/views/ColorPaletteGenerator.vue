<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  Palette,
  Target,
  Shuffle,
  Download,
  ClipboardCopy,
  BookOpen,
  Eye,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();

useSeoMeta({
  titleKey: "tools.colorPalette.title",
  descriptionKey: "tools.colorPalette.description",
});

const baseColor = ref("#FF6B6B");
const paletteType = ref("monochromatic");
const palette = ref([]);
const colorFormats = ref({
  hex: "#FF6B6B",
  rgb: "rgb(255, 107, 107)",
  hsl: "hsl(0, 100%, 71%)",
});

// --- Color math utility functions ---

function isValidHex(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return null;

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(hsl) {
  const match = hsl.match(/\d+/g);
  if (!match || match.length < 3) return "#000000";

  let h = parseInt(match[0]) / 360;
  let s = parseInt(match[1]) / 100;
  let l = parseInt(match[2]) / 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function calculateContrast(color1, color2) {
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    const sRGB = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// --- Palette generation functions ---

function generateMonochromatic(baseHsl) {
  const colors = [];
  const lightness = [20, 40, 60, baseHsl.l, 80, 90];

  lightness.forEach((l) => {
    colors.push({ h: baseHsl.h, s: baseHsl.s, l });
  });

  return colors;
}

function generateAnalogous(baseHsl) {
  const colors = [];
  const angles = [-60, -30, 0, 30, 60];

  angles.forEach((angle) => {
    const h = (baseHsl.h + angle + 360) % 360;
    colors.push({ h, s: baseHsl.s, l: baseHsl.l });
  });

  return colors;
}

function generateComplementary(baseHsl) {
  const colors = [];
  const complementary = (baseHsl.h + 180) % 360;

  // Base color variations
  colors.push({ h: baseHsl.h, s: baseHsl.s, l: baseHsl.l });
  colors.push({ h: baseHsl.h, s: baseHsl.s, l: Math.max(baseHsl.l - 20, 10) });
  colors.push({ h: baseHsl.h, s: baseHsl.s, l: Math.min(baseHsl.l + 20, 90) });

  // Complementary variations
  colors.push({ h: complementary, s: baseHsl.s, l: baseHsl.l });
  colors.push({
    h: complementary,
    s: baseHsl.s,
    l: Math.max(baseHsl.l - 20, 10),
  });
  colors.push({
    h: complementary,
    s: baseHsl.s,
    l: Math.min(baseHsl.l + 20, 90),
  });

  return colors;
}

function generateTriadic(baseHsl) {
  const colors = [];
  const angles = [0, 120, 240];

  angles.forEach((angle) => {
    const h = (baseHsl.h + angle) % 360;
    colors.push({ h, s: baseHsl.s, l: baseHsl.l });
    colors.push({ h, s: baseHsl.s, l: Math.max(baseHsl.l - 15, 10) });
  });

  return colors;
}

function generateTetradic(baseHsl) {
  const colors = [];
  const angles = [0, 90, 180, 270];

  angles.forEach((angle) => {
    const h = (baseHsl.h + angle) % 360;
    colors.push({ h, s: baseHsl.s, l: baseHsl.l });
  });

  // Add variations
  colors.push({ h: baseHsl.h, s: baseHsl.s, l: Math.max(baseHsl.l - 20, 10) });
  colors.push({ h: baseHsl.h, s: baseHsl.s, l: Math.min(baseHsl.l + 20, 90) });

  return colors;
}

function generateSplitComplementary(baseHsl) {
  const colors = [];
  const complementary = (baseHsl.h + 180) % 360;
  const angles = [0, complementary - 30, complementary + 30];

  angles.forEach((angle) => {
    const h = (angle + 360) % 360;
    colors.push({ h, s: baseHsl.s, l: baseHsl.l });
    colors.push({ h, s: baseHsl.s, l: Math.max(baseHsl.l - 15, 10) });
  });

  return colors;
}

// --- Core logic functions ---

function updateColorFormats(hex) {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  colorFormats.value = {
    hex: hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
}

function generatePalette() {
  const baseHsl = hexToHsl(baseColor.value);
  const colors = [];

  switch (paletteType.value) {
    case "monochromatic":
      colors.push(...generateMonochromatic(baseHsl));
      break;
    case "analogous":
      colors.push(...generateAnalogous(baseHsl));
      break;
    case "complementary":
      colors.push(...generateComplementary(baseHsl));
      break;
    case "triadic":
      colors.push(...generateTriadic(baseHsl));
      break;
    case "tetradic":
      colors.push(...generateTetradic(baseHsl));
      break;
    case "split-complementary":
      colors.push(...generateSplitComplementary(baseHsl));
      break;
  }

  palette.value = colors.map((hsl) => {
    const hex = hslToHex(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
    const rgb = hexToRgb(hex);

    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      contrastWhite: calculateContrast(hex, "#ffffff").toFixed(2),
      contrastBlack: calculateContrast(hex, "#000000").toFixed(2),
    };
  });
}

function updateFromColor() {
  updateColorFormats(baseColor.value);
  generatePalette();
}

function updateFromHex() {
  if (isValidHex(colorFormats.value.hex)) {
    baseColor.value = colorFormats.value.hex;
    updateColorFormats(baseColor.value);
    generatePalette();
  }
}

function updateFromRGB() {
  const hex = rgbToHex(colorFormats.value.rgb);
  if (hex) {
    baseColor.value = hex;
    updateColorFormats(hex);
    generatePalette();
  }
}

function updateFromHSL() {
  const hex = hslToHex(colorFormats.value.hsl);
  if (hex) {
    baseColor.value = hex;
    updateColorFormats(hex);
    generatePalette();
  }
}

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 50) + 50; // 50-100%
  const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%

  const randomColor = hslToHex(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  baseColor.value = randomColor;
  updateColorFormats(randomColor);
  generatePalette();
}

function setAsBaseColor(hex) {
  baseColor.value = hex;
  updateColorFormats(hex);
  generatePalette();
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

function copyPaletteCSS() {
  const cssVars = palette.value
    .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
    .join("\n");

  const css = `:root {\n${cssVars}\n}`;
  copyToClipboard(css);
}

function exportPalette() {
  const data = {
    baseColor: baseColor.value,
    paletteType: paletteType.value,
    colors: palette.value,
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `palette-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  updateColorFormats(baseColor.value);
  generatePalette();
});
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Palette class="inline-block w-5 h-5" />
          {{ t("tools.colorPalette.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("tools.colorPalette.subtitle") }}
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Color Input -->
        <div class="lg:col-span-1">
          <div class="p-6 card">
            <h3
              class="mb-4 text-base font-semibold text-gray-900 dark:text-white"
            >
              <Target class="inline-block w-5 h-5" />
              {{ t("tools.colorPalette.baseColor") }}
            </h3>

            <div class="space-y-4">
              <!-- Color Picker -->
              <div>
                <label
                  for="color-picker"
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.colorPalette.colorPicker") }}
                </label>
                <div class="flex gap-2">
                  <input
                    id="color-picker"
                    v-model="baseColor"
                    type="color"
                    class="w-16 h-10 border border-gray-300 rounded cursor-pointer dark:border-night-border"
                    @input="updateFromColor"
                  />
                  <input
                    v-model="baseColor"
                    type="text"
                    class="flex-1 input-field"
                    placeholder="#FF6B6B"
                    @input="updateFromHex"
                  />
                </div>
              </div>

              <!-- Format Inputs -->
              <div class="space-y-3">
                <div>
                  <label
                    for="hex-input"
                    class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    HEX
                  </label>
                  <input
                    id="hex-input"
                    v-model="colorFormats.hex"
                    type="text"
                    class="w-full font-mono input-field"
                    @input="updateFromHex"
                  />
                </div>

                <div>
                  <label
                    for="rgb-input"
                    class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    RGB
                  </label>
                  <input
                    id="rgb-input"
                    v-model="colorFormats.rgb"
                    type="text"
                    class="w-full font-mono input-field"
                    @input="updateFromRGB"
                  />
                </div>

                <div>
                  <label
                    for="hsl-input"
                    class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    HSL
                  </label>
                  <input
                    id="hsl-input"
                    v-model="colorFormats.hsl"
                    type="text"
                    class="w-full font-mono input-field"
                    @input="updateFromHSL"
                  />
                </div>
              </div>

              <!-- Palette Type -->
              <div>
                <label
                  class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ t("tools.colorPalette.paletteType") }}
                </label>
                <select
                  v-model="paletteType"
                  class="w-full input-field"
                  @change="generatePalette"
                >
                  <option value="monochromatic">
                    {{ t("tools.colorPalette.monochromatic") }}
                  </option>
                  <option value="analogous">
                    {{ t("tools.colorPalette.analogous") }}
                  </option>
                  <option value="complementary">
                    {{ t("tools.colorPalette.complementary") }}
                  </option>
                  <option value="triadic">
                    {{ t("tools.colorPalette.triadic") }}
                  </option>
                  <option value="tetradic">
                    {{ t("tools.colorPalette.tetradic") }}
                  </option>
                  <option value="split-complementary">
                    {{ t("tools.colorPalette.splitComplementary") }}
                  </option>
                </select>
              </div>

              <!-- Random Color -->
              <button @click="generateRandomColor" class="w-full btn-secondary">
                <Shuffle class="inline-block w-4 h-4" />
                {{ t("tools.colorPalette.randomColor") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Generated Palette -->
        <div class="lg:col-span-2">
          <div class="p-6 card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                <Palette class="inline-block w-5 h-5" />
                {{ t("tools.colorPalette.generatedPalette") }}
              </h3>
              <div class="flex gap-2">
                <button
                  @click="exportPalette"
                  class="px-3 py-1 text-sm btn-secondary"
                >
                  <Download class="inline-block w-4 h-4" />
                  {{ t("tools.colorPalette.exportBtn") }}
                </button>
                <button
                  @click="copyPaletteCSS"
                  class="px-3 py-1 text-sm btn-secondary"
                >
                  <ClipboardCopy class="inline-block w-4 h-4" />
                  {{ t("tools.colorPalette.cssBtn") }}
                </button>
              </div>
            </div>

            <div class="grid gap-4">
              <div
                v-for="(color, index) in palette"
                :key="index"
                class="p-4 border border-gray-200 rounded-lg dark:border-night-border"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 border border-gray-300 rounded-lg cursor-pointer dark:border-night-border"
                    :style="{ backgroundColor: color.hex }"
                    @click="setAsBaseColor(color.hex)"
                    :title="t('tools.colorPalette.clickToUse')"
                  ></div>

                  <div class="flex-1 space-y-2">
                    <div
                      class="grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-3 dark:text-gray-300"
                    >
                      <div class="flex items-center gap-2">
                        <span
                          class="w-10 font-medium text-gray-700 dark:text-gray-300"
                          >HEX:</span
                        >
                        <span
                          class="flex-1 px-2 py-1 font-mono bg-gray-100 rounded dark:bg-night-card-inner"
                          >{{ color.hex }}</span
                        >
                        <button
                          @click="copyToClipboard(color.hex)"
                          class="p-1 text-xs btn-secondary"
                          :title="t('tools.colorPalette.copyHex')"
                        >
                          <ClipboardCopy class="inline-block w-4 h-4" />
                        </button>
                      </div>

                      <div class="flex items-center gap-2">
                        <span
                          class="w-10 font-medium text-gray-700 dark:text-gray-300"
                          >RGB:</span
                        >
                        <span
                          class="flex-1 px-2 py-1 font-mono bg-gray-100 rounded dark:bg-night-card-inner"
                          >{{ color.rgb }}</span
                        >
                        <button
                          @click="copyToClipboard(color.rgb)"
                          class="p-1 text-xs btn-secondary"
                          :title="t('tools.colorPalette.copyRgb')"
                        >
                          <ClipboardCopy class="inline-block w-4 h-4" />
                        </button>
                      </div>

                      <div class="flex items-center gap-2">
                        <span
                          class="w-10 font-medium text-gray-700 dark:text-gray-300"
                          >HSL:</span
                        >
                        <span
                          class="flex-1 px-2 py-1 font-mono bg-gray-100 rounded dark:bg-night-card-inner"
                          >{{ color.hsl }}</span
                        >
                        <button
                          @click="copyToClipboard(color.hsl)"
                          class="p-1 text-xs btn-secondary"
                          :title="t('tools.colorPalette.copyHsl')"
                        >
                          <ClipboardCopy class="inline-block w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ t("tools.colorPalette.contrastWhite") }}:
                      {{ color.contrastWhite }} |
                      {{ t("tools.colorPalette.contrastBlack") }}:
                      {{ color.contrastBlack }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Color Harmony Explanation -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <BookOpen class="inline-block w-5 h-5" />
          {{ t("tools.colorPalette.harmonies") }}
        </h3>
        <div
          class="grid gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400"
        >
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.monoLabel")
            }}</span>
            {{ t("tools.colorPalette.monoDesc") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.analogLabel")
            }}</span>
            {{ t("tools.colorPalette.analogDesc") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.compLabel")
            }}</span>
            {{ t("tools.colorPalette.compDesc") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.triadLabel")
            }}</span>
            {{ t("tools.colorPalette.triadDesc") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.tetradLabel")
            }}</span>
            {{ t("tools.colorPalette.tetradDesc") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.splitLabel")
            }}</span>
            {{ t("tools.colorPalette.splitDesc") }}
          </div>
        </div>
      </div>

      <!-- Accessibility Info -->
      <div class="p-6 mt-8 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          <Eye class="inline-block w-5 h-5" />
          {{ t("tools.colorPalette.accessibility") }}
        </h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.aaLabel")
            }}</span>
            {{ t("tools.colorPalette.contrastAA") }}
          </div>
          <div>
            <span class="font-medium text-gray-900 dark:text-white">{{
              t("tools.colorPalette.aaaLabel")
            }}</span>
            {{ t("tools.colorPalette.contrastAAA") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
