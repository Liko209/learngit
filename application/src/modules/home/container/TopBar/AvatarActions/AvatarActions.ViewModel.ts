/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { AuthService } from 'sdk/service';
import { StoreViewModel } from '@/store/ViewModel';
import storeManager from '@/store';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { Props, ViewProps } from './types';

const globalStore = storeManager.getGlobalStore();

class AvatarActionsViewModel extends StoreViewModel<Props>
  implements ViewProps {
  @observable
  private _isShowDialog: boolean = false;
  @observable
  isUploadingFeedback: boolean = false;

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @action
  handleSignOut = async () => {
    const authService: AuthService = AuthService.getInstance();
    await authService.logout();
    window.location.href = '/';
  }

  @action
  toggleAboutPage = (electronAppVersion?: string, electronVersion?: string) => {
    globalStore.set(GLOBAL_KEYS.ELECTRON_APP_VERSION, electronAppVersion || '');
    globalStore.set(GLOBAL_KEYS.ELECTRON_VERSION, electronVersion || '');
    globalStore.set(GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG, !this._isShowDialog);
  }
}

export { AvatarActionsViewModel };
