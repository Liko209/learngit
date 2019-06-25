/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { AccountService } from 'sdk/module/account';
import { StoreViewModel } from '@/store/ViewModel';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Props, ViewProps } from './types';
import { container } from 'framework';
import { TelephonyService } from '@/modules/telephony/service';
import { Dialog } from '@/containers/Dialog';
import i18nT from '@/utils/i18nT';
import { mainLogger } from 'sdk';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { UploadRecentLogs } from '@/modules/feedback';

const globalStore = storeManager.getGlobalStore();

class AvatarActionsViewModel extends StoreViewModel<Props>
  implements ViewProps {
  @observable
  private _isShowDialog: boolean = false;

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  async canSignOut() {
    let callCount = 0;
    let telephonyService: TelephonyService | null = null;
    try {
      telephonyService = container.get<TelephonyService>(TELEPHONY_SERVICE);
      callCount = telephonyService.getAllCallCount();
    } catch (e) {
      mainLogger.info(
        '[AvatarActionsViewModel] [UI TelephonyService] User has no Telephony permission: ${e}',
      );
    }

    const title = await i18nT('telephony.prompt.LogoutTitle');
    const content = await i18nT('telephony.prompt.LogoutContent');
    const okText = await i18nT('telephony.prompt.LogoutOk');
    const cancelText = await i18nT('common.dialog.cancel');

    if (callCount > 0) {
      Dialog.confirm({
        title,
        content,
        okText,
        cancelText,
        onOK: () => {
          mainLogger.info(
            `[AvatarActionsViewModel] [UI TelephonyService] User confirmed to logout and current call count: ${callCount}`,
          );
          // For firefox, its beforeunload event will emit first, so we should hangup call here, then there will be no duplicate alert.
          if (telephonyService) {
            telephonyService.hangUp();
          }
          this._doLogout();
        },
        onCancel: () => {
          mainLogger.info(
            `[AvatarActionsViewModel] [UI TelephonyService] User canceled to logout and current call count: ${callCount}`,
          );
        },
      });
      return false;
    }
    return true;
  }

  @action
  handleSignOut = async () => {
    !!(await this.canSignOut()) && this._doLogout();
  }

  private _doLogout = async () => {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );
    await accountService.logout();
    window.location.href = '/';
  }

  @action
  toggleAboutPage = (electronAppVersion?: string, electronVersion?: string) => {
    globalStore.set(GLOBAL_KEYS.ELECTRON_APP_VERSION, electronAppVersion || '');
    globalStore.set(GLOBAL_KEYS.ELECTRON_VERSION, electronVersion || '');
    globalStore.set(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG, !this._isShowDialog);
  }

  handleSendFeedback = () => {
    UploadRecentLogs.show();
  }
}

export { AvatarActionsViewModel };
