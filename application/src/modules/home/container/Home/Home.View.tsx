/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { HomeStore } from '@/modules/home/store';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { ToastWrapper } from '@/containers/ToastWrapper';

import { ActivityTimer } from '../ActivityTimer';
import { HomeRouter } from '../HomeRouter';
import { LeftNav } from '../LeftNav';
import { TopBar } from '../TopBar';
import Bottom from './Bottom';
import { HomeViewProps } from './types';
import Wrapper from './Wrapper';

import { dao, mainLogger } from 'sdk';
import { AccountService } from 'sdk/module/account';
import { ModalPortal } from '@/containers/Dialog';
import { GlobalSearch } from '@/modules/GlobalSearch';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AboutView } from '@/containers/About';

@observer
class HomeView extends Component<HomeViewProps> {
  private _homeStore: HomeStore = container.get(HomeStore);

  constructor(props: HomeViewProps) {
    super(props);
  }
  componentDidMount() {
    window.addEventListener('storage', this._storageEventHandler);
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    accountService.makeSureUserInWhitelist();
    if (window.jupiterElectron && window.jupiterElectron.onCheckNativeUpgrade) {
      window.jupiterElectron.onCheckNativeUpgrade();
    }
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
  };

  render() {
    const { showGlobalSearch } = this.props;

    const { extensions } = this._homeStore;
    return (
      <>
        <ToastWrapper />
        <Wrapper>
          <ActivityTimer />
          <TopBar />
          <Bottom id="app-main-section">
            <LeftNav />
            <HomeRouter />
          </Bottom>
          <ModalPortal />
          <AboutView />
          {extensions['root'] &&
            [...extensions['root']].map((Extension: React.ComponentType) => (
              <Extension key={`HOME_EXTENSION_${Extension.displayName}`} />
            ))}
          {showGlobalSearch && <GlobalSearch />}
        </Wrapper>
      </>
    );
  }
}

export { HomeView };
