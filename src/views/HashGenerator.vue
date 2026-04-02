<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Hash, ClipboardCopy, CheckCircle, ShieldCheck, Trash2, Info } from 'lucide-vue-next'
import LineNumberedTextarea from '../components/LineNumberedTextarea.vue'

const { t } = useI18n()

// ── pure-JS MD5 implementation ──────────────────────────────────────────────
function md5(inputStr) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)) }
  function md5cmn(q, a, b, x, s, t2) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t2)), s), b) }
  function md5ff(a, b, c, d, x, s, t2) { return md5cmn((b & c) | (~b & d), a, b, x, s, t2) }
  function md5gg(a, b, c, d, x, s, t2) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t2) }
  function md5hh(a, b, c, d, x, s, t2) { return md5cmn(b ^ c ^ d, a, b, x, s, t2) }
  function md5ii(a, b, c, d, x, s, t2) { return md5cmn(c ^ (b | ~d), a, b, x, s, t2) }

  function str2binl(str) {
    const bin = []
    const mask = (1 << 8) - 1
    for (let i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
    return bin
  }

  function binl2hex(binarray) {
    const hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
             hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf)
    }
    return str
  }

  function core_md5(x, len) {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = md5ff(a,b,c,d,x[i+ 0], 7,-680876936);  d = md5ff(d,a,b,c,x[i+ 1],12,-389564586)
      c = md5ff(c,d,a,b,x[i+ 2],17, 606105819);  b = md5ff(b,c,d,a,x[i+ 3],22,-1044525330)
      a = md5ff(a,b,c,d,x[i+ 4], 7,-176418897);  d = md5ff(d,a,b,c,x[i+ 5],12,1200080426)
      c = md5ff(c,d,a,b,x[i+ 6],17,-1473231341); b = md5ff(b,c,d,a,x[i+ 7],22,-45705983)
      a = md5ff(a,b,c,d,x[i+ 8], 7,1770035416);  d = md5ff(d,a,b,c,x[i+ 9],12,-1958414417)
      c = md5ff(c,d,a,b,x[i+10],17,-42063);       b = md5ff(b,c,d,a,x[i+11],22,-1990404162)
      a = md5ff(a,b,c,d,x[i+12], 7,1804603682);  d = md5ff(d,a,b,c,x[i+13],12,-40341101)
      c = md5ff(c,d,a,b,x[i+14],17,-1502002290); b = md5ff(b,c,d,a,x[i+15],22,1236535329)
      a = md5gg(a,b,c,d,x[i+ 1], 5,-165796510);  d = md5gg(d,a,b,c,x[i+ 6], 9,-1069501632)
      c = md5gg(c,d,a,b,x[i+11],14, 643717713);  b = md5gg(b,c,d,a,x[i+ 0],20,-373897302)
      a = md5gg(a,b,c,d,x[i+ 5], 5,-701558691);  d = md5gg(d,a,b,c,x[i+10], 9,38016083)
      c = md5gg(c,d,a,b,x[i+15],14,-660478335);  b = md5gg(b,c,d,a,x[i+ 4],20,-405537848)
      a = md5gg(a,b,c,d,x[i+ 9], 5, 568446438);  d = md5gg(d,a,b,c,x[i+14], 9,-1019803690)
      c = md5gg(c,d,a,b,x[i+ 3],14,-187363961);  b = md5gg(b,c,d,a,x[i+ 8],20,1163531501)
      a = md5gg(a,b,c,d,x[i+13], 5,-1444681467); d = md5gg(d,a,b,c,x[i+ 2], 9,-51403784)
      c = md5gg(c,d,a,b,x[i+ 7],14,1735328473);  b = md5gg(b,c,d,a,x[i+12],20,-1926607734)
      a = md5hh(a,b,c,d,x[i+ 5], 4,-378558);     d = md5hh(d,a,b,c,x[i+ 8],11,-2022574463)
      c = md5hh(c,d,a,b,x[i+11],16, 1839030562); b = md5hh(b,c,d,a,x[i+14],23,-35309556)
      a = md5hh(a,b,c,d,x[i+ 1], 4,-1530992060); d = md5hh(d,a,b,c,x[i+ 4],11,1272893353)
      c = md5hh(c,d,a,b,x[i+ 7],16,-155497632);  b = md5hh(b,c,d,a,x[i+10],23,-1094730640)
      a = md5hh(a,b,c,d,x[i+13], 4, 681279174);  d = md5hh(d,a,b,c,x[i+ 0],11,-358537222)
      c = md5hh(c,d,a,b,x[i+ 3],16,-722521979);  b = md5hh(b,c,d,a,x[i+ 6],23,76029189)
      a = md5hh(a,b,c,d,x[i+ 9], 4,-640364487);  d = md5hh(d,a,b,c,x[i+12],11,-421815835)
      c = md5hh(c,d,a,b,x[i+15],16, 530742520);  b = md5hh(b,c,d,a,x[i+ 2],23,-995338651)
      a = md5ii(a,b,c,d,x[i+ 0], 6,-198630844);  d = md5ii(d,a,b,c,x[i+ 7],10,1126891415)
      c = md5ii(c,d,a,b,x[i+14],15,-1416354905); b = md5ii(b,c,d,a,x[i+ 5],21,-57434055)
      a = md5ii(a,b,c,d,x[i+12], 6, 1700485571); d = md5ii(d,a,b,c,x[i+ 3],10,-1894986606)
      c = md5ii(c,d,a,b,x[i+10],15,-1051523);    b = md5ii(b,c,d,a,x[i+ 1],21,-2054922799)
      a = md5ii(a,b,c,d,x[i+ 8], 6,1873313359);  d = md5ii(d,a,b,c,x[i+15],10,-30611744)
      c = md5ii(c,d,a,b,x[i+ 6],15,-1560198380); b = md5ii(b,c,d,a,x[i+13],21,1309151649)
      a = md5ii(a,b,c,d,x[i+ 4], 6,-145523070);  d = md5ii(d,a,b,c,x[i+11],10,-1120210379)
      c = md5ii(c,d,a,b,x[i+ 2],15, 718787259);  b = md5ii(b,c,d,a,x[i+ 9],21,-343485551)
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  // Encode UTF-8
  const utf8Str = unescape(encodeURIComponent(inputStr))
  return binl2hex(core_md5(str2binl(utf8Str), utf8Str.length * 8))
}

