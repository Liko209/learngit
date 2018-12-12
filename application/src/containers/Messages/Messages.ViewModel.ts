/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:53
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import _ from 'lodash';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';

import { GLOBAL_KEYS } from '@/store/constants';
import { MessagesProps } from './types';

class MessagesViewModel extends AbstractViewModel<MessagesProps> {
  @computed
  get isLeftNavOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_LEFT_NAV_OPEN);
  }
}

export { MessagesViewModel };
