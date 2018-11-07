/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-08-03 14:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import ThemeProvider from '@/containers/ThemeProvider';

import { AuthRoute } from '@/containers/AuthRoute';
import Login from '@/containers/Login';
import { Home } from '@/containers/Home';
import UnifiedLogin from '@/containers/UnifiedLogin';
import VersionInfo from '@/containers/VersionInfo';
import { autorun, computed } from 'mobx';
import { observer } from 'mobx-react';
import history from '@/utils/history';
import _ from 'lodash';
import storeManager from '@/store';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { GLOBAL_KEYS } from './store/constants';
import { analytics } from '@/Analytics';
import { AboutView } from './containers/About';

@observer
class App extends React.Component {
  private appName = process.env.APP_NAME || '';
  componentDidMount() {
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
    const {
      isShowDialog,
      appVersion,
      electronVersion,
    } = this.dialogInfo;
    return (
      <ThemeProvider>
        {this.isLoading ? (
          <JuiContentLoader />
        ) : (
          <>
            <Router history={history}>
              <Switch>
                <Route path="/commit-info" component={VersionInfo} />
                <Route path="/version" component={VersionInfo} />
                <Route path="/login" component={Login} />
                <Route path="/unified-login" component={UnifiedLogin} />
                <AuthRoute path="/" component={Home} />
              </Switch>
            </Router>
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

export default hot(module)(App);
