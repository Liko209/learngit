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
import defaultGroupAvatar from 'jui/assets/jupiter-icon/icon-default-group-avatar.svg';
import defaultTeamAvatar from 'jui/assets/jupiter-icon/icon-default-team-avatar.svg';

class GroupAvatarViewModel extends AbstractViewModel<GroupAvatarProps>
  implements GroupAvatarViewProps {
  get _cid() {
    return this.props.cid; // conversation id
  }

  @computed
  private get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this._cid);
  }

  @computed
  get icon() {
    return this._group.isTeam ? defaultTeamAvatar : defaultGroupAvatar;
  }
}

export { GroupAvatarViewModel };
