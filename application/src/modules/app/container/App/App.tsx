/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
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

class App extends React.Component {
  // TODO use @lazyInject(Upgrade)
  private readonly _upgradeHandler: Upgrade = container.get(Upgrade);
  private appName = process.env.APP_NAME || '';
  private _unListenHistory: VoidFunction;

  componentWillUnmount() {
    this._unListenHistory && this._unListenHistory();
  }

  componentDidMount() {
    this._unListenHistory = history.listen((location: any, action: string) => {
      if (action === 'PUSH') {
        this._upgradeHandler.upgradeIfAvailable();
      }
    });

    analytics.bootstrap();
  }

  get dialogInfo() {
    const globalStore = storeManager.getGlobalStore();
    const isShowDialog = globalStore.get(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG);
    const appVersion = globalStore.get(GLOBAL_KEYS.APP_VERSION);
    const electronVersion = globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION);
    return {
      isShowDialog,
      appVersion,
      electronVersion,
    };
  }
  public render() {
    const { isShowDialog, appVersion, electronVersion } = this.dialogInfo;
    return (
      <ThemeProvider>
        {this.isLoading ? (
          <JuiContentLoader />
        ) : (
          <>
            <TopBanner />
            <Router />
            <AboutView
              isShowDialog={isShowDialog}
              appVersion={appVersion}
              electronVersion={electronVersion}
            />
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
}
const HotApp = hot(module)(App);

export { HotApp as App };
export default HotApp;
