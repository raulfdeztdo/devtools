import { watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const BASE_URL = "https://devtoolset.netlify.app";

/**
 * Composable to manage dynamic SEO meta tags per route.
 *
 * Usage inside any view's <script setup>:
 *   useSeoMeta({ titleKey: 'tools.jsonlint.title', descriptionKey: 'tools.jsonlint.description' })
 *
 * Or in App.vue to handle lang + canonical updates globally.
 */
export function useSeoMeta({ titleKey, descriptionKey } = {}) {
  const route = useRoute();
  const { t, locale } = useI18n();

  function setMeta(title, description) {
    const fullTitle = title
      ? `${title} | DevToolset`
      : "DevToolset — Developer Tools Online";
    const desc = description || t("seo.defaultDescription");
    const canonical = `${BASE_URL}${route.path}`;

    // Title
    document.title = fullTitle;

    // Canonical
    setOrCreate("link", "canonical", "rel", "href", canonical);

    // Meta description
    setOrCreateMeta("name", "description", desc);
    setOrCreateMeta("name", "title", fullTitle);

    // Open Graph
    setOrCreateMeta("property", "og:title", fullTitle);
    setOrCreateMeta("property", "og:description", desc);
    setOrCreateMeta("property", "og:url", canonical);
    setOrCreateMeta(
      "property",
      "og:locale",
      locale.value === "es" ? "es_ES" : "en_US",
    );

    // Twitter
    setOrCreateMeta("name", "twitter:title", fullTitle);
    setOrCreateMeta("name", "twitter:description", desc);
    setOrCreateMeta("name", "twitter:url", canonical);

    // HTML lang attribute
    document.documentElement.lang = locale.value;
  }

  function update() {
    const title = titleKey ? t(titleKey) : null;
    const description = descriptionKey ? t(descriptionKey) : null;
    setMeta(title, description);
  }

  // React to route and locale changes
  watch([() => route.path, locale], update, { immediate: true });

  return { setMeta };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function setOrCreateMeta(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOrCreate(tag, id, attrName, attrValue, value) {
  let el = document.querySelector(`${tag}[${attrName}="${id}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attrName, id);
    document.head.appendChild(el);
  }
  el.setAttribute(attrValue, value);
}
