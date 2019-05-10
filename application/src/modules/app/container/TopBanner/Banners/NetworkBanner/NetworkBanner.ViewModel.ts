/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:07:32
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { computed } from 'mobx';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

class NetworkBannerViewModel extends AbstractViewModel {
  @computed
  get isShow() {
    const status = getGlobalValue(GLOBAL_KEYS.NETWORK);
    const id = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return !!id && status === 'offline';
  }
}

export { NetworkBannerViewModel };
