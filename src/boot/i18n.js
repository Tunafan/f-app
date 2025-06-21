import { find } from 'lodash';
import { Quasar } from 'quasar';
import languages from 'quasar/lang/index.json';
// eslint-disable-next-line import/no-unresolved
import en from 'src/i18n/en';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

const datetimeFormats = {
  en: {
    short: {
      year: 'numeric', month: 'short', day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
};

const locale = 'en';

const i18n = createI18n({
  locale,
  fallbackLocale: 'en',
  silentFallbackWarn: true,
  messages: {
    en,
  },
  datetimeFormats,
  numberFormats,
  globalInjection: true,
  mode: 'legacy',
});
const i18nGlobal = i18n.global;

export default ({ app }) => {
  app.use(i18n);
  /*
  * We use config assignment alongside app.use() as a workaround for
  *  the "$t is not a function" error inside async
  * @see https://github.com/intlify/vue-i18n-next/issues/990#issuecomment-1123565067
  * */
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$t = i18n.global.t;
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$te = i18n.global.te;
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$tc = i18n.global.tc;
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$tm = i18n.global.tm;
};

const loadedLanguages = ['en'];

function setI18nLanguage(lang) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = lang;
  } else {
    i18n.global.locale.value = lang;
  }

  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

function findQuasarLang(lang) {
  return find(languages, { isoName: lang });
}

export async function loadLanguageAsync(lang) {
  const quasarLang = findQuasarLang(lang) || findQuasarLang('en-US');

  try {
    await import(`quasar/lang/${quasarLang.isoName}`)
      .then((loadedLang) => {
        if (lang === 'nl') {
          // eslint-disable-next-line no-param-reassign
          loadedLang.default.table.recordsPerPage = 'Registraties per pagina';
        }

        Quasar.lang.set(loadedLang.default);
      });
  } catch (err) {
    // Requested Quasar Language Pack does not exist,
    // let's not break the app, so catching error
    console.error(`Language pack wasn't found for ${lang}`, err.message);
  }

  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang));
  }

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang));
  }
  // If the language hasn't been loaded yet
  return import(/* webpackChunkName: "lang-[request]" */ `src/i18n/${lang}/index.js`).then(
    async (messages) => {
      i18n.global.setLocaleMessage(lang, messages.default);
      loadedLanguages.push(lang);
      await setI18nLanguage(lang);
      return nextTick();
    },
  );
}

export { i18nGlobal as i18n };