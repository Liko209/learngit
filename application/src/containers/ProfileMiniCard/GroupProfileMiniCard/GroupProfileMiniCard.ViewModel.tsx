/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  GroupProfileMiniCardProps,
  GroupProfileMiniCardViewProps,
} from './types';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

class GroupProfileMiniCardViewModel
  extends AbstractViewModel<GroupProfileMiniCardProps>
  implements GroupProfileMiniCardViewProps {
  @computed
  get id() {
    // conversation id
    return this.props.id;
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get name() {
    return this._group.displayName;
  }
}

export { GroupProfileMiniCardViewModel };
