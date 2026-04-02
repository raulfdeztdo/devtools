<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
    Sun,
    Moon,
    Menu,
    X,
    ChevronDown,
    FileSearch,
    ShieldCheck,
    GitCompare,
    Fingerprint,
    KeyRound,
    Clock,
    FileCode,
    Globe,
    Palette,
    Braces,
    Github,
    Hash,
    KeySquare,
    Code2,
    FileJson,
    FileType2,
    FileCode2,
    Regex,
    Database,
    Minimize2,
    BookOpen,
    AlignLeft,
    Repeat2,
    Type,
    ScanText,
    QrCode,
    Timer,
    UserSearch,
    Image,
    Info,
} from "lucide-vue-next";

const route = useRoute();
const { t, locale } = useI18n();

// Category definitions
const categories = [
    { id: "all", nameKey: "categories.all" },
    { id: "json", nameKey: "categories.json" },
    { id: "encoding", nameKey: "categories.encoding" },
    { id: "formatting", nameKey: "categories.formatting" },
    { id: "generators", nameKey: "categories.generators" },
    { id: "web", nameKey: "categories.web" },
    { id: "text", nameKey: "categories.text" },
];

// Tool definitions with category
const tools = [
    // JSON
    { path: "/jsonlint", name: "tools.jsonlint.name", icon: FileSearch, category: "json" },
    { path: "/json-schema-validator", name: "tools.schemaValidator.name", icon: ShieldCheck, category: "json" },
    { path: "/json-compare", name: "tools.jsonCompare.name", icon: GitCompare, category: "json" },
    { path: "/yaml-json", name: "tools.yamlJson.name", icon: FileJson, category: "json" },
    { path: "/toml-json", name: "tools.tomlJson.name", icon: FileType2, category: "json" },
    { path: "/xml-json", name: "tools.xmlJson.name", icon: FileCode2, category: "json" },
    // Encoding
    { path: "/base64-converter", name: "tools.base64.name", icon: FileCode, category: "encoding" },
    { path: "/hash-generator", name: "tools.hashGenerator.name", icon: Hash, category: "encoding" },
    { path: "/jwt-decoder", name: "tools.jwtDecoder.name", icon: KeySquare, category: "encoding" },
    { path: "/html-entity-encoder", name: "tools.htmlEntityEncoder.name", icon: Code2, category: "encoding" },
    { path: "/php-serializer", name: "tools.phpSerializer.name", icon: Braces, category: "encoding" },
    // Formatting
    { path: "/regex-tester", name: "tools.regexTester.name", icon: Regex, category: "formatting" },
    { path: "/sql-formatter", name: "tools.sqlFormatter.name", icon: Database, category: "formatting" },
    { path: "/css-js-minifier", name: "tools.cssJsMinifier.name", icon: Minimize2, category: "formatting" },
    { path: "/markdown-preview", name: "tools.markdownPreview.name", icon: BookOpen, category: "formatting" },
    // Generators
    { path: "/uuid-generator", name: "tools.uuid.name", icon: Fingerprint, category: "generators" },
    { path: "/password-generator", name: "tools.password.name", icon: KeyRound, category: "generators" },
    { path: "/lorem-ipsum", name: "tools.loremIpsum.name", icon: AlignLeft, category: "generators" },
    { path: "/cron-parser", name: "tools.cronParser.name", icon: Timer, category: "generators" },
    { path: "/qr-generator", name: "tools.qrGenerator.name", icon: QrCode, category: "generators" },
    { path: "/timestamp-converter", name: "tools.timestamp.name", icon: Clock, category: "generators" },
    // Web
    { path: "/url-converter", name: "tools.url.name", icon: Globe, category: "web" },
    { path: "/http-status-codes", name: "tools.httpStatusCodes.name", icon: Info, category: "web" },
    { path: "/user-agent-parser", name: "tools.userAgentParser.name", icon: UserSearch, category: "web" },
    { path: "/favicon-generator", name: "tools.faviconGenerator.name", icon: Image, category: "web" },
    { path: "/color-palette-generator", name: "tools.colorPalette.name", icon: Palette, category: "web" },
    // Text
    { path: "/text-diff", name: "tools.textDiff.name", icon: Repeat2, category: "text" },
    { path: "/case-converter", name: "tools.caseConverter.name", icon: Type, category: "text" },
    { path: "/string-counter", name: "tools.stringCounter.name", icon: ScanText, category: "text" },
];

