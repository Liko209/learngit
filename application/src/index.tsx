import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '@/App';
import { upgradeHandler } from '@/upgrade';
import registerServiceWorker from '@/registerServiceWorker';
import { initAll } from '@/init';

import '@/index.css';
import '@/i18n';
import { generalErrorHandler } from './utils/error';

window.addEventListener('error', (event: ErrorEvent) => {
  generalErrorHandler(event.error);
});

(async function () {
  try {
    await initAll();

    ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);

    registerServiceWorker(
      (swURL: string) => {
        upgradeHandler.setServiceWorkerURL(swURL);
      },
      () => {
        upgradeHandler.onNewContentAvailable();
      },
    );
  } catch (error) {
    generalErrorHandler(error);
  }
})();
