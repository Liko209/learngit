import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '@/App';
import '@/index.css';
import registerServiceWorker from '@/registerServiceWorker';
import '@/i18n';

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
registerServiceWorker();
