<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
    FileSearch, ShieldCheck, GitCompare, Fingerprint, KeyRound, Clock,
    FileCode, Globe, Palette, Braces, Hash, KeySquare, Code2, FileJson,
    FileType2, FileCode2, Regex, Database, Minimize2, BookOpen, AlignLeft,
    Repeat2, Type, ScanText, QrCode, Timer, UserSearch, Image, Info,
} from 'lucide-vue-next'

const { t } = useI18n()

const categories = [
    { id: 'all', nameKey: 'categories.all' },
    { id: 'json', nameKey: 'categories.json' },
    { id: 'encoding', nameKey: 'categories.encoding' },
    { id: 'formatting', nameKey: 'categories.formatting' },
    { id: 'generators', nameKey: 'categories.generators' },
    { id: 'web', nameKey: 'categories.web' },
    { id: 'text', nameKey: 'categories.text' },
]

const tools = [
    { path: '/jsonlint', nameKey: 'tools.jsonlint.name', descKey: 'tools.jsonlint.description', icon: FileSearch, category: 'json' },
    { path: '/json-schema-validator', nameKey: 'tools.schemaValidator.name', descKey: 'tools.schemaValidator.description', icon: ShieldCheck, category: 'json' },
    { path: '/json-compare', nameKey: 'tools.jsonCompare.name', descKey: 'tools.jsonCompare.description', icon: GitCompare, category: 'json' },
    { path: '/yaml-json', nameKey: 'tools.yamlJson.name', descKey: 'tools.yamlJson.description', icon: FileJson, category: 'json' },
    { path: '/toml-json', nameKey: 'tools.tomlJson.name', descKey: 'tools.tomlJson.description', icon: FileType2, category: 'json' },
    { path: '/xml-json', nameKey: 'tools.xmlJson.name', descKey: 'tools.xmlJson.description', icon: FileCode2, category: 'json' },
    { path: '/base64-converter', nameKey: 'tools.base64.name', descKey: 'tools.base64.description', icon: FileCode, category: 'encoding' },
    { path: '/hash-generator', nameKey: 'tools.hashGenerator.name', descKey: 'tools.hashGenerator.description', icon: Hash, category: 'encoding' },
    { path: '/jwt-decoder', nameKey: 'tools.jwtDecoder.name', descKey: 'tools.jwtDecoder.description', icon: KeySquare, category: 'encoding' },
    { path: '/html-entity-encoder', nameKey: 'tools.htmlEntityEncoder.name', descKey: 'tools.htmlEntityEncoder.description', icon: Code2, category: 'encoding' },
    { path: '/php-serializer', nameKey: 'tools.phpSerializer.name', descKey: 'tools.phpSerializer.description', icon: Braces, category: 'encoding' },
    { path: '/regex-tester', nameKey: 'tools.regexTester.name', descKey: 'tools.regexTester.description', icon: Regex, category: 'formatting' },
    { path: '/sql-formatter', nameKey: 'tools.sqlFormatter.name', descKey: 'tools.sqlFormatter.description', icon: Database, category: 'formatting' },
    { path: '/css-js-minifier', nameKey: 'tools.cssJsMinifier.name', descKey: 'tools.cssJsMinifier.description', icon: Minimize2, category: 'formatting' },
    { path: '/markdown-preview', nameKey: 'tools.markdownPreview.name', descKey: 'tools.markdownPreview.description', icon: BookOpen, category: 'formatting' },
    { path: '/uuid-generator', nameKey: 'tools.uuid.name', descKey: 'tools.uuid.description', icon: Fingerprint, category: 'generators' },
    { path: '/password-generator', nameKey: 'tools.password.name', descKey: 'tools.password.description', icon: KeyRound, category: 'generators' },
    { path: '/lorem-ipsum', nameKey: 'tools.loremIpsum.name', descKey: 'tools.loremIpsum.description', icon: AlignLeft, category: 'generators' },
    { path: '/cron-parser', nameKey: 'tools.cronParser.name', descKey: 'tools.cronParser.description', icon: Timer, category: 'generators' },
    { path: '/qr-generator', nameKey: 'tools.qrGenerator.name', descKey: 'tools.qrGenerator.description', icon: QrCode, category: 'generators' },
    { path: '/timestamp-converter', nameKey: 'tools.timestamp.name', descKey: 'tools.timestamp.description', icon: Clock, category: 'generators' },
    { path: '/url-converter', nameKey: 'tools.url.name', descKey: 'tools.url.description', icon: Globe, category: 'web' },
    { path: '/http-status-codes', nameKey: 'tools.httpStatusCodes.name', descKey: 'tools.httpStatusCodes.description', icon: Info, category: 'web' },
    { path: '/user-agent-parser', nameKey: 'tools.userAgentParser.name', descKey: 'tools.userAgentParser.description', icon: UserSearch, category: 'web' },
    { path: '/favicon-generator', nameKey: 'tools.faviconGenerator.name', descKey: 'tools.faviconGenerator.description', icon: Image, category: 'web' },
    { path: '/color-palette-generator', nameKey: 'tools.colorPalette.name', descKey: 'tools.colorPalette.description', icon: Palette, category: 'web' },
    { path: '/text-diff', nameKey: 'tools.textDiff.name', descKey: 'tools.textDiff.description', icon: Repeat2, category: 'text' },
    { path: '/case-converter', nameKey: 'tools.caseConverter.name', descKey: 'tools.caseConverter.description', icon: Type, category: 'text' },
    { path: '/string-counter', nameKey: 'tools.stringCounter.name', descKey: 'tools.stringCounter.description', icon: ScanText, category: 'text' },
]

