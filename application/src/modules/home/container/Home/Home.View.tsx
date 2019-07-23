/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { HomeStore } from '@/modules/home/store'; // TELEPHONY_SERVICE
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { ToastWrapper } from '@/containers/ToastWrapper';

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
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RuiLink } from 'rcui/components/Link';

type Props = WithTranslation & HomeViewProps;

@observer
class HomeViewComponent extends Component<Props> {
  private _homeStore: HomeStore = container.get(HomeStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  componentDidMount() {
    const { t } = this.props;
    window.addEventListener('storage', this._storageEventHandler);
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    accountService.makeSureUserInWhitelist();
    if (window.jupiterElectron && window.jupiterElectron.onCheckNativeUpgrade) {
      window.jupiterElectron.onCheckNativeUpgrade();
    }

    Notification.flagToast({
      message: (
        <div>
          {t('home.confirmEmergencyAddress')}
          <RuiLink>Confirm address now.</RuiLink>
        </div>
      ),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: true,
    });
    this._telephonyService.openE911();
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

const HomeView = withTranslation('translations')(HomeViewComponent);

export { HomeView };
