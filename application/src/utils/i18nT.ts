import i18next from 'i18next';

function i18nT(key: string) {
  if (i18next.isInitialized) {
    return i18next.t(key);
  }

  return new Promise((resolve: (value: string) => void) => {
    i18next.on('loaded', () => {
      resolve(i18next.t(key));
    });
  });
}

export default i18nT;
