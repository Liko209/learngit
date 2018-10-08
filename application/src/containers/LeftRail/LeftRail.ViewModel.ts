/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:35
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { SECTION_TYPE } from './Section/types';
import { LeftRailProps, LeftRailViewProps } from './types';

class LeftRailViewModel extends AbstractViewModel implements LeftRailViewProps {
  @observable
  currentGroupId: number;

  onReceiveProps(props: LeftRailProps) {
    if (this.currentGroupId !== props.currentGroupId) {
      this.currentGroupId = props.currentGroupId;
    }
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
