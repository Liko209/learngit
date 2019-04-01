/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import { analytics } from '@/Analytics';
import { ToastWrapper } from '@/containers/ToastWrapper';

import { HomeRouter } from '../HomeRouter';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import Wrapper from './Wrapper';

import { dao, mainLogger } from 'sdk';
import { AuthService } from 'sdk/service/auth/authService';
import { ModalPortal } from '@/containers/Dialog';
import { Dialer } from '@/modules/telephony';
import { GlobalSearch } from '@/modules/GlobalSearch';

@observer
class HomeView extends Component<HomeViewProps> {
  componentDidMount() {
    window.addEventListener('storage', this._storageEventHandler);
    const authService: AuthService = AuthService.getInstance();
    authService.makeSureUserInWhitelist();

    analytics.identify();
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this._storageEventHandler);
  }

  private _storageEventHandler = (event: StorageEvent) => {
    if (!event.key) {
      mainLogger.info('Local storage is cleared by another document');

      window.location.reload();
    }

    if (event.key === dao.ACCOUNT_USER_ID_KEY) {
      mainLogger.info(
        `${dao.ACCOUNT_USER_ID_KEY} is modified by another document ${
          event.oldValue
        } to ${event.newValue} `,
      );

      window.location.reload();
    }
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
          </Bottom>
          <ModalPortal />
          <Dialer />
          <GlobalSearch />
        </Wrapper>
      </>
    );
  }
}

export { HomeView };
