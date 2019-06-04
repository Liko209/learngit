/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:33:20
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, action } from 'mobx';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { PhoneTabConfig } from './PhoneTabConfig';
import { PhoneTabProps } from './types';

class PhoneTabRouterViewModel extends StoreViewModel<PhoneTabProps> {
  @computed
  get hasSawDialPad() {
    return PhoneTabConfig.hasShowDialPad();
  }

  @action
  setShowDialPad = () => {
    PhoneTabConfig.setShowDialPad();
  }

  @computed
  get currentTab() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_TELEPHONY_TAB);
  }
}

export { PhoneTabRouterViewModel };
