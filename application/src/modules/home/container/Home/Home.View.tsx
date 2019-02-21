/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { analytics } from '@/Analytics';
import { DialogPortal } from '@/containers/Dialog';
import { ToastWrapper } from '@/containers/ToastWrapper';

import { HomeRouter } from '../HomeRouter';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import Wrapper from './Wrapper';

import { AuthService } from 'sdk/service/auth/authService';

@observer
class HomeView extends Component<HomeViewProps> {
  componentDidMount() {
    const authService: AuthService = AuthService.getInstance();
    authService.makeSureUserInWhitelist();

    analytics.identify();
  }

  render() {
    return (
      <>
        <ToastWrapper />
        <Wrapper>
          <TopBar />
          <Bottom id="app-main-section">
            <LeftNav />
            <HomeRouter />
            <DialogPortal />
          </Bottom>
        </Wrapper>
      </>
    );
  }
}

export { HomeView };
