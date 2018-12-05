/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:07:32
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { computed } from 'mobx';
import { JuiSnackbarsType } from 'jui/components/Snackbars';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
const MESSAGE_MAP = {
  online: '',
  offline: 'NoInternetConnection',
};

type MessageMapType = {
  [key: string]: string;
};

const TYPE_MAP: TypeMapType = {
  online: 'info',
  offline: 'error',
};

type TypeMapType = {
  [key: string]: JuiSnackbarsType;
};

type ShowMapType = {
  [key: string]: boolean;
};
const SHOW_MAP: ShowMapType = {
  online: false,
  offline: true,
};

class NetworkBannerViewModel extends AbstractViewModel {
  private _getMessage(type: string, map: MessageMapType): string {
    return map[type];
  }

  private _getType(type: string, map: TypeMapType) {
    return map[type];
  }

  private _shouldShow(status: string, map: ShowMapType) {
    return map[status];
  }

  @computed
  get config() {
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    return {
      shouldShow: this._shouldShow(status, SHOW_MAP),
      message: this._getMessage(status, MESSAGE_MAP),
      type: this._getType(status, TYPE_MAP),
    };
  }
}

export { NetworkBannerViewModel };
