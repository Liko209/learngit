/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { MenuViewModelProps, MenuProps } from './types';
import StoreViewModel from '@/store/ViewModel';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';

class MenuViewModel extends StoreViewModel<MenuProps>
  implements MenuViewModelProps {
  private _GroupService: GroupService = GroupService.getInstance();
  @computed
  get personId() {
    return this.props.personId;
  }

  @computed
  get groupId() {
    return this.props.groupId;
  }

  private _renderFlashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  containErrorHander = (serviceFunction: Function) => async ([
    NetworkError,
    BackendError,
  ]: string[]) => {
    try {
      await serviceFunction();
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this._renderFlashToast(NetworkError);
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this._renderFlashToast(BackendError);
        return false;
      }
      throw error;
    }
  }

  @action
  removeFromTeam = async () => {
    try {
      await this._GroupService.removeTeamMembers([this.personId], this.groupId);
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this._renderFlashToast('removeMemberNetworkError');
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this._renderFlashToast('removeMemberBackendError');
        return false;
      }
      throw error;
    }
  }
  @action
  toggleTeamAdmin = async () => {
    const { isThePersonAdmin } = this.props;
    try {
      if (isThePersonAdmin) {
        await this._GroupService.makeAdmin(this.groupId, this.personId);
      } else {
        await this._GroupService.revokeAdmin(this.groupId, this.personId);
      }
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this._renderFlashToast('removeMemberNetworkError');
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this._renderFlashToast('removeMemberBackendError');
        return false;
      }
      throw error;
    }
  }
}
export { MenuViewModel };
