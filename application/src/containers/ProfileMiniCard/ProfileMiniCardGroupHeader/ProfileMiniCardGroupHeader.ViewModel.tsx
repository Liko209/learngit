/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ProfileMiniCardGroupHeaderProps,
  ProfileMiniCardGroupHeaderViewProps,
} from './types';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';

class ProfileMiniCardGroupHeaderViewModel
  extends AbstractViewModel<ProfileMiniCardGroupHeaderProps>
  implements ProfileMiniCardGroupHeaderViewProps {
  @computed
  get id() {
    return this.props.id; // conversation id
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }
}

export { ProfileMiniCardGroupHeaderViewModel };
