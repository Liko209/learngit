/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { Props, ViewProps } from './types';

const globalStore = storeManager.getGlobalStore();

class NewActionsViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  get isShowNewMessageDialog() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG) || false;
  }

  @computed
  get isShowCreateTeamDialog() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG) || false;
  }

  @action
  updateCreateTeamDialogState = () => {
    const isShowCreateTeamDialog = !globalStore.get(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
    );
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG,
      isShowCreateTeamDialog,
    );
  }

  @action
  updateNewMessageDialogState = () => {
    const isShowNewMessageDialog = !globalStore.get(
      GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG,
    );
    globalStore.set(
      GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG,
      isShowNewMessageDialog,
    );
  }
}

export { NewActionsViewModel };
