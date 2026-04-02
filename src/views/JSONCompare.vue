<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GitCompare, Search, Paintbrush, Trash2, ArrowLeftRight, AlertTriangle } from 'lucide-vue-next';
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue';

const { t } = useI18n();

const leftJSON = ref('');
const rightJSON = ref('');
const compared = ref(false);
const ignoreWhitespace = ref(false);
const error = ref('');
const diffResult = ref({ left: [], right: [] });
const stats = ref({ additions: 0, deletions: 0, modifications: 0, changes: 0 });

// Longest Common Subsequence algorithm for diff
function lcs(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp;
}

// Build diff from LCS
function buildDiff(arr1, arr2, dp) {
    let i = arr1.length;
    let j = arr2.length;
    const result = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
            result.unshift({ type: 'equal', left: i - 1, right: j - 1 });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.unshift({ type: 'insert', right: j - 1 });
            j--;
        } else if (i > 0) {
            result.unshift({ type: 'delete', left: i - 1 });
            i--;
        }
    }

    return result;
}

// Detect modified lines and group changes
function detectModifiedLines(diff, leftLines, rightLines) {
    const processed = [];
    let i = 0;

    while (i < diff.length) {
        const current = diff[i];

        if (current.type === 'equal') {
            processed.push(current);
            i++;
        } else if (current.type === 'delete') {
            // Look ahead for consecutive deletes and inserts
            const deletes = [];
            const inserts = [];
            let j = i;

            // Collect consecutive deletes
            while (j < diff.length && diff[j].type === 'delete') {
                deletes.push(diff[j]);
                j++;
            }

            // Collect consecutive inserts
            while (j < diff.length && diff[j].type === 'insert') {
                inserts.push(diff[j]);
                j++;
            }

            // If we have both deletes and inserts, try to pair them as modifications
            if (deletes.length > 0 && inserts.length > 0) {
                const minLength = Math.min(deletes.length, inserts.length);

                // Pair deletes and inserts as modifications
                for (let k = 0; k < minLength; k++) {
                    processed.push({
                        type: 'modify',
                        left: deletes[k].left,
                        right: inserts[k].right
                    });
                }

                // Handle remaining deletes
                for (let k = minLength; k < deletes.length; k++) {
                    processed.push(deletes[k]);
                }

                // Handle remaining inserts
                for (let k = minLength; k < inserts.length; k++) {
                    processed.push(inserts[k]);
                }

                i = j;
            } else if (deletes.length > 0) {
                // Only deletes
                processed.push(...deletes);
                i = j;
            } else {
                i++;
            }
        } else if (current.type === 'insert') {
            // Handle standalone inserts
            const inserts = [];
            while (i < diff.length && diff[i].type === 'insert') {
                inserts.push(diff[i]);
                i++;
            }
            processed.push(...inserts);
        } else {
            processed.push(current);
            i++;
        }
    }

    return processed;
}

// Compare JSON
function compareJSON() {
    error.value = '';

    try {
        // Validate both JSONs
        let leftObj, rightObj;

        try {
            leftObj = JSON.parse(leftJSON.value);
        } catch (e) {
            throw new Error(t('tools.jsonCompare.invalidOriginal') + e.message);
        }

        try {
            rightObj = JSON.parse(rightJSON.value);
        } catch (e) {
            throw new Error(t('tools.jsonCompare.invalidModified') + e.message);
        }

        // Format JSONs
        const leftFormatted = JSON.stringify(leftObj, null, 2);
        const rightFormatted = JSON.stringify(rightObj, null, 2);

        // Split into lines
        let leftLines = leftFormatted.split('\n');
        let rightLines = rightFormatted.split('\n');

        // Optionally ignore whitespace
        if (ignoreWhitespace.value) {
            leftLines = leftLines.map(l => l.trim());
            rightLines = rightLines.map(l => l.trim());
        }

        // Calculate LCS
        const dp = lcs(leftLines, rightLines);
        const diff = buildDiff(leftLines, rightLines, dp);

        // Detect modified lines
        const processedDiff = detectModifiedLines(diff, leftLines, rightLines);

        // Build display arrays
        const leftDisplay = [];
        const rightDisplay = [];
        let additions = 0;
        let deletions = 0;
        let modifications = 0;

        processedDiff.forEach(item => {
            if (item.type === 'equal') {
                leftDisplay.push({
                    type: 'equal',
                    content: leftLines[item.left],
                    lineNumber: item.left + 1
                });
                rightDisplay.push({
                    type: 'equal',
                    content: rightLines[item.right],
                    lineNumber: item.right + 1
                });
            } else if (item.type === 'modify') {
                leftDisplay.push({
                    type: 'modify',
                    content: leftLines[item.left],
                    lineNumber: item.left + 1
                });
                rightDisplay.push({
                    type: 'modify',
                    content: rightLines[item.right],
                    lineNumber: item.right + 1
                });
                modifications++;
            } else if (item.type === 'delete') {
                leftDisplay.push({
                    type: 'delete',
                    content: leftLines[item.left],
                    lineNumber: item.left + 1
                });
                rightDisplay.push({
                    type: 'empty',
                    content: '',
                    lineNumber: ''
                });
                deletions++;
            } else if (item.type === 'insert') {
                leftDisplay.push({
                    type: 'empty',
                    content: '',
                    lineNumber: ''
                });
                rightDisplay.push({
                    type: 'insert',
                    content: rightLines[item.right],
                    lineNumber: item.right + 1
                });
                additions++;
            }
        });

        diffResult.value = { left: leftDisplay, right: rightDisplay };
        stats.value = {
            additions,
            deletions,
            modifications,
            changes: additions + deletions + modifications
        };
        compared.value = true;

    } catch (e) {
        error.value = e.message;
    }
}

