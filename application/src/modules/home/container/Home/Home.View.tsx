/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 09:40:36
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { HomeStore } from '@/modules/home/store';
import { notificationCenter, SERVICE } from 'sdk/service';

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

import { dao } from 'sdk';
import { mainLogger } from 'foundation/log';
import { AccountService } from 'sdk/module/account';
import { ModalPortal } from '@/containers/Dialog';
import { GlobalSearch } from '@/modules/GlobalSearch';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AboutView } from '@/containers/About';
import { Notification, notificationKey } from '@/containers/Notification';
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
  constructor(props: Props) {
    super(props);
    notificationCenter.on(
      SERVICE.RC_INFO_SERVICE.E911_UPDATED,
      this.showE911Confirm,
    );
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
    notificationCenter.off(
      SERVICE.RC_INFO_SERVICE.E911_UPDATED,
      this.showE911Confirm,
    );
  }

  showE911Confirm = async () => {
    const {
      openE911,
      t,
      needConfirmE911,
      markE911,
      shouldShowE911,
    } = this.props;
    if (shouldShowE911()) {
      return;
    }

    const need = await needConfirmE911();
    if (!need) {
      return;
    }

    const flagToast = Notification.flagToast({
      key: notificationKey.E911_TOAST,
      message: (
        <>
          {`${t('home.confirmEmergencyAddress')} `}
          <RuiLink
            underline
            color="white"
            handleOnClick={() => {
              openE911();
              markE911();
              flagToast.dismiss && flagToast.dismiss();
            }}
          >
            {t('home.confirmAddressNow')}
          </RuiLink>
        </>
      ),
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: true,
      onClose: markE911,
    });
  };

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

const HomeView = withTranslation('translations')(HomeViewComponent);

export { HomeView };
