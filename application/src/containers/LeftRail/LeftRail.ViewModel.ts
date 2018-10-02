/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:35
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { SECTION_TYPE } from './Section/constants';

class LeftRailViewModel extends AbstractViewModel {
  @computed
  get sections(): SECTION_TYPE[] {
    return [
      // SECTION_TYPE.UNREAD,
      // SECTION_TYPE.AT_MENTION,
      // SECTION_TYPE.BOOKMARK,
      SECTION_TYPE.FAVORITE,
      SECTION_TYPE.DIRECT_MESSAGE,
      SECTION_TYPE.TEAM,
    ];
  }
}

export { LeftRailViewModel };
