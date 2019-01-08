/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { ToastWrapper } from '@/containers/ToastWrapper';
import { DialogPortal } from '@/containers/Dialog';
import { Message } from '@/modules/message';
import { analytics } from '@/Analytics';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import NotFound from '../NotFound';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { HomeViewProps } from './types';

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
            <Route path="/messages/:id?" component={Message} />
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
