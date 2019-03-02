/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:07:32
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { computed } from 'mobx';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { BannerType } from './types';
import { ToastType } from '@/containers/ToastWrapper/Toast/types';

type BannerMap = {
  [key: string]: BannerType | null;
};

const BANNER_MAP: BannerMap = {
  online: null,
  offline: {
    message: 'common.prompt.NoInternetConnection',
    type: ToastType.ERROR,
  },
};

class NetworkBannerViewModel extends AbstractViewModel {
  @computed
  get banner() {
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    const id = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return id ? BANNER_MAP[status] : BANNER_MAP.online;
  }
}

export { NetworkBannerViewModel };
