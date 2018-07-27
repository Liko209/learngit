import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ElementQueries from 'css-element-queries/src/ElementQueries';
import qs from 'qs';
import { service } from 'sdk';

import '@/dev';
import { initAll } from '@/init';
import '@/styled/globalStyles';

import App from '@/containers/App';
import registerServiceWorker from './registerServiceWorker';

ElementQueries.listen();

// Switch env when a env params is given
const params = qs.parse(location.search, { ignoreQueryPrefix: true });
if (params.env) {
  const configService: ConfigService = service.ConfigService.getInstance();
  configService.switchEnv(params.env);
}

const MOUNT_NODE = document.getElementById('root') as HTMLElement;

const render = () => {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    MOUNT_NODE,
  );
};
(async function () {
  await initAll();

  render();

  registerServiceWorker();
})();
