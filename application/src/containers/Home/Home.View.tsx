/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { TopBar } from '@/containers/TopBar';
import { Messages } from '@/containers/Messages';
import { LeftNav } from '@/containers/LeftNav';
import { CreateTeam } from '@/containers/CreateTeam';
import NotFound from '@/containers/NotFound';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import { analytics } from '@/Analytics';
import { AboutView } from '../About';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

@observer
class Home extends Component<HomeViewProps> {
  componentDidMount() {
    analytics.identify();
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
  render() {
    const {
      isShowDialog,
      appVersion,
      electronVersion,
    } = this.dialogInfo;
    return (
      <Wrapper>
        <TopBar />
        <Bottom>
          <LeftNav />
          <Switch>
            <Redirect exact={true} from="/" to="/messages/" />
            <Route path="/messages/:id?" component={Messages} />
            <Route component={NotFound} />
          </Switch>
        </Bottom>
        <CreateTeam />
        <AboutView
          isShowDialog={isShowDialog}
          electronVersion={electronVersion}
          appVersion={appVersion}
        />
      </Wrapper>
    );
  }
}

const HomeView = withRouter(Home);
export { HomeView };