const toolsByCategory = computed(() => {
    const result = {};
    for (const cat of categories.filter(c => c.id !== "all")) {
        result[cat.id] = tools.filter(tool => tool.category === cat.id);
    }
    return result;
});

const isToolRoute = computed(() => {
    return tools.some((t) => t.path === route.path);
});

// UI state
const isDark = ref(false);
const showDropdown = ref(false);
const showMobileMenu = ref(false);
let dropdownTimeout = null;

const handleDropdownEnter = () => {
    if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        dropdownTimeout = null;
    }
    showDropdown.value = true;
};

const handleDropdownLeave = () => {
    dropdownTimeout = setTimeout(() => {
        showDropdown.value = false;
    }, 150);
};

const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateTheme();
};

const updateTheme = () => {
    if (isDark.value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
};

const toggleLocale = () => {
    locale.value = locale.value === "es" ? "en" : "es";
    localStorage.setItem("locale", locale.value);
};

onMounted(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    isDark.value = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    updateTheme();

    const savedLocale = localStorage.getItem("locale");
    if (savedLocale) {
        locale.value = savedLocale;
    }
});
</script>

<template>
    <div class="flex flex-col min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-night-bg">
        <!-- Header -->
        <header
            class="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl dark:bg-night-bg/80 dark:border-night-border/60">
            <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo / Title -->
                    <router-link to="/" class="group flex items-center gap-2">
                        <span
                            class="font-mono text-lg font-bold tracking-tight text-brand-blue dark:text-brand-blue-lighter transition-colors group-hover:text-brand-orange dark:group-hover:text-brand-orange-light">
                            &lt;/devTools&gt;
                        </span>
                    </router-link>

                    <!-- Desktop Navigation -->
                    <div class="items-center hidden gap-1 md:flex">
                        <nav class="flex items-center gap-1">
                            <!-- Home Link -->
                            <router-link to="/"
                                class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                :class="{ 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/60': $route.path === '/' }">
                                {{ t('nav.home') }}
                            </router-link>

                            <!-- Tools Dropdown -->
                            <div class="relative" @mouseleave="handleDropdownLeave">
                                <button @mouseenter="handleDropdownEnter" @click="showDropdown = !showDropdown"
                                    class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                    :class="{ 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/60': isToolRoute }">
                                    <span>{{ t('nav.tools') }}</span>
                                    <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200"
                                        :class="{ 'rotate-180': showDropdown }" />
                                </button>

                                <!-- Dropdown Menu — grouped by category -->
                                <Transition enter-active-class="transition duration-150 ease-out"
                                    enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                                    leave-active-class="transition duration-100 ease-in"
                                    leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
                                    <div v-show="showDropdown" @mouseenter="handleDropdownEnter"
                                        @mouseleave="handleDropdownLeave"
                                        class="absolute left-0 z-50 mt-2 origin-top-left bg-white border border-gray-200/80 rounded-xl shadow-xl dark:bg-night-card dark:border-night-border/80 top-full ring-1 ring-black/5 dark:ring-white/5 overflow-y-auto"
                                        style="width: 480px; max-height: 70vh;">
                                        <div class="p-2 grid grid-cols-2 gap-x-2">
                                            <template v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id">
                                                <div class="mb-2">
                                                    <div class="px-2 pt-1 pb-1 text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                                                        {{ t(cat.nameKey) }}
                                                    </div>
                                                    <router-link v-for="tool in toolsByCategory[cat.id]" :key="tool.path"
                                                        :to="tool.path"
                                                        @click="showDropdown = false"
                                                        class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                                        :class="{
                                                            'bg-brand-blue/5 text-brand-blue dark:bg-brand-blue/10 dark:text-brand-blue-lighter': $route.path === tool.path,
                                                        }">
                                                        <span class="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                                                            :class="{ 'bg-brand-blue/10 dark:bg-brand-blue/20': $route.path === tool.path }">
                                                            <component :is="tool.icon" class="w-3.5 h-3.5" />
                                                        </span>
                                                        <span class="font-medium text-xs leading-tight">{{ t(tool.name) }}</span>
                                                    </router-link>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </nav>

                        <!-- Separator -->
                        <div class="w-px h-5 mx-2 bg-gray-200 dark:bg-gray-700"></div>

                        <!-- Theme Toggle -->
                        <button @click="toggleTheme"
                            class="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                            :title="isDark ? t('nav.lightMode') : t('nav.darkMode')">
                            <Sun v-if="isDark" class="w-4.5 h-4.5" />
                            <Moon v-else class="w-4.5 h-4.5" />
                        </button>

                        <!-- Language Switcher -->
                        <button @click="toggleLocale"
                            class="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 text-xs font-bold">
                            {{ locale.toUpperCase() }}
                        </button>
                    </div>

                    <!-- Mobile Controls -->
                    <div class="flex items-center gap-1 md:hidden">
                        <button @click="toggleTheme"
                            class="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                            :title="isDark ? t('nav.lightMode') : t('nav.darkMode')">
                            <Sun v-if="isDark" class="w-5 h-5" />
                            <Moon v-else class="w-5 h-5" />
                        </button>

                        <!-- Language Switcher (Mobile) -->
                        <button @click="toggleLocale"
                            class="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 text-xs font-bold">
                            {{ locale.toUpperCase() }}
                        </button>

                        <button @click="showMobileMenu = !showMobileMenu"
                            class="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60">
                            <Menu v-if="!showMobileMenu" class="w-5 h-5" />
                            <X v-else class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Menu — grouped by category -->
                <Transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="-translate-y-2 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-2 opacity-0">
                    <div v-show="showMobileMenu" class="pb-4 border-t border-gray-200/60 dark:border-night-border/60 md:hidden max-h-[70vh] overflow-y-auto">
                        <div class="pt-3 space-y-1">
                            <router-link to="/" @click="showMobileMenu = false"
                                class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                :class="{ 'text-brand-blue dark:text-brand-blue-lighter bg-brand-blue/5 dark:bg-brand-blue/10': $route.path === '/' }">
                                {{ t('nav.home') }}
                            </router-link>

                            <template v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id">
                                <div class="px-3 pt-3 pb-1">
                                    <span class="text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                                        {{ t(cat.nameKey) }}
                                    </span>
                                </div>
                                <router-link v-for="tool in toolsByCategory[cat.id]" :key="tool.path" :to="tool.path"
                                    @click="showMobileMenu = false"
                                    class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                    :class="{
                                        'text-brand-blue dark:text-brand-blue-lighter bg-brand-blue/5 dark:bg-brand-blue/10': $route.path === tool.path,
                                    }">
                                    <span class="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800">
                                        <component :is="tool.icon" class="w-4 h-4" />
                                    </span>
                                    <span class="font-medium">{{ t(tool.name) }}</span>
                                </router-link>
                            </template>
                        </div>
                    </div>
                </Transition>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1">
            <router-view />
        </main>

        <!-- Footer -->
        <footer class="py-6 mt-auto border-t border-gray-200/60 dark:border-gray-800/60">
            <div class="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('footer.madeBy') }}
                    <a href="https://raulfdez.dev/" target="_blank" rel="noopener noreferrer"
                        class="font-medium text-brand-blue hover:text-brand-orange dark:text-brand-blue-lighter dark:hover:text-brand-orange-light transition-colors">
                        raulfdeztdo
                    </a>
                    · &copy; {{ new Date().getFullYear() }} ·
                    <a href="https://github.com/raulfdeztdo/devtools" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 font-medium text-brand-blue hover:text-brand-orange dark:text-brand-blue-lighter dark:hover:text-brand-orange-light transition-colors">
                        <Github class="w-4 h-4" />
                        {{ t('footer.openSource') }}
                    </a>
                </p>
            </div>
        </footer>
    </div>
</template>