// ── SHA helpers via Web Crypto ────────────────────────────────────────────
async function shaDigest(algorithm, text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── State ─────────────────────────────────────────────────────────────────
const inputText = ref('')
const hashes = ref({ md5: '', sha1: '', sha256: '', sha512: '' })
const copied = ref(null)
const isComputing = ref(false)

// ── Compute all hashes ────────────────────────────────────────────────────
async function computeHashes() {
  if (!inputText.value) {
    hashes.value = { md5: '', sha1: '', sha256: '', sha512: '' }
    return
  }
  isComputing.value = true
  const [sha1, sha256, sha512] = await Promise.all([
    shaDigest('SHA-1', inputText.value),
    shaDigest('SHA-256', inputText.value),
    shaDigest('SHA-512', inputText.value),
  ])
  hashes.value = {
    md5: md5(inputText.value),
    sha1,
    sha256,
    sha512,
  }
  isComputing.value = false
}

function clearAll() {
  inputText.value = ''
  hashes.value = { md5: '', sha1: '', sha256: '', sha512: '' }
  copied.value = null
}

async function copyHash(algo, value) {
  await navigator.clipboard.writeText(value).catch(() => {})
  copied.value = algo
  setTimeout(() => { copied.value = null }, 2000)
}

const hashRows = computed(() => [
  { algo: 'MD5',     key: 'md5',    value: hashes.value.md5 },
  { algo: 'SHA-1',   key: 'sha1',   value: hashes.value.sha1 },
  { algo: 'SHA-256', key: 'sha256', value: hashes.value.sha256 },
  { algo: 'SHA-512', key: 'sha512', value: hashes.value.sha512 },
])
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <Hash class="inline-block w-5 h-5" /> {{ t('tools.hashGenerator.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('tools.hashGenerator.subtitle') }}
        </p>
      </div>

      <!-- Input card -->
      <div class="p-6 mb-6 card">
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('tools.hashGenerator.inputLabel') }}
          </label>
          <LineNumberedTextarea
            v-model="inputText"
            minHeight="8rem"
            :placeholder="t('tools.hashGenerator.placeholder')"
            @input="computeHashes"
          />
        </div>

        <div class="flex gap-3">
          <button class="btn-primary" @click="computeHashes" :disabled="isComputing">
            <Hash class="inline-block w-4 h-4 mr-1" />
            {{ t('tools.hashGenerator.compute') }}
          </button>
          <button class="btn-secondary" @click="clearAll">
            <Trash2 class="inline-block w-4 h-4 mr-1" />
            {{ t('common.clear') }}
          </button>
        </div>
      </div>

      <!-- Hashes results -->
      <div class="p-6 card">
        <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {{ t('tools.hashGenerator.allHashes') }}
        </h3>

        <div class="space-y-4">
          <div
            v-for="row in hashRows"
            :key="row.key"
            class="p-4 rounded-lg bg-gray-50 dark:bg-night-card-inner"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-brand-blue dark:text-brand-blue-lighter">
                {{ row.algo }}
              </span>
              <button
                v-if="row.value"
                class="p-1 btn-secondary"
                :title="t('common.copy')"
                @click="copyHash(row.key, row.value)"
              >
                <CheckCircle v-if="copied === row.key" class="inline-block w-4 h-4 text-green-400" />
                <ClipboardCopy v-else class="inline-block w-4 h-4" />
              </button>
            </div>
            <div
              v-if="row.value"
              class="font-mono text-xs break-all text-gray-800 dark:text-gray-200"
            >
              {{ row.value }}
            </div>
            <div v-else class="text-xs text-gray-400 dark:text-gray-500 italic">
              —
            </div>
          </div>
        </div>
      </div>

      <!-- Security notice -->
      <div class="flex items-start gap-3 p-4 mt-6 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
        <ShieldCheck class="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
        <p class="text-sm text-green-800 dark:text-green-300">
          {{ t('tools.hashGenerator.securityNotice') }}
        </p>
      </div>

      <!-- Info -->
      <div class="p-6 mt-8 card">
        <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Info class="w-4 h-4" /> {{ t('tools.hashGenerator.infoTitle') }}
        </h2>
        <div class="grid gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.hashGenerator.infoMd5Label') }}</div>
            <p class="text-xs">{{ t('tools.hashGenerator.infoMd5') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.hashGenerator.infoSha1Label') }}</div>
            <p class="text-xs">{{ t('tools.hashGenerator.infoSha1') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.hashGenerator.infoSha256Label') }}</div>
            <p class="text-xs">{{ t('tools.hashGenerator.infoSha256') }}</p>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 dark:bg-night-card-inner">
            <div class="font-medium text-gray-900 dark:text-white mb-1">{{ t('tools.hashGenerator.infoSha512Label') }}</div>
            <p class="text-xs">{{ t('tools.hashGenerator.infoSha512') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
