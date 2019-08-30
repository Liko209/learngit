import i18next from 'i18next';
// use this function to disable reaction checking
// since when error happens, check reaction will change nothing but just throw errors
// so disable it.
import { promisedComputedInternal } from 'computed-async-mobx/built/src/promisedComputed';

function hasLoadedNamespace() {
  const lng = i18next.languages[0];
  const fallbackLng = i18next.options ? i18next.options.fallbackLng : false;
  const lastLng = i18next.languages[i18next.languages.length - 1];
  const ns = (i18next.options && i18next.options.defaultNS) || 'translation';

  const loadNotPending = (l: string, n: string) => {
    const loadState = i18next.services.backendConnector.state[`${l}|${n}`];
    return loadState === -1 || loadState === 2;
  };

  // failed loading ns - but at least fallback is not pending -> SEMI SUCCESS
  if (
    loadNotPending(lng, ns) &&
    (!fallbackLng || loadNotPending(lastLng, ns))
  ) {
    return true;
  }

  return false;
}

function i18nT(key: string, options?: i18next.TOptions | string) {
  if (i18next.isInitialized && hasLoadedNamespace()) {
    return i18next.t(key, options);
  }

  return new Promise((resolve: (value: string) => void) => {
    // FIXME: If we try to fetch it very early, loaded event never emit.
    i18next.on('loaded', () => {
      resolve(i18next.t(key, options));
    });
  });
}

function i18nP(key: string, options?: i18next.TOptions | string): string {
  if (i18next.isInitialized && hasLoadedNamespace()) {
    return i18next.t(key, options);
  }
  return promisedComputedInternal('', async () => await i18nT(key, options)).get();
}

export type i18nTValueProps = string | Promise<string>;

export { i18nP };

export default i18nT;
