/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import * as React from 'react';
import { observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import { container } from 'framework';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import ThemeProvider from '@/containers/ThemeProvider';
import history from '@/history';
import { analytics } from '@/Analytics';
import { AboutView } from '@/containers/About';
import { generalErrorHandler } from '@/utils/error';
import { Router } from '@/modules/router';
import { Upgrade } from '@/modules/service-worker';
import { TopBanner } from '../TopBanner';
import { AppStore } from '../../store';
import { Title } from './Title';
import { ElectronBadgeWithAppUmi } from './ElectronBadgeWithAppUmi';
import config from '@/config';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

@observer
class App extends React.Component {
  // TODO use @lazyInject(Upgrade)
  private _upgradeHandler: Upgrade = container.get(Upgrade);
  private _appStore: AppStore = container.get(AppStore);
  private _unListenHistory: VoidFunction;

  componentDidCatch(error: Error) {
    generalErrorHandler(error);
  }

  componentWillUnmount() {
    this._unListenHistory && this._unListenHistory();
    window.removeEventListener('focus', this._focusHandler);
  }

  componentDidMount() {
    this._unListenHistory = history.listen((location: any, action: string) => {
      if (action === 'PUSH') {
        this._upgradeHandler.upgradeIfAvailable();
      }
    });

    window.addEventListener('focus', this._focusHandler);

    analytics.bootstrap();
  }

  public render() {
    const { globalLoading } = this._appStore;
    return (
      <>
        <link
          rel="stylesheet"
          type="text/css"
          href={config.get('iconLink')}
          crossOrigin="anonymous"
        />
        <ThemeProvider>
          {globalLoading ? (
            <JuiContentLoader />
          ) : (
            <>
              <Title />
              <TopBanner />
              <Router />
              <AboutView />
              {window.jupiterElectron && <ElectronBadgeWithAppUmi />}
            </>
          )}
        </ThemeProvider>
        <script
          src={`${getGlobalValue(
            GLOBAL_KEYS.STATIC_HTTP_SERVER,
          )}/scripts/codemirror/5.36.1/codemirror_condensed.min.js?v=5.36.1&h=3`}
        />
      </>
    );
  }

  private _focusHandler = () => {
    this._upgradeHandler.upgradeIfAvailable();
  }
}
const HotApp = hot(module)(App);

export { HotApp as App };
export default HotApp;
