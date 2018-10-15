/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:35
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { SECTION_TYPE } from './Section/types';
import { LeftRailViewProps, LeftRailProps } from './types';
import StoreViewModel from '@/store/ViewModel';

class LeftRailViewModel extends StoreViewModel<LeftRailProps>
  implements LeftRailViewProps {
  @computed
  get currentGroupId() {
    return this.props.currentGroupId;
  }

  @computed
  get sections(): SECTION_TYPE[] {
    return [
      SECTION_TYPE.FAVORITE,
      SECTION_TYPE.DIRECT_MESSAGE,
      SECTION_TYPE.TEAM,
    ];
  }
}

export { LeftRailViewModel };
