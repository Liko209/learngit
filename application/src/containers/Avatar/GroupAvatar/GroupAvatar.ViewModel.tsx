/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { GroupAvatarProps, GroupAvatarViewProps } from './types';

import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import defaultGroupAvatar from './defaultGroupAvatar.png';
import defaultTeamAvatar from './defaultTeamAvatar.png';

class GroupAvatarViewModel extends AbstractViewModel<GroupAvatarProps>
  implements GroupAvatarViewProps {
  @computed
  get _cid() {
    return this.props.cid; // conversation id
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._cid);
  }

  @computed
  get src() {
    return this._group.isTeam ? defaultTeamAvatar : defaultGroupAvatar;
  }
}

export { GroupAvatarViewModel };
