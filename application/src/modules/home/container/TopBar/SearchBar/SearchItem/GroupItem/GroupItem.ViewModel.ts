/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:38:45
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Props } from './types';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';

class GroupItemViewModel extends StoreViewModel<Props> {
  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get canJoinTeam() {
    const { isMember, isTeam, privacy } = this.group;
    return isTeam && privacy === 'protected' && !isMember;
  }

  @computed
  get isPrivate() {
    const { isTeam, privacy } = this.group;
    return isTeam && privacy === 'private';
  }

  @computed
  get isJoined() {
    const { isTeam, privacy, isMember } = this.group;
    return isTeam && privacy === 'protected' && isMember;
  }

  @computed
  get hovered() {
    const { sectionIndex, selectIndex, cellIndex } = this.props;
    return sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
  }
}

export { GroupItemViewModel };
