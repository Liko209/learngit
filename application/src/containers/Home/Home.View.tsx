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
import NotFound from '@/containers/NotFound';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import { analytics } from '@/Analytics';
import { ToastWrapper } from '@/containers/ToastWrapper';
import { DialogPortal } from '@/containers/Dialog';

@observer
class Home extends Component<HomeViewProps> {
  componentDidMount() {
    analytics.identify();
  }

  render() {
    return (
      <Wrapper>
        <TopBar />
        <Bottom>
          <ToastWrapper />
          <LeftNav />
          <Switch>
            <Redirect exact={true} from="/" to="/messages/" />
            <Route path="/messages/:id?" component={Messages} />
            <Route component={NotFound} />
          </Switch>
          <DialogPortal />
        </Bottom>
      </Wrapper>
    );
  }
}

const HomeView = withRouter(Home);
export { HomeView };
