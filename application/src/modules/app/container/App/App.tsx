/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import { container } from 'framework';
import ThemeProvider from '@/containers/ThemeProvider';
import { autorun, computed } from 'mobx';
import history from '@/history';
import _ from 'lodash';
import storeManager from '@/store';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { GLOBAL_KEYS } from '@/store/constants';
import { analytics } from '@/Analytics';
import { AboutView } from '@/containers/About';
import { TopBanner } from '@/containers/TopBanner';
import { Router } from '@/modules/router';
import { Upgrade } from '@/modules/service-worker';
import { generalErrorHandler } from '@/utils/error';

@observer
class App extends React.Component {
  // TODO use @lazyInject(Upgrade)
  private readonly _upgradeHandler: Upgrade = container.get(Upgrade);
  private appName = process.env.APP_NAME || '';
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
    return (
      <ThemeProvider>
        {this.isLoading ? (
          <JuiContentLoader />
        ) : (
          <>
            <TopBanner />
            <Router />
            <AboutView />
          </>
        )}
      </ThemeProvider>
    );
  }

  constructor(props: any) {
    super(props);
    autorun(() => {
      this.updateAppUmi();
    });
  }

  @computed
  get isLoading() {
    return storeManager
      .getGlobalStore()
      .get(GLOBAL_KEYS.APP_SHOW_GLOBAL_LOADING);
  }

  updateAppUmi() {
    const appUmi = storeManager.getGlobalStore().get(GLOBAL_KEYS.APP_UMI);
    if (appUmi) {
      document.title = `(${appUmi}) ${this.appName}`;
    } else {
      document.title = this.appName;
    }
    if (window.jupiterElectron && window.jupiterElectron.setBadgeCount) {
      window.jupiterElectron.setBadgeCount(appUmi || 0);
    }
  }

  private _focusHandler() {
    this._upgradeHandler.upgradeIfAvailable();
  }
}
const HotApp = hot(module)(App);

export { HotApp as App };
export default HotApp;