const activeCategory = ref('all')

const filteredTools = computed(() => {
    if (activeCategory.value === 'all') return tools
    return tools.filter(tool => tool.category === activeCategory.value)
})

const toolsByCategory = computed(() => {
    if (activeCategory.value !== 'all') return null
    const result = {}
    for (const cat of categories.filter(c => c.id !== 'all')) {
        result[cat.id] = tools.filter(t => t.category === cat.id)
    }
    return result
})
</script>

<template>
    <div class="py-10">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Hero Section -->
            <div class="mb-8 text-center">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    {{ t('home.title') }}
                    <span class="text-brand-blue dark:text-brand-blue-lighter">{{ t('home.titleHighlight') }}</span>
                </h2>
                <p class="max-w-2xl mx-auto mt-3 text-base text-gray-500 dark:text-gray-400">
                    {{ t('home.subtitle', { count: tools.length }) }}
                </p>
            </div>

            <!-- Category Filter -->
            <div class="flex flex-wrap justify-center gap-2 mb-8">
                <button
                    v-for="cat in categories"
                    :key="cat.id"
                    @click="activeCategory = cat.id"
                    class="px-4 py-1.5 text-sm font-medium rounded-full border transition-colors duration-200"
                    :class="activeCategory === cat.id
                        ? 'bg-brand-blue text-white border-brand-blue dark:bg-brand-blue dark:border-brand-blue'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50 hover:text-brand-blue dark:bg-night-card dark:text-gray-300 dark:border-night-border dark:hover:border-brand-blue-lighter/50 dark:hover:text-brand-blue-lighter'">
                    {{ t(cat.nameKey) }}
                </button>
            </div>

            <!-- All categories view (grouped) -->
            <template v-if="activeCategory === 'all'">
                <div v-for="cat in categories.filter(c => c.id !== 'all')" :key="cat.id" class="mb-8">
                    <h3 class="mb-3 text-sm font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                        {{ t(cat.nameKey) }}
                    </h3>
                    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        <router-link
                            v-for="tool in toolsByCategory[cat.id]"
                            :key="tool.path"
                            :to="tool.path"
                            class="group flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-xl transition-all duration-200 dark:bg-night-card dark:border-night-border hover:shadow-md hover:border-brand-blue/40 dark:hover:border-brand-blue-lighter/40 hover:-translate-y-0.5">
                            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-blue/5 dark:bg-brand-blue/10">
                                <component :is="tool.icon" class="w-4.5 h-4.5 text-brand-blue dark:text-brand-blue-lighter" />
                            </div>
                            <div>
                                <p class="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{{ t(tool.nameKey) }}</p>
                                <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">{{ t(tool.descKey) }}</p>
                            </div>
                        </router-link>
                    </div>
                </div>
            </template>

            <!-- Filtered view (single category) -->
            <template v-else>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    <router-link
                        v-for="tool in filteredTools"
                        :key="tool.path"
                        :to="tool.path"
                        class="group flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-xl transition-all duration-200 dark:bg-night-card dark:border-night-border hover:shadow-md hover:border-brand-blue/40 dark:hover:border-brand-blue-lighter/40 hover:-translate-y-0.5">
                        <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-blue/5 dark:bg-brand-blue/10">
                            <component :is="tool.icon" class="w-4.5 h-4.5 text-brand-blue dark:text-brand-blue-lighter" />
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{{ t(tool.nameKey) }}</p>
                            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-tight line-clamp-2">{{ t(tool.descKey) }}</p>
                        </div>
                    </router-link>
                </div>
            </template>
        </div>
    </div>
</template>
