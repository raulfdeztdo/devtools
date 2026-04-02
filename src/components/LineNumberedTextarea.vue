<script setup>
import { computed, onMounted, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    spellcheck: { type: [Boolean, String], default: false },
    minHeight: { type: String, default: '20rem' },
    maxHeight: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const gutterRef = ref(null)
const scrollTop = ref(0)

const lineCount = computed(() => {
    // Al menos 1 línea
    return Math.max(1, (props.modelValue?.split('\n').length) || 1)
})

const onInput = (e) => {
    emit('update:modelValue', e.target.value)
}

const onKeyDown = (e) => {
    // Manejar Tab y Shift+Tab para indentación
    if (e.key === 'Tab') {
        e.preventDefault()

        const textarea = textareaRef.value
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value

        // Espacios para indentación (2 espacios como en JSON.stringify)
        const indentSize = 2
        const indent = ' '.repeat(indentSize)

        if (e.shiftKey) {
            // Shift+Tab: Quitar indentación
            if (start === end) {
                // Solo cursor, quitar indentación de la línea actual
                const lineStart = value.lastIndexOf('\n', start - 1) + 1
                const lineEnd = value.indexOf('\n', start)
                const actualLineEnd = lineEnd === -1 ? value.length : lineEnd
                const line = value.substring(lineStart, actualLineEnd)

                // Verificar si la línea comienza con espacios que podemos quitar
                let spacesToRemove = 0
                for (let i = 0; i < Math.min(line.length, indentSize); i++) {
                    if (line[i] === ' ') {
                        spacesToRemove++
                    } else {
                        break
                    }
                }

                if (spacesToRemove > 0) {
                    const newValue = value.substring(0, lineStart) +
                                   line.substring(spacesToRemove) +
                                   value.substring(actualLineEnd)

                    emit('update:modelValue', newValue)

                    // Ajustar posición del cursor
                    setTimeout(() => {
                        const newCursorPos = Math.max(lineStart, start - spacesToRemove)
                        textarea.setSelectionRange(newCursorPos, newCursorPos)
                    })
                }
            } else {
                // Selección: quitar indentación de todas las líneas seleccionadas
                const selectedText = value.substring(start, end)
                const lines = selectedText.split('\n')
                const beforeSelection = value.substring(0, start)
                const afterSelection = value.substring(end)

                // Encontrar el inicio de la primera línea
                const firstLineStart = beforeSelection.lastIndexOf('\n') + 1
                const fullFirstLine = value.substring(firstLineStart, start) + lines[0]

                let modifiedLines = [fullFirstLine, ...lines.slice(1)]
                let totalSpacesRemoved = 0

                modifiedLines = modifiedLines.map((line, index) => {
                    let spacesToRemove = 0
                    for (let i = 0; i < Math.min(line.length, indentSize); i++) {
                        if (line[i] === ' ') {
                            spacesToRemove++
                        } else {
                            break
                        }
                    }

                    if (spacesToRemove > 0) {
                        totalSpacesRemoved += spacesToRemove
                        return line.substring(spacesToRemove)
                    }
                    return line
                })

                const newValue = value.substring(0, firstLineStart) +
                               modifiedLines.join('\n') +
                               afterSelection

                emit('update:modelValue', newValue)

                // Mantener selección ajustada
                setTimeout(() => {
                    const newStart = start - (modifiedLines[0].length - fullFirstLine.length)
                    const newEnd = end - totalSpacesRemoved
                    textarea.setSelectionRange(newStart, newEnd)
                })
            }
        } else {
            // Tab: Agregar indentación
            if (start === end) {
                // Solo cursor: insertar indentación
                const newValue = value.substring(0, start) + indent + value.substring(start)
                emit('update:modelValue', newValue)

                // Mover cursor después de la indentación
                setTimeout(() => {
                    textarea.setSelectionRange(start + indentSize, start + indentSize)
                })
            } else {
                // Selección: indentar todas las líneas seleccionadas
                const selectedText = value.substring(start, end)
                const lines = selectedText.split('\n')
                const beforeSelection = value.substring(0, start)
                const afterSelection = value.substring(end)

                // Encontrar el inicio de la primera línea
                const firstLineStart = beforeSelection.lastIndexOf('\n') + 1
                const fullFirstLine = value.substring(firstLineStart, start) + lines[0]

                const indentedLines = [indent + fullFirstLine, ...lines.slice(1).map(line => indent + line)]

                const newValue = value.substring(0, firstLineStart) +
                               indentedLines.join('\n') +
                               afterSelection

                emit('update:modelValue', newValue)

                // Mantener selección expandida por la indentación
                setTimeout(() => {
                    const newStart = start + indentSize
                    const newEnd = end + (indentSize * lines.length)
                    textarea.setSelectionRange(newStart, newEnd)
                })
            }
        }
    }
}

const onScroll = () => {
    if (textareaRef.value) {
        scrollTop.value = textareaRef.value.scrollTop
        if (gutterRef.value) gutterRef.value.scrollTop = scrollTop.value
    }
}

onMounted(() => {
    onScroll()
})

watch(() => props.modelValue, () => {
    // Mantener scroll en sync si cambia el contenido externamente
    onScroll()
})
</script>

<template>
    <div class="relative flex w-full ln-textarea">
        <!-- Gutter de números de línea -->
        <div ref="gutterRef"
            class="py-2 pl-2 pr-3 overflow-hidden font-mono text-sm leading-6 text-right text-gray-500 border border-r-0 border-gray-300 rounded-l-lg select-none bg-gray-50 dark:bg-night-card-inner dark:border-night-border dark:text-gray-400"
            :style="{ minHeight, maxHeight: maxHeight || undefined }">
            <div :style="{ transform: `translateY(-${scrollTop}px)` }">
                <div v-for="n in lineCount" :key="n">{{ n }}</div>
            </div>
        </div>

        <!-- Área de texto -->
        <textarea ref="textareaRef" v-bind="$attrs" :value="modelValue" :placeholder="placeholder" :readonly="readonly"
            :spellcheck="spellcheck"
            class="flex-1 overflow-auto font-mono text-sm leading-6 text-gray-900 bg-white border border-l-0 border-gray-300 rounded-r-lg resize-y focus:outline-none focus:ring-2 focus:ring-brand-blue dark:bg-night-card-inner dark:text-white dark:border-night-border"
            :style="{ minHeight, maxHeight: maxHeight || undefined }" @input="onInput" @scroll="onScroll" @keydown="onKeyDown"></textarea>
    </div>
</template>

<style scoped>
.ln-textarea textarea {
    /* Evitar que se pueda reducir por debajo del min-height, permitir crecimiento vertical */
    resize: vertical;
}
</style>