// Format both JSONs
function formatBoth() {
    error.value = '';

    try {
        if (leftJSON.value.trim()) {
            const leftObj = JSON.parse(leftJSON.value);
            leftJSON.value = JSON.stringify(leftObj, null, 2);
        }
    } catch (e) {
        error.value = t('tools.jsonCompare.formatOriginalError') + e.message;
    }

    try {
        if (rightJSON.value.trim()) {
            const rightObj = JSON.parse(rightJSON.value);
            rightJSON.value = JSON.stringify(rightObj, null, 2);
        }
    } catch (e) {
        error.value = (error.value ? error.value + '\n' : '') + t('tools.jsonCompare.formatModifiedError') + e.message;
    }
}

// Clear all inputs
function clearAll() {
    leftJSON.value = '';
    rightJSON.value = '';
    compared.value = false;
    error.value = '';
    diffResult.value = { left: [], right: [] };
    stats.value = { additions: 0, deletions: 0, modifications: 0, changes: 0 };
}

// Swap inputs
function swapInputs() {
    const temp = leftJSON.value;
    leftJSON.value = rightJSON.value;
    rightJSON.value = temp;
    if (compared.value) {
        compareJSON();
    }
}
</script>

<template>
    <div class="py-8">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8 text-center">
                <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    <GitCompare class="inline-block w-5 h-5" /> {{ t('tools.jsonCompare.title') }}
                </h1>
                <p class="text-gray-600 dark:text-gray-300">
                    {{ t('tools.jsonCompare.subtitle') }}
                </p>
            </div>

            <!-- Controls -->
            <div class="p-6 mb-6 card">
                <div class="flex flex-wrap items-center gap-3">
                    <button @click="compareJSON" class="btn-primary">
                        <Search class="inline-block w-4 h-4" /> {{ t('tools.jsonCompare.compare') }}
                    </button>
                    <button @click="formatBoth" class="btn-secondary">
                        <Paintbrush class="inline-block w-4 h-4" /> {{ t('tools.jsonCompare.formatBoth') }}
                    </button>
                    <button @click="clearAll" class="btn-secondary">
                        <Trash2 class="inline-block w-4 h-4" /> {{ t('tools.jsonCompare.clearAll') }}
                    </button>
                    <button @click="swapInputs" class="btn-secondary">
                        <ArrowLeftRight class="inline-block w-4 h-4" /> {{ t('tools.jsonCompare.swap') }}
                    </button>
                    <label class="flex items-center space-x-2 ml-auto text-gray-700 dark:text-gray-300">
                        <input type="checkbox" v-model="ignoreWhitespace"
                            class="border-gray-300 rounded text-brand-blue focus:ring-brand-blue">
                        <span class="text-sm">{{ t('tools.jsonCompare.ignoreWhitespace') }}</span>
                    </label>
                </div>
            </div>

            <!-- Comparison View -->
            <div v-if="!compared" class="grid gap-6 lg:grid-cols-2">
                <!-- Left JSON Input -->
                <div class="p-6 card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.jsonCompare.originalJson') }}</h3>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {{ leftJSON.length }} {{ t('common.characters') }}
                        </span>
                    </div>
                    <LineNumberedTextarea v-model="leftJSON" class="textarea-field" :minHeight="'32rem'"
                        :placeholder="t('tools.jsonCompare.leftPlaceholder')" :spellcheck="false" />
                </div>

                <!-- Right JSON Input -->
                <div class="p-6 card">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.jsonCompare.modifiedJson') }}</h3>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {{ rightJSON.length }} {{ t('common.characters') }}
                        </span>
                    </div>
                    <LineNumberedTextarea v-model="rightJSON" class="textarea-field" :minHeight="'32rem'"
                        :placeholder="t('tools.jsonCompare.rightPlaceholder')" :spellcheck="false" />
                </div>
            </div>

            <!-- Diff Result View -->
            <div v-else>
                <!-- Stats -->
                <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-4">
                    <div class="p-4 card bg-green-50 dark:bg-green-900/20">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.additions }}</div>
                        <div class="text-sm text-green-700 dark:text-green-300">{{ t('tools.jsonCompare.linesAdded') }}</div>
                    </div>
                    <div class="p-4 card bg-red-50 dark:bg-red-900/20">
                        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.deletions }}</div>
                        <div class="text-sm text-red-700 dark:text-red-300">{{ t('tools.jsonCompare.linesDeleted') }}</div>
                    </div>
                    <div class="p-4 card bg-yellow-50 dark:bg-yellow-900/20">
                        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.modifications }}</div>
                        <div class="text-sm text-yellow-700 dark:text-yellow-300">{{ t('tools.jsonCompare.linesModified') }}</div>
                    </div>
                    <div class="p-4 card bg-blue-50 dark:bg-blue-900/20">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.changes }}</div>
                        <div class="text-sm text-blue-700 dark:text-blue-300">{{ t('tools.jsonCompare.totalChanges') }}</div>
                    </div>
                </div>

                <!-- Diff Display -->
                <div class="card">
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-night-border">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('tools.jsonCompare.comparison') }}</h3>
                        <button @click="compared = false" class="btn-secondary">
                            {{ t('tools.jsonCompare.backToEdit') }}
                        </button>
                    </div>

                    <div class="grid lg:grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                        <!-- Left side (Original) -->
                        <div class="overflow-x-auto">
                            <div class="p-4 bg-gray-100 dark:bg-night-card-inner border-b border-gray-200 dark:border-night-border">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.jsonCompare.original') }}</h4>
                            </div>
                            <div class="font-mono text-sm">
                                <div v-for="(line, index) in diffResult.left" :key="'left-' + index"
                                    class="flex hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    :class="{
                                        'bg-red-50 dark:bg-red-900/20': line.type === 'delete',
                                        'bg-yellow-50 dark:bg-yellow-900/20': line.type === 'modify',
                                        'bg-gray-100 dark:bg-night-card-inner/50': line.type === 'equal',
                                        'bg-transparent': line.type === 'empty'
                                    }">
                                    <span class="inline-block w-12 px-2 text-right text-gray-500 dark:text-gray-500 select-none border-r border-gray-300 dark:border-night-border flex-shrink-0"
                                        :class="{
                                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': line.type === 'delete',
                                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400': line.type === 'modify'
                                        }">
                                        {{ line.lineNumber }}
                                    </span>
                                    <span class="inline-block w-8 px-1 text-center flex-shrink-0"
                                        :class="{
                                            'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300': line.type === 'delete',
                                            'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300': line.type === 'modify'
                                        }">
                                        <span v-if="line.type === 'delete'">-</span>
                                        <span v-else-if="line.type === 'modify'">~</span>
                                    </span>
                                    <span class="flex-1 px-2 py-1 whitespace-pre overflow-x-auto"
                                        :class="{
                                            'text-gray-800 dark:text-gray-200': line.type === 'equal' || line.type === 'delete' || line.type === 'modify',
                                            'text-transparent': line.type === 'empty'
                                        }">{{ line.content }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Right side (Modified) -->
                        <div class="overflow-x-auto">
                            <div class="p-4 bg-gray-100 dark:bg-night-card-inner border-b border-gray-200 dark:border-night-border">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('tools.jsonCompare.modified') }}</h4>
                            </div>
                            <div class="font-mono text-sm">
                                <div v-for="(line, index) in diffResult.right" :key="'right-' + index"
                                    class="flex hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    :class="{
                                        'bg-green-50 dark:bg-green-900/20': line.type === 'insert',
                                        'bg-yellow-50 dark:bg-yellow-900/20': line.type === 'modify',
                                        'bg-gray-100 dark:bg-night-card-inner/50': line.type === 'equal',
                                        'bg-transparent': line.type === 'empty'
                                    }">
                                    <span class="inline-block w-12 px-2 text-right text-gray-500 dark:text-gray-500 select-none border-r border-gray-300 dark:border-night-border flex-shrink-0"
                                        :class="{
                                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': line.type === 'insert',
                                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400': line.type === 'modify'
                                        }">
                                        {{ line.lineNumber }}
                                    </span>
                                    <span class="inline-block w-8 px-1 text-center flex-shrink-0"
                                        :class="{
                                            'bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-300': line.type === 'insert',
                                            'bg-yellow-200 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300': line.type === 'modify'
                                        }">
                                        <span v-if="line.type === 'insert'">+</span>
                                        <span v-else-if="line.type === 'modify'">~</span>
                                    </span>
                                    <span class="flex-1 px-2 py-1 whitespace-pre overflow-x-auto"
                                        :class="{
                                            'text-gray-800 dark:text-gray-200': line.type === 'equal' || line.type === 'insert' || line.type === 'modify',
                                            'text-transparent': line.type === 'empty'
                                        }">{{ line.content }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="p-4 mt-6 border border-red-200 rounded-lg card bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div class="flex items-start">
                    <AlertTriangle class="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div class="ml-3">
                        <h3 class="font-semibold text-red-800 dark:text-red-200">{{ t('common.error') }}</h3>
                        <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
