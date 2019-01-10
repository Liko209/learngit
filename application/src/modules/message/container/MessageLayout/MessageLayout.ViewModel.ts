/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-11 00:27:51
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { MessageLayoutProps } from './types';

class MessageLayoutViewModel extends StoreViewModel<MessageLayoutProps> {
  @computed
  get isLeftNavOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
  }
}
export { MessageLayoutViewModel };
