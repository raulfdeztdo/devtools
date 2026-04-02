import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

function getDefaultLocale() {
  const saved = localStorage.getItem('locale')
  if (saved) return saved
  const browserLang = navigator.language || navigator.userLanguage || 'es'
  return browserLang.startsWith('es') ? 'es' : 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'es',
  messages: { es, en },
  globalInjection: true
})

export default i18n
